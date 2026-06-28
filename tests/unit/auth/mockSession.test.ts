import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MOCK_SESSION_STORAGE_KEY } from '@/auth/mockSession'

describe('mockSession', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('set/clear roundtrip', async () => {
    const { clearMockSession, isMockAuthenticated, setMockSession } =
      await import('@/auth/mockSession')

    expect(isMockAuthenticated()).toBe(false)

    setMockSession()
    expect(localStorage.getItem(MOCK_SESSION_STORAGE_KEY)).toBe('true')
    expect(isMockAuthenticated()).toBe(true)

    clearMockSession()
    expect(localStorage.getItem(MOCK_SESSION_STORAGE_KEY)).toBeNull()
    expect(isMockAuthenticated()).toBe(false)
  })

  it('MOCK_AUTH_ENABLED=false returns true without flag', async () => {
    vi.stubEnv('VITE_MOCK_AUTH_ENABLED', 'false')

    const { isMockAuthenticated } = await import('@/auth/mockSession')

    expect(isMockAuthenticated()).toBe(true)
  })
})
