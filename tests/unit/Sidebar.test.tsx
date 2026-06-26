import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { Sidebar } from '@/app/layout/Sidebar'

const EXPECTED_ROUTES = [
  '/monitoring',
  '/deep',
  '/usage',
  '/settings/agents',
  '/cabinet',
  '/login',
]

describe('Sidebar', () => {
  it('renders all M17 navigation links', () => {
    render(
      <ThemeProvider>
        <MemoryRouter>
          <Sidebar />
        </MemoryRouter>
      </ThemeProvider>,
    )

    for (const path of EXPECTED_ROUTES) {
      const label =
        path === '/monitoring'
          ? 'Мониторинг'
          : path === '/deep'
            ? 'Список срабатываний'
            : path === '/usage'
              ? 'Usage'
              : path === '/settings/agents'
                ? 'Настройки'
                : path === '/cabinet'
                  ? 'Кабинет'
                  : 'Login'

      expect(screen.getByRole('link', { name: label })).toHaveAttribute(
        'href',
        path,
      )
    }
  })
})
