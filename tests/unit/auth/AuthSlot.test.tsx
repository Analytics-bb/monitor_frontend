import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { MOCK_SESSION_STORAGE_KEY } from '@/auth/mockSession'
import { AuthSlot } from '@/app/layout/AuthSlot'
import { SidebarCollapsedContext } from '@/app/layout/sidebarCollapsedContext'

const navigateMock = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

function renderAuthSlot() {
  return render(
    <MemoryRouter>
      <SidebarCollapsedContext.Provider value={false}>
        <AuthSlot />
      </SidebarCollapsedContext.Provider>
    </MemoryRouter>,
  )
}

describe('AuthSlot', () => {
  it('shows Login link after logout', async () => {
    const user = userEvent.setup()
    navigateMock.mockReset()
    localStorage.setItem(MOCK_SESSION_STORAGE_KEY, 'true')

    renderAuthSlot()

    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Logout' }))

    expect(localStorage.getItem(MOCK_SESSION_STORAGE_KEY)).toBeNull()
    expect(navigateMock).toHaveBeenCalledWith('/login')
    expect(screen.getByRole('link', { name: 'Login' })).toBeInTheDocument()
  })
})
