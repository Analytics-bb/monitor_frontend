import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'

import { authLoginFixture } from '@/api/fixtures/authSession'
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

describe('LoginPage', () => {
  it('redirects to /monitoring after successful login', async () => {
    const user = userEvent.setup()
    navigateMock.mockReset()
    localStorage.clear()

    const { LoginPage } = await import('@/pages/LoginPage')

    renderWithAuth(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.type(screen.getByLabelText('Логин'), 'admin')
    await user.type(screen.getByLabelText('Пароль'), 'admin')
    await user.click(screen.getByRole('button', { name: 'Войти' }))

    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    expect(stored).toBeTruthy()
    expect(JSON.parse(stored!)).toMatchObject({
      token: authLoginFixture.token,
      username: authLoginFixture.username,
    })
    expect(navigateMock).toHaveBeenCalledWith('/monitoring', { replace: true })
  })

  it('shows error for empty credentials', async () => {
    const user = userEvent.setup()
    localStorage.clear()

    const { LoginPage } = await import('@/pages/LoginPage')

    renderWithAuth(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Войти' }))

    expect(screen.getByTestId('login-error')).toHaveTextContent(
      'Введите логин и пароль',
    )
  })
})
