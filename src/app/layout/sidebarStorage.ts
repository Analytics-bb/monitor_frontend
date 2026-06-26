export const SIDEBAR_STORAGE_KEY = 'monitor-sidebar-collapsed'

/**
 * Читает сохранённое состояние sidebar из localStorage.
 */
export function getStoredSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * Сохраняет состояние sidebar в localStorage.
 */
export function storeSidebarCollapsed(collapsed: boolean): void {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0')
  } catch {
    // ignore quota / private mode
  }
}
