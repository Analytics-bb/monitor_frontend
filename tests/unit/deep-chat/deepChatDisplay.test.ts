import { describe, expect, it } from 'vitest'

import { auditSummaryFixtureContent } from '@/api/fixtures/auditSummaryFixture'
import type { ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import {
  buildDeepChatDisplayMessages,
  extractHypothesisConclusionFromSystem,
  isHypothesisEchoContent,
} from '@/lib/deepChatDisplay'

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
    expect(isHypothesisEchoContent(auditSummaryFixtureContent)).toBe(true)
    expect(
      isHypothesisEchoContent('success_rate LOW @ 1001\n\n<article>x</article>'),
    ).toBe(true)
    expect(isHypothesisEchoContent('Кратко: просадка tx_count')).toBe(false)
  })

  it('shows hypothesis as first user message and hides echo assistant', () => {
    const messages = buildDeepChatDisplayMessages({
      ...baseSnapshot,
      messages: [
        {
          role: 'system',
          content: `conclusion: ${auditSummaryFixtureContent}\nhypothesis_prompt: x`,
        },
        {
          role: 'assistant',
          content: auditSummaryFixtureContent,
        },
        {
          role: 'assistant',
          content: 'Кратко: просадка tx_count, предлагаю проверить upstream.',
        },
      ],
    })

    expect(messages[0]?.role).toBe('user')
    expect(messages[0]?.variant).toBe('hypothesis')
    expect(messages.at(-1)?.content).toContain('Кратко')
    expect(messages.some((message) => message.content === auditSummaryFixtureContent && message.role === 'assistant')).toBe(false)
  })

  it('appends optimistic user message before refetch', () => {
    const messages = buildDeepChatDisplayMessages(baseSnapshot, {
      optimisticUserMessage: 'Проверь таблицу tx_log',
    })

    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({
      role: 'user',
      content: 'Проверь таблицу tx_log',
    })
  })
})
