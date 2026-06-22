import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ConfigSnapshotPanel } from '@/components/monitoring/ConfigSnapshotPanel'

describe('ConfigSnapshotPanel', () => {
  it('renders labeled config fields without hidden keys', () => {
    render(
      <ConfigSnapshotPanel
        configSnapshot={{
          gate_id: null,
          slice_minutes: 10,
          window_slices: 18,
          quantile_low: 0.1,
          quantile_high: 0.9,
          persistence: 3,
          mode: 'anomaly',
          created_at: '2026-05-25T12:00:00',
          updated_at: '2026-05-25T12:00:00',
        }}
      />,
    )

    expect(screen.getByText('Настройки конфига')).toBeInTheDocument()
    expect(screen.getByText('Длина шага')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('Режим детекции')).toBeInTheDocument()
    expect(screen.getByText('anomaly')).toBeInTheDocument()

    expect(screen.queryByText('gate_id')).not.toBeInTheDocument()
    expect(screen.queryByText('created_at')).not.toBeInTheDocument()
    expect(screen.queryByText('updated_at')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /копировать/i }),
    ).not.toBeInTheDocument()
  })
})
