/** Режим темы приложения. */
export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'monitor-theme'

/**
 * Читает сохранённую тему из localStorage; default — light.
 */
export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return stored === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/**
 * Применяет class `.dark` на `<html>`.
 */
export function applyTheme(theme: Theme): void {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}
