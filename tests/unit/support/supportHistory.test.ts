import { describe, expect, it } from 'vitest'

import type { SupportMessage } from '@/api/fixtures/supportChatSnapshot'
import {
  countSupportHistoryMessages,
  getSupportHistoryFillRatio,
  isSupportHistoryLimitReached,
} from '@/lib/supportHistory'

describe('supportHistory', () => {
  const messages: SupportMessage[] = [
    {
      message_id: '22222222-2222-4222-8222-222222222222',
      role: 'user',
      content: 'hi',
      created_at: '2025-07-14 10:00:00',
    },
    {
      message_id: '33333333-3333-4333-8333-333333333333',
      role: 'assistant',
      content: 'hello',
      created_at: '2025-07-14 10:00:05',
    },
    {
      message_id: '44444444-4444-4444-8444-444444444444',
      role: 'system',
      content: 'ctx',
      created_at: '2025-07-14 10:00:01',
    },
  ]

  it('counts only user and assistant messages', () => {
    expect(countSupportHistoryMessages(messages)).toBe(2)
  })

  it('caps fill ratio at 1', () => {
    expect(getSupportHistoryFillRatio(50, 40)).toBe(1)
    expect(getSupportHistoryFillRatio(10, 40)).toBe(0.25)
  })

  it('detects history limit reached', () => {
    expect(isSupportHistoryLimitReached(40, 40)).toBe(true)
    expect(isSupportHistoryLimitReached(39, 40)).toBe(false)
  })
})
