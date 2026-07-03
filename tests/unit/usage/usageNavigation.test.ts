import { describe, expect, it } from 'vitest'

import { buildDeepChatUsageHref, formatUsageStepSummary } from '@/lib/usageNavigation'
import { agentUsageRunFixture } from '@/api/fixtures/agentUsageRun'

describe('usageNavigation', () => {
  it('builds plain usage href without filters', () => {
    expect(buildDeepChatUsageHref()).toBe('/usage')
  })

  it('formats MCP step names for deep runs', () => {
    expect(formatUsageStepSummary(agentUsageRunFixture)).toBe(
      'mysql_query, summarize',
    )
  })

  it('shows LLM-only label when step_breakdown is empty', () => {
    expect(
      formatUsageStepSummary({
        ...agentUsageRunFixture,
        step_breakdown: [],
      }),
    ).toBe('Только LLM')
  })
})
