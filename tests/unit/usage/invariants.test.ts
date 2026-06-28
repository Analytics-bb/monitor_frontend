import { describe, expect, it } from 'vitest'

import { agentUsageRunSchema } from '@/api/fixtures/agentUsageRun'

describe('usage module invariants', () => {
  it('uses OpenAPI M14 field names and avoids legacy usage totals', () => {
    const shape = agentUsageRunSchema.shape

    expect(shape.prompt_tokens).toBeDefined()
    expect(shape.completion_tokens).toBeDefined()
    expect(shape.estimated_cost_usd).toBeDefined()
    expect(shape.step_breakdown).toBeDefined()

    expect(shape).not.toHaveProperty('tokens_in')
    expect(shape).not.toHaveProperty('tokens_out')
    expect(shape).not.toHaveProperty('cost_usd')
    expect(shape).not.toHaveProperty('usage_total')
  })
})
