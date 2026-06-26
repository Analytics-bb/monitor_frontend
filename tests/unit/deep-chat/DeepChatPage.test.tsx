import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  resetDeepChatFixtureStore,
  setFixtureChatAwaitingApproval,
  setFixtureChatSnapshot,
} from '@/api/deepChat'
import {
  chatSnapshotCancelledFixture,
  chatSnapshotCompletedFixture,
  chatSnapshotErrorFixture,
  chatSnapshotNotStartedFixture,
} from '@/api/fixtures/chatSnapshot'

const AUDIT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

describe('DeepChatPage', () => {
  beforeEach(() => {
    resetDeepChatFixtureStore()
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotNotStartedFixture)
  })

  it('auto-opens chat and shows audit summary', async () => {
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('audit-summary')).toBeInTheDocument()
    expect(screen.getByText(/Детекция/)).toBeVisible()
    expect(screen.getByText(/ЭСКАЛИРОВАТЬ/)).toBeVisible()
  })

  it('shows error panel instead of chat when state is error', async () => {
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotErrorFixture)
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('chat-error-panel')).toBeInTheDocument()
    expect(screen.getByText('budget_exceeded')).toBeVisible()
    expect(screen.queryByTestId('chat-window-composer')).not.toBeInTheDocument()
  })

  it('shows completed notice and hides composer', async () => {
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotCompletedFixture)
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('chat-state-notice-completed')).toBeVisible()
    expect(screen.queryByTestId('chat-window-composer')).not.toBeInTheDocument()
  })

  it('shows cancelled notice and hides composer', async () => {
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotCancelledFixture)
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('chat-state-notice-cancelled')).toBeVisible()
    expect(screen.queryByTestId('chat-window-composer')).not.toBeInTheDocument()
  })

  it('shows approval overlay when awaiting approval', async () => {
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotCompletedFixture)
    setFixtureChatAwaitingApproval(AUDIT_ID, {
      action_id: 'act-1',
      tool_name: 'run_query',
      args_summary: 'SELECT 1',
    })
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('approval-overlay')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Свой вариант' })).toBeVisible()
  })

  it('links usage page with audit_id query', async () => {
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const link = await screen.findByRole('link', { name: 'Расход токенов' })
    expect(link).toHaveAttribute('href', `/usage?audit_id=${AUDIT_ID}`)
  })

  it('restores deep list query in back link', async () => {
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter
        initialEntries={[
          {
            pathname: `/deep/${AUDIT_ID}`,
            state: { deepListSearch: 'gate_id=42&page=1' },
          },
        ]}
      >
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const backLink = await screen.findByRole('link', { name: 'Go back' })
    expect(backLink).toHaveAttribute('href', '/deep?gate_id=42&page=1')
  })
})
