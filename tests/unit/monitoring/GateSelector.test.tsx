import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { activeGateFixture } from '@/api/fixtures/gateInfo'
import { ApiClientError } from '@/api/errors'
import * as monitoringApi from '@/api/monitoring'
import { GateSelector } from '@/components/monitoring/GateSelector'

vi.mock('@/api/monitoring', () => ({
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

const getActiveGateMock = vi.mocked(monitoringApi.getActiveGate)
const activateGateMock = vi.mocked(monitoringApi.activateGate)

describe('GateSelector', () => {
  it('loads active gate on mount from GET /gates/active', async () => {
    getActiveGateMock.mockResolvedValue(activeGateFixture)

    render(<GateSelector onActivated={async () => undefined} />)

    await waitFor(() => {
      expect(screen.getByText('1001')).toBeInTheDocument()
    })
    expect(screen.getByText('Test Gate 1001 Test Method')).toBeInTheDocument()
    expect(getActiveGateMock).toHaveBeenCalledTimes(1)
  })

  it('accepts only digits in gate input', async () => {
    getActiveGateMock.mockResolvedValue(activeGateFixture)
    const user = userEvent.setup()

    render(<GateSelector onActivated={async () => undefined} />)

    await waitFor(() => {
      expect(screen.getByText('1001')).toBeInTheDocument()
    })

    const input = screen.getByLabelText('Номер gate')
    await user.type(input, 'ab12c3!')

    expect(input).toHaveValue('123')
  })

  it('keeps current gate on activate 404 and shows toast', async () => {
    getActiveGateMock.mockResolvedValue(activeGateFixture)
    const user = userEvent.setup()

    activateGateMock.mockRejectedValue(
      new ApiClientError(404, {
        error_code: 'gate_not_found',
        message: 'Gate not found',
      }),
    )

    render(<GateSelector onActivated={async () => undefined} />)

    await waitFor(() => {
      expect(screen.getByText('1001')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Номер gate'), '2002')
    await user.click(screen.getByRole('button', { name: 'Сменить' }))

    await waitFor(() => {
      expect(activateGateMock).toHaveBeenCalledWith('2002')
    })

    expect(screen.getByText('1001')).toBeInTheDocument()
    expect(screen.getByText('Test Gate 1001 Test Method')).toBeInTheDocument()
  })

  it('updates active gate after successful activate', async () => {
    getActiveGateMock.mockResolvedValue(activeGateFixture)
    const user = userEvent.setup()
    const onActivated = vi.fn(async () => undefined)

    activateGateMock.mockResolvedValue({
      gate_id: '2002',
      gate_name: 'Gate 2002',
    })

    render(<GateSelector onActivated={onActivated} />)

    await waitFor(() => {
      expect(screen.getByText('1001')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Номер gate'), '2002')
    await user.click(screen.getByRole('button', { name: 'Сменить' }))

    await waitFor(() => {
      expect(screen.getByText('2002')).toBeInTheDocument()
    })
    expect(screen.getByText('Gate 2002')).toBeInTheDocument()
    expect(onActivated).toHaveBeenCalledTimes(1)
  })

  it('sends activate request for the same gate id', async () => {
    getActiveGateMock.mockResolvedValue(activeGateFixture)
    const user = userEvent.setup()
    const onActivated = vi.fn(async () => undefined)

    activateGateMock.mockResolvedValue(activeGateFixture)

    render(<GateSelector onActivated={onActivated} />)

    await waitFor(() => {
      expect(screen.getByText('1001')).toBeInTheDocument()
    })

    await user.type(screen.getByLabelText('Номер gate'), '1001')
    await user.click(screen.getByRole('button', { name: 'Сменить' }))

    await waitFor(() => {
      expect(activateGateMock).toHaveBeenCalledWith('1001')
    })
    expect(onActivated).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no active gate', async () => {
    getActiveGateMock.mockRejectedValue(
      new ApiClientError(404, {
        error_code: 'no_active_gate',
        message: 'No active gate',
      }),
    )

    render(<GateSelector onActivated={async () => undefined} />)

    await waitFor(() => {
      expect(screen.getByText('Активный гейт не задан')).toBeInTheDocument()
    })
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
