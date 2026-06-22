import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StatusBadge, type StatusBadgeVariant } from '@/components/StatusBadge'

const VARIANTS: StatusBadgeVariant[] = [
  'success',
  'error',
  'skipped',
  'active',
  'awaiting_approval',
  'completed',
  'not_started',
  'cancelled',
]

describe('StatusBadge', () => {
  it.each(VARIANTS)('renders variant %s with label', (status) => {
    render(<StatusBadge status={status} />)
    expect(screen.getByLabelText(/^Статус:/)).toBeInTheDocument()
  })

  it('renders custom label', () => {
    render(<StatusBadge status="error" label="Custom error" />)
    expect(screen.getByText('Custom error')).toBeInTheDocument()
  })
})
