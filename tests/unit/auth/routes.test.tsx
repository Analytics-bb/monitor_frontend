import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { describe, expect, it } from 'vitest'

import { appRoutes } from '@/app/routes'
import { ThemeProvider } from '@/app/providers/ThemeProvider'

describe('routes auth guard', () => {
  it('redirects /deep to /login without session', () => {
    localStorage.clear()

    const memoryRouter = createMemoryRouter(appRoutes, {
      initialEntries: ['/deep'],
    })

    render(
      <ThemeProvider>
        <RouterProvider router={memoryRouter} />
      </ThemeProvider>,
    )

    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument()
    expect(memoryRouter.state.location.pathname).toBe('/login')
  })
})
