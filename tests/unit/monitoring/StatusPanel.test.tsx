import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { statusResponseFixture } from '@/api/fixtures/statusResponse'
import { StatusPanel } from '@/components/monitoring/StatusPanel'

describe('StatusPanel', () => {
  it('shows Live when poll succeeded', () => {
    render(
      <StatusPanel
        data={statusResponseFixture}
        isStale={false}
        isDegraded={false}
        onRefresh={() => undefined}
      />,
    )

    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByText(statusResponseFixture.last_tick_at!)).toBeInTheDocument()
  })

  it('shows Stale when fetch failed', () => {
    render(
      <StatusPanel
        data={null}
        isStale
        isDegraded={false}
        onRefresh={() => undefined}
      />,
    )

    expect(screen.getByText('Stale')).toBeInTheDocument()
  })

  it('shows tick in progress indicator with pulse class', () => {
    render(
      <StatusPanel
        data={{ ...statusResponseFixture, tick_in_progress: true }}
        isStale={false}
        isDegraded={false}
        onRefresh={() => undefined}
      />,
    )

    expect(screen.getByTestId('tick-in-progress')).toHaveClass('motion-safe:animate-pulse')
  })

  it('omits pulse when prefers reduced motion via motion-safe guard', () => {
    render(
      <StatusPanel
        data={{ ...statusResponseFixture, tick_in_progress: true }}
        isStale={false}
        isDegraded={false}
        onRefresh={() => undefined}
      />,
    )

    const indicator = screen.getByTestId('tick-in-progress')
    expect(indicator.className).toContain('motion-safe:animate-pulse')
  })
})
