import { describe, expect, it } from 'vitest'

import {
  deepCaseSummarySchema,
  parseDeepCaseSummary,
} from '@/api/fixtures/deepCaseSummary'

describe('deepCaseSummarySchema', () => {
  it('accepts null conclusion per AgentReport contract', () => {
    const item = {
      audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      gate_id: '42',
      event_summary: 'tx_count LOW',
      conclusion: null,
      deep_chat_state: 'not_started',
      created_at: '2025-07-14 12:30:00',
    }

    expect(parseDeepCaseSummary(item)).toEqual(item)
    expect(deepCaseSummarySchema.parse(item).conclusion).toBeNull()
  })

  it('accepts omitted conclusion as null', () => {
    const item = {
      audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      gate_id: '42',
      event_summary: 'tx_count LOW',
      deep_chat_state: 'not_started',
      created_at: '2025-07-14 12:30:00',
    }

    expect(parseDeepCaseSummary(item).conclusion).toBeNull()
  })
})
