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
  it('accepts only digits in gate input', async () => {
    const user = userEvent.setup()

    render(
      <GateSelector
        currentGateId="1001"
        currentGateName="Test Gate 1001 Test Method"
        onActivated={async () => undefined}
      />,
    )

    const input = screen.getByLabelText('Номер gate')
    await user.type(input, 'ab12c3!')

    expect(input).toHaveValue('123')
  })

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
        currentGateId="1001"
        currentGateName="Test Gate 1001 Test Method"
        onActivated={async () => undefined}
      />,
    )

    expect(screen.getByText('1001')).toBeInTheDocument()
    expect(screen.getByText('Test Gate 1001 Test Method')).toBeInTheDocument()
    expect(screen.queryByText('Gate')).not.toBeInTheDocument()

    await user.type(screen.getByLabelText('Номер gate'), '2002')
    await user.click(screen.getByRole('button', { name: 'Сменить' }))

    await waitFor(() => {
      expect(activateGateMock).toHaveBeenCalledWith('2002')
    })

    expect(screen.getByText('1001')).toBeInTheDocument()
  })
})
