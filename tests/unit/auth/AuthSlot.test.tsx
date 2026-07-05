import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { authLoginFixture } from '@/api/fixtures/authSession'
import { AuthSlot } from '@/app/layout/AuthSlot'
import { SidebarCollapsedContext } from '@/app/layout/sidebarCollapsedContext'
import { SESSION_STORAGE_KEY } from '@/auth/sessionStorage'
import { renderWithAuth } from '../../helpers/renderWithAuth'

const navigateMock = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function renderAuthSlot() {
  return renderWithAuth(
    <MemoryRouter>
      <SidebarCollapsedContext.Provider value={false}>
        <AuthSlot />
      </SidebarCollapsedContext.Provider>
    </MemoryRouter>,
  )
}

describe('AuthSlot', () => {
  beforeEach(() => {
    localStorage.clear()
    navigateMock.mockReset()
    vi.stubEnv('VITE_MOCK_AUTH_ENABLED', 'true')
  })

  it('shows logout for active session', () => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authLoginFixture))

    renderAuthSlot()

    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: authLoginFixture.username })).not.toBeInTheDocument()
  })

  it('shows Login link after logout', async () => {
    const user = userEvent.setup()
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authLoginFixture))

    renderAuthSlot()

    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith('/login')
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })
})
