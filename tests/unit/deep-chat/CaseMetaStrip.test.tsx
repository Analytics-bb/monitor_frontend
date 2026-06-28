import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CaseMetaStrip } from '@/components/deep/CaseMetaStrip'

describe('CaseMetaStrip', () => {
  it('renders gate id, gate name and detection time', () => {
    render(
      <CaseMetaStrip
        gateId="42"
        gateName="Gate 42"
        createdAt="2025-07-14 12:30:00"
      />,
    )

    expect(screen.getByText('42')).toBeVisible()
    expect(screen.getByText('Gate 42')).toBeVisible()
    expect(screen.getByText(/2025-07-14 12:30:00 MSK/)).toBeVisible()
  })

  it('shows dash when gate name is missing', () => {
    render(<CaseMetaStrip gateId="42" createdAt="2025-07-14 12:30:00" />)

    expect(screen.getByText('—')).toBeVisible()
  })
})
