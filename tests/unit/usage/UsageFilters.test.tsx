import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { UsageFilters } from '@/components/usage/UsageFilters'
import { readUsageFiltersFromSearchParams } from '@/lib/usageFilters'

describe('UsageFilters URL sync', () => {
  it('parses agent_kind=support from URL', () => {
    const params = new URLSearchParams({ agent_kind: 'support' })
    const filters = readUsageFiltersFromSearchParams(params)

    expect(filters.agent_kind).toBe('support')
  })

  it('parses audit_id from search params and displays chip', () => {
    const auditId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
    const params = new URLSearchParams({ audit_id: auditId })
    const filters = readUsageFiltersFromSearchParams(params)

    expect(filters.audit_id).toBe(auditId)

    render(
      <UsageFilters
        values={filters}
        onChange={() => undefined}
        onApply={() => undefined}
        onReset={() => undefined}
      />,
    )

    expect(screen.getByTestId('usage-audit-id-chip')).toHaveTextContent(auditId)
  })
})
