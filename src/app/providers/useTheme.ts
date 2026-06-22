import { useContext } from 'react'

import { ThemeContext, type ThemeContextValue } from './ThemeProvider.context'

/**
 * Хук доступа к теме; бросает, если вне `ThemeProvider`.
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
