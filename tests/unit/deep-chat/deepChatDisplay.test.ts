import { describe, expect, it } from 'vitest'

import type { ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import { auditSummaryFixtureContent, deepAgentSummaryFixtureContent } from '@/api/fixtures/auditSummaryFixture'
import {
  buildDeepChatDisplayMessages,
  createAwaitingReplyBaseline,
  extractHypothesisConclusionFromSystem,
  hasAssistantReplySinceBaseline,
  hasUserMessagesInSnapshot,
  isHypothesisEchoContent,
  resolveConclusionForInitialMessage,
} from '@/lib/deepChatDisplay'
import { mergeChatSnapshot } from '@/lib/deepChatSnapshotMerge'

const baseSnapshot: ChatSnapshot = {
  audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  session_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  state: 'active',
  messages: [],
  pending_action: null,
}

describe('deepChatDisplay', () => {
  it('extracts hypothesis conclusion from system message', () => {
    const conclusion = extractHypothesisConclusionFromSystem(
      `gate_id: 1001\nconclusion: <article>alert</article>\nhypothesis_prompt: prompt`,
    )

    expect(conclusion).toBe('<article>alert</article>')
  })

  it('detects hypothesis echo in assistant message', () => {
    expect(
      isHypothesisEchoContent(
        auditSummaryFixtureContent,
        auditSummaryFixtureContent,
      ),
    ).toBe(true)
    expect(isHypothesisEchoContent(auditSummaryFixtureContent)).toBe(false)
    expect(
      isHypothesisEchoContent(
        'success_rate LOW @ 1001\n\n<article>x</article>',
      ),
    ).toBe(true)
  })

  it('resolves initial conclusion from system over seed', () => {
    const snapshot: ChatSnapshot = {
      ...baseSnapshot,
      messages: [
        {
          role: 'system',
          content: `conclusion: ${auditSummaryFixtureContent}`,
        },
      ],
    }

    expect(
      resolveConclusionForInitialMessage(snapshot, 'seed fallback'),
    ).toBe(auditSummaryFixtureContent)
  })

  it('renders API user message with hypothesis variant when content matches conclusion', () => {
    const messages = buildDeepChatDisplayMessages({
      ...baseSnapshot,
      messages: [
        {
          role: 'system',
          content: `conclusion: ${auditSummaryFixtureContent}`,
        },
        { role: 'user', content: auditSummaryFixtureContent },
        { role: 'assistant', content: deepAgentSummaryFixtureContent },
      ],
    })

    expect(messages).toHaveLength(2)
    expect(messages[0]).toMatchObject({
      role: 'user',
      variant: 'hypothesis',
    })
  })

  it('detects user messages in snapshot', () => {
    expect(hasUserMessagesInSnapshot(baseSnapshot)).toBe(false)
    expect(
      hasUserMessagesInSnapshot({
        ...baseSnapshot,
        messages: [{ role: 'user', content: 'hello' }],
      }),
    ).toBe(true)
  })
})

describe('deepChatSnapshotMerge', () => {
  it('keeps messages from previous snapshot when GET returns stale short list', () => {
    const full: ChatSnapshot = {
      ...baseSnapshot,
      messages: [
        { role: 'system', content: 'gate_id: 42', message_id: 'sys-1' },
        {
          role: 'assistant',
          content: deepAgentSummaryFixtureContent,
          message_id: 'asst-1',
        },
        { role: 'user', content: 'Проверь логи', message_id: 'user-1' },
      ],
    }

    const stale: ChatSnapshot = {
      ...full,
      messages: full.messages.slice(0, 2),
    }

    const merged = mergeChatSnapshot(full, stale)
    expect(merged.messages).toHaveLength(3)
    expect(merged.messages.at(-1)?.content).toBe('Проверь логи')
  })

  it('keeps user message when GET returns same-length stale list', () => {
    const full: ChatSnapshot = {
      ...baseSnapshot,
      messages: [
        { role: 'assistant', content: 'reply', message_id: 'asst-1' },
        { role: 'user', content: 'новый вопрос', message_id: 'user-2' },
      ],
    }

    const stale: ChatSnapshot = {
      ...full,
      messages: [
        { role: 'assistant', content: 'reply', message_id: 'asst-1' },
        { role: 'user', content: 'hi', message_id: 'user-1' },
      ],
    }

    const merged = mergeChatSnapshot(full, stale)
    expect(merged.messages).toHaveLength(3)
    expect(merged.messages.some((message) => message.content === 'новый вопрос')).toBe(
      true,
    )
  })
})

describe('awaiting reply baseline', () => {
  it('ignores stale poll with old assistant after previous user', () => {
    const baseline = createAwaitingReplyBaseline(
      {
        ...baseSnapshot,
        messages: [
          { role: 'user', content: 'hi', message_id: 'user-1' },
          { role: 'assistant', content: 'ответ', message_id: 'asst-1' },
        ],
      },
      { additionalUsers: 1 },
    )

    expect(
      hasAssistantReplySinceBaseline(
        {
          ...baseSnapshot,
          messages: [
            { role: 'user', content: 'hi', message_id: 'user-1' },
            { role: 'assistant', content: 'ответ', message_id: 'asst-1' },
          ],
        },
        baseline,
      ),
    ).toBe(false)
  })

  it('detects new assistant after pending user landed in snapshot', () => {
    const baseline = createAwaitingReplyBaseline(
      {
        ...baseSnapshot,
        messages: [
          { role: 'user', content: 'hi', message_id: 'user-1' },
          { role: 'assistant', content: 'ответ', message_id: 'asst-1' },
        ],
      },
      { additionalUsers: 1 },
    )

    expect(
      hasAssistantReplySinceBaseline(
        {
          ...baseSnapshot,
          messages: [
            { role: 'user', content: 'hi', message_id: 'user-1' },
            { role: 'assistant', content: 'ответ', message_id: 'asst-1' },
            { role: 'user', content: 'новый', message_id: 'user-2' },
            { role: 'assistant', content: 'новый ответ', message_id: 'asst-2' },
          ],
        },
        baseline,
      ),
    ).toBe(true)
  })
})

describe('buildDeepChatDisplayMessages chronological', () => {
  it('preserves API order: hypothesis, assistant, user, assistant', () => {
    const messages = buildDeepChatDisplayMessages({
      ...baseSnapshot,
      messages: [
        {
          role: 'system',
          content: `conclusion: ${auditSummaryFixtureContent}\nhypothesis_prompt: x`,
        },
        {
          role: 'assistant',
          content: deepAgentSummaryFixtureContent,
          message_id: 'asst-open',
        },
        { role: 'user', content: 'Уточни по gate', message_id: 'user-1' },
        {
          role: 'assistant',
          content: '📈 Обновление\n\n• ok',
          message_id: 'asst-2',
        },
      ],
    })

    expect(messages.map((message) => message.role)).toEqual([
      'user',
      'assistant',
      'user',
      'assistant',
    ])
    expect(messages[0]?.variant).toBe('hypothesis')
    expect(messages[1]?.id).toBe('asst-open')
    expect(messages[3]?.id).toBe('asst-2')
  })

  it('shows seed hypothesis before open completes', () => {
    const messages = buildDeepChatDisplayMessages(
      { ...baseSnapshot, state: 'not_started', messages: [] },
      { seedHypothesisConclusion: 'Порог превышен' },
    )

    expect(messages).toEqual([
      expect.objectContaining({
        role: 'user',
        variant: 'hypothesis',
        content: 'Порог превышен',
      }),
    ])
  })

  it('appends optimistic user message at the end', () => {
    const messages = buildDeepChatDisplayMessages(
      {
        ...baseSnapshot,
        messages: [
          {
            role: 'assistant',
            content: deepAgentSummaryFixtureContent,
            message_id: 'asst-1',
          },
        ],
      },
      { optimisticUserMessage: 'Новый вопрос' },
    )

    expect(messages.at(-1)).toMatchObject({
      role: 'user',
      content: 'Новый вопрос',
      id: 'optimistic-user',
    })
  })

  it('appends assistant error message from last_error when missing in thread', () => {
    const messages = buildDeepChatDisplayMessages({
      ...baseSnapshot,
      state: 'error',
      messages: [],
      last_error: {
        error_code: 'pipeline_error',
        message: 'LLM недоступен',
      },
    })

    expect(messages.at(-1)).toMatchObject({
      role: 'assistant',
      content: expect.stringContaining('pipeline_error'),
    })
  })

  it('does not duplicate assistant error message already in thread', () => {
    const error = {
      error_code: 'budget_exceeded',
      message: 'Превышен лимит',
    }
    const assistantContent = `📈 **Ошибка**\n\n**Код:** \`budget_exceeded\`\n\nПревышен лимит`

    const messages = buildDeepChatDisplayMessages({
      ...baseSnapshot,
      state: 'error',
      messages: [{ role: 'assistant', content: assistantContent }],
      last_error: error,
    })

    expect(messages.filter((message) => message.role === 'assistant')).toHaveLength(1)
  })
})
