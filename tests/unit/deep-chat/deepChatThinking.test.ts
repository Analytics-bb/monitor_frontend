import { describe, expect, it } from 'vitest'

import {
  getAgentThinkingLabel,
  resolveAgentThinkingPhase,
} from '@/lib/deepChatThinking'

describe('deepChatThinking', () => {
  it('starts in forming phase', () => {
    expect(
      resolveAgentThinkingPhase({ elapsedMs: 2_000, usageIncrements: 0 }),
    ).toBe('forming')
  })

  it('switches to mcp after delay or first usage increment', () => {
    expect(
      resolveAgentThinkingPhase({ elapsedMs: 7_000, usageIncrements: 0 }),
    ).toBe('mcp')
    expect(
      resolveAgentThinkingPhase({ elapsedMs: 1_000, usageIncrements: 1 }),
    ).toBe('mcp')
  })

  it('switches to mcp_retry after multiple usage increments', () => {
    expect(
      resolveAgentThinkingPhase({ elapsedMs: 9_000, usageIncrements: 2 }),
    ).toBe('mcp_retry')
  })

  it('returns retry label for mcp_retry phase', () => {
    expect(getAgentThinkingLabel('mcp_retry')).toContain('следующая попытка')
  })
})
