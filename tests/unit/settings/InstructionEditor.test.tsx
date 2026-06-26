import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ApiClientError } from '@/api/errors'
import { instructionConflict409 } from '@/api/fixtures/conflictEnvelope'
import { agentInstructionFixture } from '@/api/fixtures/agentInstruction'
import * as instructionsApi from '@/api/instructions'
import { InstructionEditor } from '@/components/settings/InstructionEditor'

vi.mock('@/api/instructions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/instructions')>()
  return {
    ...actual,
    createInstruction: vi.fn(),
    updateInstruction: vi.fn(),
    deleteInstruction: vi.fn(),
  }
})

const updateInstructionMock = vi.mocked(instructionsApi.updateInstruction)
const deleteInstructionMock = vi.mocked(instructionsApi.deleteInstruction)

describe('InstructionEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    HTMLDialogElement.prototype.showModal = vi.fn()
    HTMLDialogElement.prototype.close = vi.fn()
  })

  it('calls DELETE only after confirm', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn(async () => undefined)
    const onClose = vi.fn()

    deleteInstructionMock.mockResolvedValue(undefined)

    render(
      <InstructionEditor
        mode="edit"
        instruction={agentInstructionFixture}
        onClose={onClose}
        onSaved={onSaved}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))

    expect(deleteInstructionMock).not.toHaveBeenCalled()

    await user.click(screen.getByTestId('instruction-delete-confirm'))

    await waitFor(() => {
      expect(deleteInstructionMock).toHaveBeenCalledWith(
        agentInstructionFixture.instruction_id,
      )
    })

    expect(onSaved).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('shows inline name error on instruction conflict', async () => {
    const user = userEvent.setup()
    updateInstructionMock.mockRejectedValue(instructionConflict409)

    render(
      <InstructionEditor
        mode="edit"
        instruction={agentInstructionFixture}
        onClose={vi.fn()}
        onSaved={vi.fn(async () => undefined)}
      />,
    )

    const nameInput = screen.getByDisplayValue(agentInstructionFixture.name)
    await user.clear(nameInput)
    await user.type(nameInput, 'hypothesis_generator')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(
        screen.getByText('Инструкция с таким именем уже существует'),
      ).toBeInTheDocument()
    })
  })

  it('shows inline form error on delete failure', async () => {
    const user = userEvent.setup()

    deleteInstructionMock.mockRejectedValue(
      new ApiClientError(404, {
        error_code: 'instruction_not_found',
        message: 'Instruction not found',
      }),
    )

    render(
      <InstructionEditor
        mode="edit"
        instruction={agentInstructionFixture}
        onClose={vi.fn()}
        onSaved={vi.fn(async () => undefined)}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Delete' }))
    await user.click(screen.getByTestId('instruction-delete-confirm'))

    await waitFor(() => {
      expect(screen.getByText('Инструкция не найдена')).toBeInTheDocument()
    })
  })

  it('allows editing name in edit mode', () => {
    render(
      <InstructionEditor
        mode="edit"
        instruction={agentInstructionFixture}
        onClose={vi.fn()}
        onSaved={vi.fn(async () => undefined)}
      />,
    )

    expect(screen.getByDisplayValue(agentInstructionFixture.name)).toBeEnabled()
  })
})
