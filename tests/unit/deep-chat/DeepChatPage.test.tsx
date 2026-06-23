import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'

import {
  resetDeepChatFixtureStore,
  setFixtureChatSnapshot,
} from '@/api/deepChat'
import { chatSnapshotNotStartedFixture } from '@/api/fixtures/chatSnapshot'

const AUDIT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

describe('DeepChatPage', () => {
  beforeEach(() => {
    resetDeepChatFixtureStore()
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotNotStartedFixture)
  })

  it('shows open CTA for not_started and opens session', async () => {
    const user = userEvent.setup()
    const { DeepChatPage } = await import('@/pages/DeepChatPage')

    render(
      <MemoryRouter initialEntries={[`/deep/${AUDIT_ID}`]}>
        <Routes>
          <Route path="/deep/:auditId" element={<DeepChatPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const cta = await screen.findByTestId('deep-chat-open-cta')
    expect(cta).toHaveTextContent('Открыть анализ')

    await user.click(cta)

    await waitFor(() => {
      expect(screen.getByTestId('chat-message-list')).toBeInTheDocument()
    })
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

  it('restores deep list query in breadcrumb Deep link', async () => {
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

    const breadcrumb = await screen.findByRole('link', { name: 'Deep' })
    expect(breadcrumb).toHaveAttribute('href', '/deep?gate_id=42&page=1')
  })
})
