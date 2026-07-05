import { apiFetch, apiGetJson, getApiBaseUrl } from './client'
import { ApiClientError } from './errors'
import {
  authLoginFixture,
  authUserFixture,
  parseAuthLogoutResponse,
  parseAuthUserPublic,
  parseLoginResponse,
  type AuthUserPublic,
  type LoginResponse,
} from './fixtures/authSession'

export type { AuthUserPublic, LoginResponse }

/**
 * Выдаёт opaque session token (`POST /api/auth/login`).
 *
 * @throws {ApiClientError} При `401 invalid_credentials`
 */
export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  if (!getApiBaseUrl()) {
    if (!username.trim() || !password.trim()) {
      throw new ApiClientError(401, {
        error_code: 'invalid_credentials',
        message: 'Invalid username or password',
      })
    }
    return authLoginFixture
  }

  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  })
  const json: unknown = await response.json()
  return parseLoginResponse(json)
}

/**
 * Инвалидирует текущую сессию (`POST /api/auth/logout`).
 */
export async function logout(): Promise<void> {
  if (!getApiBaseUrl()) {
    return
  }

  const response = await apiFetch('/api/auth/logout', { method: 'POST' })
  parseAuthLogoutResponse(await response.json())
}

/**
 * Возвращает текущего пользователя (`GET /api/auth/me`).
 *
 * @throws {ApiClientError} При `401 not_authenticated`
 */
export async function getCurrentUser(): Promise<AuthUserPublic> {
  if (!getApiBaseUrl()) {
    return authUserFixture
  }

  const json = await apiGetJson<unknown>('/api/auth/me')
  return parseAuthUserPublic(json)
}
