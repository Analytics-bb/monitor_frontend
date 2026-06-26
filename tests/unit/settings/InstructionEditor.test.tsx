import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

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

vi.mock('@/api/errors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/errors')>()
  return {
    ...actual,
    mapApiError: vi.fn(),
  }
})

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
})
