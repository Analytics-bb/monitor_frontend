import { describe, expect, it } from 'vitest'

import {
  getCurrentUser,
  login,
  logout,
} from '@/api/auth'
import {
  authLoginFixture,
  authUserFixture,
} from '@/api/fixtures/authSession'
import { ApiClientError } from '@/api/errors'
import { SESSION_STORAGE_KEY } from '@/auth/sessionStorage'

describe('auth API fixtures', () => {
  it('login returns fixture token for non-empty credentials', async () => {
    const response = await login('admin', 'admin')
    expect(response).toEqual(authLoginFixture)
  })

  it('login rejects empty credentials in fixture mode', async () => {
    await expect(login('', '')).rejects.toBeInstanceOf(ApiClientError)
    await expect(login('', '')).rejects.toMatchObject({
      status: 401,
      apiError: { error_code: 'invalid_credentials' },
    })
  })

  it('getCurrentUser returns fixture profile', async () => {
    await expect(getCurrentUser()).resolves.toEqual(authUserFixture)
  })

  it('logout is no-op in fixture mode', async () => {
    await expect(logout()).resolves.toBeUndefined()
  })
})

describe('auth API bearer header', () => {
  it('stores session token for subsequent client calls', async () => {
    localStorage.clear()
    const response = await login('admin', 'secret')
    const { setStoredSession } = await import('@/auth/sessionStorage')
    setStoredSession(response)

    expect(localStorage.getItem(SESSION_STORAGE_KEY)).toContain(response.token)
  })
})
