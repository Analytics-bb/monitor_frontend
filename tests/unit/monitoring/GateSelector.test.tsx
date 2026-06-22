import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApiClientError } from '@/api/errors'
import * as monitoringApi from '@/api/monitoring'
import { GateSelector } from '@/components/monitoring/GateSelector'

vi.mock('@/api/monitoring', () => ({
  activateGate: vi.fn(),
}))

vi.mock('@/api/errors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/errors')>()
  return {
    ...actual,
    mapApiError: vi.fn(),
  }
})

const activateGateMock = vi.mocked(monitoringApi.activateGate)

describe('GateSelector', () => {
  it('keeps current gate on activate 404 and shows toast', async () => {
    const user = userEvent.setup()

    activateGateMock.mockRejectedValue(
      new ApiClientError(404, {
        error_code: 'gate_not_found',
        message: 'Gate not found',
      }),
    )

    render(
      <GateSelector
        currentGateId="gate-42"
        onActivated={async () => undefined}
      />,
    )

    expect(screen.getByText('gate-42')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Номер gate'), 'gate-99')
    await user.click(screen.getByRole('button', { name: 'Сменить gate' }))
    await user.click(screen.getByRole('button', { name: 'Активировать' }))

    await waitFor(() => {
      expect(activateGateMock).toHaveBeenCalledWith('gate-99')
    })

    expect(screen.getByText('gate-42')).toBeInTheDocument()
  })
})
