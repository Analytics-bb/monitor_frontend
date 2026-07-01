import { describe, expect, it } from 'vitest'

import { readUsageFiltersFromSearchParams } from '@/lib/usageFilters'

describe('usageFilters agent_kind support', () => {
  it('accepts agent_kind=support from URL', () => {
    const params = new URLSearchParams({ agent_kind: 'support' })
    const filters = readUsageFiltersFromSearchParams(params)

    expect(filters.agent_kind).toBe('support')
  })
})
