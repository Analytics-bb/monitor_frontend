import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { deepCaseSummaryFixture } from '@/api/fixtures/deepCaseSummary'
import { DeepCasesTable } from '@/components/deep/DeepCasesTable'

describe('DeepCasesTable', () => {
  it('renders rows with StatusBadge per chat state', () => {
    render(
      <DeepCasesTable
        items={[
          deepCaseSummaryFixture,
          {
            ...deepCaseSummaryFixture,
            audit_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
            deep_chat_state: 'active',
          },
          {
            ...deepCaseSummaryFixture,
            audit_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
            deep_chat_state: 'awaiting_approval',
          },
        ]}
      />,
    )

    expect(screen.getAllByTestId('deep-cases-table-row')).toHaveLength(3)
    expect(screen.getByLabelText('Статус: Не начат')).toBeInTheDocument()
    expect(screen.getByLabelText('Статус: Активен')).toBeInTheDocument()
    expect(screen.getByLabelText('Статус: Ожидает подтверждения')).toBeInTheDocument()
  })

  it('truncates long conclusion without breaking table layout', () => {
    const longConclusion = 'A'.repeat(200)

    render(
      <DeepCasesTable
        items={[
          {
            ...deepCaseSummaryFixture,
            conclusion: longConclusion,
          },
        ]}
      />,
    )

    const conclusionCell = screen.getByTitle(longConclusion)
    expect(conclusionCell).toHaveClass('truncate')
    expect(screen.getByTestId('deep-cases-table')).toBeInTheDocument()
  })
})
