import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'

import {
  agentUsageRunFixture,
  agentUsageRunHypothesisFixture,
} from '@/api/fixtures/agentUsageRun'
import { UsageRunsTable } from '@/components/usage/UsageRunsTable'

describe('UsageRunsTable', () => {
  it('renders correct row count and columns', () => {
    render(
      <MemoryRouter>
        <UsageRunsTable
          items={[agentUsageRunFixture, agentUsageRunHypothesisFixture]}
        />
      </MemoryRouter>,
    )

    expect(screen.getAllByTestId('usage-runs-table-row')).toHaveLength(2)
    expect(screen.getByText('gpt-4.1')).toBeVisible()
    expect(screen.getByText('gpt-4.1-mini')).toBeVisible()
    expect(screen.getByText(/1[\s,]?200/)).toBeVisible()
  })

  it('renders step summary for deep runs', () => {
    render(
      <MemoryRouter>
        <UsageRunsTable items={[agentUsageRunFixture]} />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('usage-run-steps-cell')).toHaveTextContent(
      'mysql_query, summarize',
    )
  })

  it('renders LLM-only label when deep run has no MCP steps', () => {
    render(
      <MemoryRouter>
        <UsageRunsTable
          items={[
            {
              ...agentUsageRunFixture,
              step_breakdown: [],
            },
          ]}
        />
      </MemoryRouter>,
    )

    expect(screen.getByTestId('usage-run-steps-cell')).toHaveTextContent(
      'Только LLM',
    )
  })

  it('renders audit link when audit_id present', () => {
    render(
      <MemoryRouter>
        <UsageRunsTable items={[agentUsageRunFixture]} />
      </MemoryRouter>,
    )

    const link = screen.getByRole('link', { name: 'Открыть deep chat' })
    expect(link).toHaveAttribute(
      'href',
      `/deep/${agentUsageRunFixture.audit_id}`,
    )
    expect(link).toHaveAttribute('data-testid', 'usage-audit-link')
  })

  it('does not render audit link when audit_id is null', () => {
    render(
      <MemoryRouter>
        <UsageRunsTable items={[agentUsageRunHypothesisFixture]} />
      </MemoryRouter>,
    )

    expect(screen.queryByTestId('usage-audit-link')).not.toBeInTheDocument()
    expect(screen.getByTitle('backfill pending')).toBeVisible()
  })
})
