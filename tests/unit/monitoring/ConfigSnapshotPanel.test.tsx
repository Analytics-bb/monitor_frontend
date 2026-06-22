import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConfigSnapshotPanel } from '@/components/monitoring/ConfigSnapshotPanel'

describe('ConfigSnapshotPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('expands section and copies field value', async () => {
    const user = userEvent.setup()
    render(
      <ConfigSnapshotPanel
        configSnapshot={{
          detector_version: '1.2.0',
          threshold: 0.85,
        }}
      />,
    )

    const writeText = vi
      .spyOn(navigator.clipboard, 'writeText')
      .mockResolvedValue(undefined)

    await user.click(screen.getByRole('button', { name: /detector_version/i }))

    expect(
      screen.getByRole('button', { name: 'Копировать detector_version' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Копировать detector_version' }),
    )

    expect(writeText).toHaveBeenCalledWith('1.2.0')
  })
})
