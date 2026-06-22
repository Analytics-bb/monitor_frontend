import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { metricsChartSlidesFixture } from '@/api/fixtures/metricsCharts'
import { MetricsChartsSlider } from '@/components/monitoring/MetricsChartsSlider'

describe('MetricsChartsSlider', () => {
  it('renders seven slides from metrics fixture', () => {
    render(<MetricsChartsSlider metricsCharts={metricsChartSlidesFixture} />)

    expect(screen.getByTestId('chart-slide-indicator')).toHaveTextContent('1/7')
    expect(screen.getByText('Объём транзакций (24ч)')).toBeInTheDocument()
  })

  it('switches active slide on next click', async () => {
    const user = userEvent.setup()

    const charts = [
      {
        key: 'tx_volume',
        title: 'Объём транзакций',
        type: 'line' as const,
        xKey: 'label',
        data: [
          { label: '10:00', value: 120 },
          { label: '11:00', value: 184 },
        ],
        series: [{ key: 'value', label: 'Транзакции', color: 'var(--primary)' }],
      },
      {
        key: 'decline_rate',
        title: 'Decline rate',
        type: 'multiLine' as const,
        xKey: 'label',
        data: [
          { label: '10:00', approved: 100, declined: 2 },
          { label: '11:00', approved: 120, declined: 3 },
        ],
        series: [
          { key: 'approved', label: 'Approved', color: 'var(--status-success)' },
          { key: 'declined', label: 'Declined', color: 'var(--status-error)' },
        ],
      },
    ]

    render(<MetricsChartsSlider metricsCharts={charts} />)

    expect(screen.getByTestId('chart-slide-indicator')).toHaveTextContent('1/2')
    expect(screen.getByTestId('chart-active-slide')).toHaveAttribute(
      'data-chart-key',
      'tx_volume',
    )

    await user.click(screen.getByRole('button', { name: 'Следующий график' }))

    expect(screen.getByTestId('chart-slide-indicator')).toHaveTextContent('2/2')
    expect(screen.getByTestId('chart-active-slide')).toHaveAttribute(
      'data-chart-key',
      'decline_rate',
    )
  })
})
