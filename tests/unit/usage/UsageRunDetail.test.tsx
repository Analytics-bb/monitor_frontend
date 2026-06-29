import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import { agentUsageRunFixture } from '@/api/fixtures/agentUsageRun'
import { UsageRunDetail } from '@/components/usage/UsageRunDetail'

describe('UsageRunDetail', () => {
  it('renders step_breakdown tool_name and latency_ms for deep run', () => {
    render(
      <MemoryRouter>
        <UsageRunDetail run={agentUsageRunFixture} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('usage-run-detail-header')).toBeVisible()
    expect(screen.getByRole('link', { name: 'Назад' })).toBeVisible()
    expect(
      screen.getByRole('link', { name: 'Провалиться в чат' }),
    ).toHaveAttribute('href', `/deep/${agentUsageRunFixture.audit_id}`)
    expect(screen.getByTestId('usage-step-breakdown-table')).toBeVisible()
    expect(screen.getByText('mysql_query')).toBeVisible()
    expect(screen.getByText('420')).toBeVisible()
    expect(screen.getByText('summarize')).toBeVisible()
    expect(screen.getByText('1430')).toBeVisible()
  })
})
