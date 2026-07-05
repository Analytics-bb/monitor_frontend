import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  resetDeepChatFixtureStore,
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

  it('auto-opens chat with hypothesis user message and agent summary', async () => {
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('chat-message-hypothesis')).toBeInTheDocument()
    expect(
      await screen.findByRole('heading', { name: /Обновление/i }),
    ).toBeVisible()
    expect(screen.getAllByTestId('chat-message-assistant').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Действия/).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByTestId('approval-overlay')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-window-composer')).toBeInTheDocument()
  })

  it('shows agent error in chat but keeps composer when state is error', async () => {
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotErrorFixture)
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByTestId('chat-message-list')).toBeInTheDocument()
    expect(screen.getByText(/budget_exceeded/)).toBeVisible()
    expect(screen.getByText(/Превышен лимит токенов/)).toBeVisible()
    expect(screen.queryByTestId('chat-state-notice-error')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chat-error-panel')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-window-composer')).toBeInTheDocument()
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

  it('keeps composer enabled after open without approval step', async () => {
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    await screen.findByTestId('chat-message-hypothesis')
    await screen.findByRole('heading', { name: /Обновление/i })
    expect(screen.getAllByTestId('chat-message-assistant').length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByTestId('approval-overlay')).not.toBeInTheDocument()
    expect(screen.getByTestId('chat-composer-textarea')).not.toBeDisabled()
  })

  it('links usage page without filters', async () => {
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const link = await screen.findByRole('link', { name: 'Расход токенов' })
    expect(link).toHaveAttribute('href', '/usage')
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
