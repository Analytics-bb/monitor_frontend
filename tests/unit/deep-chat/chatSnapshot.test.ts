import { describe, expect, it } from 'vitest'

import { parseChatSnapshot } from '@/api/fixtures/chatSnapshot'

/** Урезанный ответ `GET /api/deep/cases/{audit_id}/chat` (localhost:8000). */
const liveApiChatSnapshot = {
  audit_id: '23ee6c49-f99a-4e42-8c59-924444d9a938',
  session_id: '9da825b8-0a07-4347-91da-4368b9a71233',
  state: 'active',
  messages: [
    {
      message_id: 'f1649b70-95a4-4596-bed0-ccafe39d9f9c',
      role: 'system',
      content:
        '## Audit snapshot (read-only)\naudit_id: 23ee6c49-f99a-4e42-8c59-924444d9a938\ngate_id: 1001\ndetected_at: 2026-07-02T15:03:42',
      created_at: '2026-07-02T18:52:47.239792',
    },
    {
      message_id: '7df523a1-483a-441f-b21e-d719a3cd8b16',
      role: 'assistant',
      content: 'success_rate LOW @ 1001\n\n<article>summary</article>',
      created_at: '2026-07-02T18:52:47.239792',
    },
  ],
  pending_action: null,
} as const

describe('parseChatSnapshot', () => {
  it('parses live API ChatSnapshot per docs/api.md', () => {
    const snapshot = parseChatSnapshot(liveApiChatSnapshot)

    expect(snapshot.audit_id).toBe(liveApiChatSnapshot.audit_id)
    expect(snapshot.session_id).toBe(liveApiChatSnapshot.session_id)
    expect(snapshot.state).toBe('active')
    expect(snapshot.messages).toHaveLength(2)
    expect(snapshot.pending_action).toBeNull()
    expect(snapshot.gate_id).toBe('1001')
    expect(snapshot.created_at).toBe('2026-07-02T15:03:42')
  })

  it('parses pending_action.arguments_preview', () => {
    const snapshot = parseChatSnapshot({
      ...liveApiChatSnapshot,
      state: 'awaiting_approval',
      pending_action: {
        action_id: 'act-1',
        tool_name: 'run_query',
        arguments_preview: 'SELECT 1',
        created_at: '2026-07-02T18:52:47.239792',
      },
    })

    expect(snapshot.pending_action?.arguments_preview).toBe('SELECT 1')
  })
})
