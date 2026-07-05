import type { LoginResponse } from '@/api/fixtures/authSession'

/** Ключ JSON-сессии в localStorage. */
export const SESSION_STORAGE_KEY = 'monitor-auth-session'

export interface StoredAuthSession {
  token: string
  user_id: string
  username: string
  expires_at: string
}

/**
 * Bypass route guard без сессии (e2e/dev).
 * `true` при `VITE_MOCK_AUTH_ENABLED=false` или `0`.
 */
export function isAuthBypassEnabled(): boolean {
  const raw = import.meta.env.VITE_MOCK_AUTH_ENABLED
  if (raw === undefined || raw === '') {
    return false
  }
  return raw === 'false' || raw === '0'
}

/**
 * @deprecated Используйте {@link isAuthBypassEnabled}.
 * `true` — guard активен (нужна сессия).
 */
export function isMockAuthEnabled(): boolean {
  return !isAuthBypassEnabled()
}

function readStoredSession(): StoredAuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed: unknown = JSON.parse(raw)
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      typeof (parsed as StoredAuthSession).token !== 'string' ||
      typeof (parsed as StoredAuthSession).user_id !== 'string' ||
      typeof (parsed as StoredAuthSession).username !== 'string' ||
      typeof (parsed as StoredAuthSession).expires_at !== 'string'
    ) {
      return null
    }
    return parsed as StoredAuthSession
  } catch {
    return null
  }
}

function isSessionExpired(session: StoredAuthSession): boolean {
  const expiresAt = Date.parse(session.expires_at)
  if (Number.isNaN(expiresAt)) {
    return false
  }
  return expiresAt <= Date.now()
}

/**
 * Возвращает сохранённую сессию или `null`, если её нет или истекла.
 */
export function getStoredSession(): StoredAuthSession | null {
  const session = readStoredSession()
  if (!session) {
    return null
  }
  if (isSessionExpired(session)) {
    clearStoredSession()
    return null
  }
  return session
}

/**
 * Opaque Bearer token текущей сессии.
 */
export function getSessionToken(): string | null {
  return getStoredSession()?.token ?? null
}

/**
 * Проверяет наличие валидной сессии.
 * При {@link isAuthBypassEnabled} всегда `true`.
 */
export function isAuthenticated(): boolean {
  if (isAuthBypassEnabled()) {
    return true
  }
  return getStoredSession() !== null
}

/**
 * @deprecated Используйте {@link isAuthenticated}.
 */
export function isMockAuthenticated(): boolean {
  return isAuthenticated()
}

/**
 * Сохраняет сессию после успешного login.
 *
 * Побочный эффект: запись в `localStorage`.
 */
export function setStoredSession(session: LoginResponse): void {
  try {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @deprecated Используйте {@link setStoredSession} через auth API.
 */
export function setMockSession(): void {
  setStoredSession({
    token: 'legacy-mock-token',
    user_id: '00000000-0000-4000-8000-000000000000',
    username: 'mock',
    expires_at: '2099-12-31T23:59:59',
  })
}

/**
 * Удаляет сессию из `localStorage`.
 */
export function clearStoredSession(): void {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // ignore quota / private mode
  }
}

/**
 * @deprecated Используйте {@link clearStoredSession}.
 */
export function clearMockSession(): void {
  clearStoredSession()
}

/** @deprecated Используйте {@link SESSION_STORAGE_KEY}. */
export const MOCK_SESSION_STORAGE_KEY = SESSION_STORAGE_KEY
