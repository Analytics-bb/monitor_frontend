import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DegradedBanner } from '@/components/monitoring/DegradedBanner'

describe('DegradedBanner', () => {
  it('is visible when degraded flag is true', () => {
    render(<DegradedBanner visible onRetry={() => undefined} />)
    expect(screen.getByTestId('degraded-banner')).toBeInTheDocument()
  })

  it('is hidden when not degraded', () => {
    render(<DegradedBanner visible={false} />)
    expect(screen.queryByTestId('degraded-banner')).not.toBeInTheDocument()
  })
})
