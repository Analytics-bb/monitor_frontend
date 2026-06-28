import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { agentUsageDailyRollupFixture } from '@/api/fixtures/agentUsageRun'
import { UsageDailySummary } from '@/components/usage/UsageDailySummary'
import { sumUsageDailyRollups } from '@/lib/usageDaily'

describe('UsageDailySummary', () => {
  it('sums fixture rollups into stat cards', () => {
    const totals = sumUsageDailyRollups(agentUsageDailyRollupFixture)

    render(<UsageDailySummary rollups={agentUsageDailyRollupFixture} />)

    expect(totals.totalTokens).toBe(4150)
    expect(totals.totalCostUsd).toBeCloseTo(0.113)
    expect(totals.runCount).toBe(2)

    expect(screen.getByTestId('usage-daily-tokens')).toHaveTextContent('4')
    expect(screen.getByTestId('usage-daily-cost')).toHaveTextContent('0.1130')
    expect(screen.getByTestId('usage-daily-runs')).toHaveTextContent('2')
  })
})
