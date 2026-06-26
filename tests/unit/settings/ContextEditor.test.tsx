import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { agentContextFixture } from '@/api/fixtures/agentContext'
import * as contextsApi from '@/api/contexts'
import { ContextEditor } from '@/components/settings/ContextEditor'

vi.mock('@/api/contexts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/contexts')>()
  return {
    ...actual,
    upsertContext: vi.fn(),
  }
})

vi.mock('@/api/errors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/errors')>()
  return {
    ...actual,
    mapApiError: vi.fn(),
  }
})

const upsertContextMock = vi.mocked(contextsApi.upsertContext)

describe('ContextEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    upsertContextMock.mockResolvedValue({
      ...agentContextFixture,
      context_body: 'Updated body',
    })
  })

  it('sends upsert payload matching edited context_body', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn(async () => undefined)
    const onClose = vi.fn()

    render(
      <ContextEditor
        context={agentContextFixture}
        onClose={onClose}
        onSaved={onSaved}
      />,
    )

    const textarea = screen.getByTestId('context-content-input')
    await user.clear(textarea)
    await user.type(textarea, 'Updated body')
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(upsertContextMock).toHaveBeenCalledWith({
        agent_kind: 'deep',
        gate_id: null,
        context_body: 'Updated body',
      })
    })

    expect(onSaved).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
