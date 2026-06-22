import { act, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import { useTheme } from '@/app/providers/useTheme'

function ThemeProbe() {
  const { theme, toggle } = useTheme()
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggle}>
        toggle
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  it('defaults to light and toggles to dark with localStorage', () => {
    localStorage.removeItem('monitor-theme')
    document.documentElement.classList.remove('dark')

    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('theme')).toHaveTextContent('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)

    act(() => {
      screen.getByRole('button', { name: 'toggle' }).click()
    })

    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('monitor-theme')).toBe('dark')
  })
})
