import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import * as contextsApi from '@/api/contexts'
import * as instructionsApi from '@/api/instructions'
import { agentContextsListFixture } from '@/api/fixtures/agentContext'
import { agentInstructionsListFixture } from '@/api/fixtures/agentInstruction'
import { AgentSettingsPage } from '@/pages/AgentSettingsPage'

vi.mock('@/api/instructions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/instructions')>()
  return {
    ...actual,
    listInstructions: vi.fn(),
    patchInstruction: vi.fn(),
  }
})

vi.mock('@/api/contexts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/contexts')>()
  return {
    ...actual,
    listContexts: vi.fn(),
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
const listContextsMock = vi.mocked(contextsApi.listContexts)

describe('AgentSettingsPage', () => {
  it('switches between Instructions and Contexts tabs', async () => {
    const user = userEvent.setup()
    listInstructionsMock.mockResolvedValue(agentInstructionsListFixture)
    listContextsMock.mockResolvedValue(agentContextsListFixture)

    render(<AgentSettingsPage />)

    expect(await screen.findByTestId('instructions-tab')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Contexts' }))

    expect(await screen.findByTestId('contexts-tab')).toBeInTheDocument()
  })
})
