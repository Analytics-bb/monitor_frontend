import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { MetricsChartsSlider } from '@/components/monitoring/MetricsChartsSlider'

const charts = [
  {
    key: 'tx_volume',
    title: 'Объём транзакций',
    data: [
      { label: '10:00', value: 120 },
      { label: '11:00', value: 184 },
    ],
  },
  {
    key: 'decline_rate',
    title: 'Decline rate',
    data: [
      { label: '10:00', value: 2.1 },
      { label: '11:00', value: 3.4 },
    ],
  },
]

describe('MetricsChartsSlider', () => {
  it('switches active slide on next click', async () => {
    const user = userEvent.setup()

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
