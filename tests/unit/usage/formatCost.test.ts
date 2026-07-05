import { describe, expect, it } from 'vitest'

import { formatCostUsd, formatCostUsdLabel } from '@/lib/formatCost'

describe('formatCost', () => {
  it('formats USD with 4 decimals', () => {
    expect(formatCostUsd(0.0425)).toBe('0.0425')
    expect(formatCostUsdLabel(0.0425)).toBe('$0.0425')
  })

  it('returns dash for null and NaN', () => {
    expect(formatCostUsd(null)).toBe('—')
    expect(formatCostUsdLabel(undefined)).toBe('—')
  })
})
