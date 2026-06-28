import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { MOCK_SESSION_STORAGE_KEY } from '@/auth/mockSession'

const navigateMock = vi.fn()

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('LoginPage', () => {
  it('redirects to /monitoring after submit', async () => {
    const user = userEvent.setup()
    navigateMock.mockReset()
    localStorage.clear()

    const { LoginPage } = await import('@/pages/LoginPage')

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(localStorage.getItem(MOCK_SESSION_STORAGE_KEY)).toBe('true')
    expect(navigateMock).toHaveBeenCalledWith('/monitoring', { replace: true })
  })
})
