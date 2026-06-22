import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ApiClientError } from '@/api/errors'
import * as monitoringApi from '@/api/monitoring'
import { gatesFixture } from '@/api/fixtures/gateInfo'
import { GateSelector } from '@/components/monitoring/GateSelector'

vi.mock('@/api/monitoring', () => ({
  getGates: vi.fn(),
  getActiveGate: vi.fn(),
  activateGate: vi.fn(),
}))

vi.mock('@/api/errors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/errors')>()
  return {
    ...actual,
    mapApiError: vi.fn(),
  }
})

const getGatesMock = vi.mocked(monitoringApi.getGates)
const getActiveGateMock = vi.mocked(monitoringApi.getActiveGate)
const activateGateMock = vi.mocked(monitoringApi.activateGate)

describe('GateSelector', () => {
  it('keeps selected gate on activate 404 and shows toast', async () => {
    const user = userEvent.setup()

    getGatesMock.mockResolvedValue(gatesFixture)
    getActiveGateMock.mockResolvedValue(gatesFixture[0]!)
    activateGateMock.mockRejectedValue(
      new ApiClientError(404, {
        error_code: 'gate_not_found',
        message: 'Gate not found',
      }),
    )

    render(<GateSelector onActivated={async () => undefined} />)

    await screen.findByLabelText('Выбор gate')

    await user.selectOptions(
      screen.getByLabelText('Выбор gate'),
      gatesFixture[1]!.gate_id,
    )

    await user.click(screen.getByRole('button', { name: 'Активировать' }))

    await waitFor(() => {
      expect(activateGateMock).toHaveBeenCalledWith('43')
    })

    expect(screen.getByLabelText('Выбор gate')).toHaveValue('42')
  })
})
