/** Ключ boolean-флага mock-сессии в localStorage. */
export const MOCK_SESSION_STORAGE_KEY = 'monitor-mock-auth'

/**
 * Читает `VITE_MOCK_AUTH_ENABLED`; по умолчанию `true`.
 * При `false` guard bypass — маршруты доступны без mock-сессии (dev/e2e).
 */
export function isMockAuthEnabled(): boolean {
  const raw = import.meta.env.VITE_MOCK_AUTH_ENABLED
  if (raw === undefined || raw === '') {
    return true
  }
  return raw !== 'false' && raw !== '0'
}

/**
 * Проверяет mock-сессию: флаг в localStorage при включённом mock auth.
 * При `isMockAuthEnabled() === false` всегда возвращает `true`.
 */
export function isMockAuthenticated(): boolean {
  if (!isMockAuthEnabled()) {
    return true
  }

  try {
    return localStorage.getItem(MOCK_SESSION_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

/** Устанавливает boolean-флаг mock-сессии (без секретов и токенов). */
export function setMockSession(): void {
  try {
    localStorage.setItem(MOCK_SESSION_STORAGE_KEY, 'true')
  } catch {
    // ignore quota / private mode
  }
}

/** Снимает mock-сессию из localStorage. */
export function clearMockSession(): void {
  try {
    localStorage.removeItem(MOCK_SESSION_STORAGE_KEY)
  } catch {
    // ignore quota / private mode
  }
}
