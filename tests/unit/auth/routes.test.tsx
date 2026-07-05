import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { appRoutes } from '@/app/routes'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { AuthProvider } from '@/auth/AuthProvider'

describe('routes auth guard', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubEnv('VITE_MOCK_AUTH_ENABLED', 'true')
  })

  it('redirects /deep to /login without session', () => {
    const memoryRouter = createMemoryRouter(appRoutes, {
      initialEntries: ['/deep'],
    })

    render(
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={memoryRouter} />
        </AuthProvider>
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/login')
  })
})
