import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as contextsApi from '@/api/contexts'
import { ContextEditor } from '@/components/settings/ContextEditor'

vi.mock('@/api/contexts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/api/contexts')>()
  return {
    ...actual,
    upsertContext: vi.fn(),
    deleteContext: vi.fn(),
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
      context_id: 'new-id',
      agent_kind: 'deep',
      gate_id: null,
      key: 'new_key',
      content: 'Updated content',
      updated_at: '2025-07-14 12:00:00',
    })
  })

  it('sends upsert payload matching form on save', async () => {
    const user = userEvent.setup()
    const onSaved = vi.fn(async () => undefined)
    const onClose = vi.fn()

    render(
      <ContextEditor
        mode="create"
        defaultAgentKind="deep"
        defaultGateId={null}
        onClose={onClose}
        onSaved={onSaved}
      />,
    )

    await user.type(screen.getByLabelText('key'), 'new_key')
    await user.type(
      screen.getByTestId('context-content-input'),
      'Updated content',
    )
    await user.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => {
      expect(upsertContextMock).toHaveBeenCalledWith({
        agent_kind: 'deep',
        gate_id: null,
        key: 'new_key',
        content: 'Updated content',
      })
    })

    expect(onSaved).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })
})
