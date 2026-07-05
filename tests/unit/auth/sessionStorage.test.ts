import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { authLoginFixture } from '@/api/fixtures/authSession'
import { SESSION_STORAGE_KEY } from '@/auth/sessionStorage'

describe('sessionStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
    vi.stubEnv('VITE_MOCK_AUTH_ENABLED', 'true')
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('set/clear roundtrip', async () => {
    const {
      clearStoredSession,
      isAuthenticated,
      setStoredSession,
    } = await import('@/auth/sessionStorage')

    expect(isAuthenticated()).toBe(false)

    setStoredSession(authLoginFixture)
    expect(JSON.parse(localStorage.getItem(SESSION_STORAGE_KEY)!)).toMatchObject(
      { token: authLoginFixture.token },
    )
    expect(isAuthenticated()).toBe(true)

    clearStoredSession()
    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('AUTH bypass when VITE_MOCK_AUTH_ENABLED=false', async () => {
    vi.stubEnv('VITE_MOCK_AUTH_ENABLED', 'false')

    const { isAuthenticated } = await import('@/auth/sessionStorage')

    expect(isAuthenticated()).toBe(true)
  })
})
