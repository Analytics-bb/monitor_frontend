import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import * as contextsApi from '@/api/contexts'
import * as detectorApi from '@/api/detector'
import * as instructionsApi from '@/api/instructions'
import { agentContextsListFixture } from '@/api/fixtures/agentContext'
import { detectorConfigGlobalFixture } from '@/api/fixtures/detectorConfig'
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

vi.mock('@/api/detector', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/detector')>()
  return {
    ...actual,
    getGlobalDetectorConfig: vi.fn(),
    patchGlobalDetectorConfig: vi.fn(),
    resetGlobalDetectorConfig: vi.fn(),
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
const getGlobalDetectorConfigMock = vi.mocked(detectorApi.getGlobalDetectorConfig)

describe('AgentSettingsPage', () => {
  it('switches between Instructions, Contexts and Detector tabs', async () => {
    const user = userEvent.setup()
    listInstructionsMock.mockResolvedValue(agentInstructionsListFixture)
    listContextsMock.mockResolvedValue({
      items: agentContextsListFixture,
      total: agentContextsListFixture.length,
      page: 1,
      page_size: 50,
    })
    getGlobalDetectorConfigMock.mockResolvedValue(detectorConfigGlobalFixture)

    render(<AgentSettingsPage />)

    expect(await screen.findByTestId('instructions-tab')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Contexts' }))
    expect(await screen.findByTestId('contexts-tab')).toBeInTheDocument()

    await user.click(screen.getByRole('tab', { name: 'Detector' }))
    expect(await screen.findByTestId('detector-config-tab')).toBeInTheDocument()
  })
})
