import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { Sidebar } from '@/app/layout/Sidebar'

const EXPECTED_ROUTES = [
  '/monitoring',
  '/deep',
  '/support',
  '/usage',
  '/settings/agents',
  '/cabinet',
  '/login',
]

function renderSidebar() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    </ThemeProvider>,
  )
}

describe('Sidebar', () => {
  it('renders all M17 navigation links', () => {
    renderSidebar()

    for (const path of EXPECTED_ROUTES) {
      const label =
        path === '/monitoring'
          ? 'Мониторинг'
            : path === '/deep'
            ? 'Аналитика срабатываний'
            : path === '/support'
              ? 'Саппорт'
              : path === '/usage'
              ? 'Использование'
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

  it('collapses and expands with animated width state', async () => {
    const user = userEvent.setup()
    renderSidebar()

    const sidebar = screen.getByTestId('sidebar')
    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    expect(sidebar).toHaveClass('w-56')

    await user.click(
      screen.getByRole('button', { name: 'Свернуть боковую панель' }),
    )

    expect(sidebar).toHaveAttribute('data-collapsed', 'true')
    expect(sidebar).toHaveClass('w-16')
    expect(
      screen.getByRole('link', { name: 'Мониторинг' }),
    ).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', { name: 'Развернуть боковую панель' }),
    )

    expect(sidebar).toHaveAttribute('data-collapsed', 'false')
    expect(sidebar).toHaveClass('w-56')
  })
})
