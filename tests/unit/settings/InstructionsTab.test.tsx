import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiClientError } from '@/api/errors'
import { agentInstructionsListFixture } from '@/api/fixtures/agentInstruction'
import * as instructionsApi from '@/api/instructions'
import { InstructionsTab } from '@/components/settings/InstructionsTab'

vi.mock('@/api/instructions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/instructions')>()
  return {
    ...actual,
    listInstructions: vi.fn(),
    patchInstruction: vi.fn(),
  }
})

vi.mock('@/api/errors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/errors')>()
  return {
    ...actual,
    mapApiError: vi.fn(),
  }
})

const listInstructionsMock = vi.mocked(instructionsApi.listInstructions)
const patchInstructionMock = vi.mocked(instructionsApi.patchInstruction)

describe('InstructionsTab', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    listInstructionsMock.mockResolvedValue(agentInstructionsListFixture)
  })

  it('renders rows from fixture', async () => {
    render(<InstructionsTab />)

    await waitFor(() => {
      expect(screen.getAllByTestId('instructions-table-row')).toHaveLength(2)
    })

    expect(screen.getByText('deep_analyst_prompt')).toBeInTheDocument()
    expect(screen.getByText('hypothesis_generator')).toBeInTheDocument()
  })

  it('calls PATCH on enabled toggle and keeps switch state', async () => {
    const user = userEvent.setup()
    const target = agentInstructionsListFixture[1]

    patchInstructionMock.mockResolvedValue({
      ...target,
      enabled: true,
    })

    render(<InstructionsTab />)

    await waitFor(() => {
      expect(screen.getByText('hypothesis_generator')).toBeInTheDocument()
    })

    const toggle = screen.getByLabelText('Enabled: hypothesis_generator')
    expect(toggle).not.toBeChecked()

    await user.click(toggle)

    await waitFor(() => {
      expect(patchInstructionMock).toHaveBeenCalledWith(
        target.instruction_id,
        {
          enabled: true,
        },
      )
    })

    expect(toggle).toBeChecked()
  })

  it('reverts switch after PATCH failure', async () => {
    const user = userEvent.setup()

    patchInstructionMock.mockRejectedValue(
      new ApiClientError(500, {
        error_code: 'internal_error',
        message: 'Failed',
      }),
    )

    render(<InstructionsTab />)

    await waitFor(() => {
      expect(screen.getByText('deep_analyst_prompt')).toBeInTheDocument()
    })

    const toggle = screen.getByLabelText('Enabled: deep_analyst_prompt')
    expect(toggle).toBeChecked()

    await user.click(toggle)

    await waitFor(() => {
      expect(patchInstructionMock).toHaveBeenCalled()
    })

    expect(toggle).toBeChecked()
  })
})
