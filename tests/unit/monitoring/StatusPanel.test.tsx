import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { statusResponseFixture } from '@/api/fixtures/statusResponse'
import { StatusPanel } from '@/components/monitoring/StatusPanel'

describe('StatusPanel', () => {
  it('shows scheduler fields with formatted datetime', () => {
    render(
      <StatusPanel
        data={statusResponseFixture}
        isStale={false}
        isDegraded={false}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Статус' })).toBeInTheDocument()
    expect(screen.getByText('Сервис запущен')).toBeInTheDocument()
    expect(screen.getByText('07.06.2026, 12:00')).toBeInTheDocument()
    expect(screen.getByText('07.06.2026, 12:05')).toBeInTheDocument()
    expect(screen.getByText('07.06.2026, 12:04')).toBeInTheDocument()
    expect(screen.getByTestId('status-last-ok-icon')).toBeInTheDocument()
  })

  it('shows stale live indicator without pulse class', () => {
    render(<StatusPanel data={null} isStale isDegraded={false} />)

    expect(screen.getByTestId('status-live-indicator')).toHaveClass(
      'bg-muted-foreground/50',
    )
    expect(screen.getByTestId('status-live-indicator')).not.toHaveClass(
      'motion-safe:animate-soft-pulse',
    )
  })

  it('shows soft pulse on live indicator when poll succeeded', () => {
    render(
      <StatusPanel
        data={statusResponseFixture}
        isStale={false}
        isDegraded={false}
      />,
    )

    expect(screen.getByTestId('status-live-indicator')).toHaveClass(
      'motion-safe:animate-soft-pulse',
    )
  })

  it('shows ok icon for no_events last_status', () => {
    render(
      <StatusPanel
        data={{
          ...statusResponseFixture,
          scheduler: {
            ...statusResponseFixture.scheduler!,
            last_status: 'no_events',
            last_error_code: null,
            ticks_error_total: 0,
          },
        }}
        isStale={false}
        isDegraded={false}
      />,
    )

    expect(screen.getByTestId('status-last-ok-icon')).toBeInTheDocument()
    expect(screen.queryByTestId('status-last-error-icon')).not.toBeInTheDocument()
  })

  it('shows error icon only for error last_status', () => {
    render(
      <StatusPanel
        data={{
          ...statusResponseFixture,
          scheduler: {
            ...statusResponseFixture.scheduler!,
            last_status: 'error',
            last_error_code: 'pipeline_error',
          },
        }}
        isStale={false}
        isDegraded={false}
      />,
    )

    expect(screen.getByTestId('status-last-error-icon')).toBeInTheDocument()
  })

  it('shows detector running as field value', () => {
    render(
      <StatusPanel
        data={{
          ...statusResponseFixture,
          scheduler: {
            ...statusResponseFixture.scheduler!,
            tick_in_progress: true,
          },
        }}
        isStale={false}
        isDegraded={false}
      />,
    )

    expect(screen.getByText('Детектор запущен')).toBeInTheDocument()
    expect(screen.getAllByText('Да').length).toBeGreaterThanOrEqual(1)
  })
})
