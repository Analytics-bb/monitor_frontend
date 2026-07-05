import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { getCurrentUser, login as loginRequest, logout as logoutRequest } from '@/api/auth'
import { isApiErrorCode } from '@/api/errors'
import { AuthContext, type AuthContextValue } from '@/auth/authContext'
import { dispatchAuthChanged, subscribeAuthChanged } from '@/auth/authEvents'
import {
  clearStoredSession,
  getStoredSession,
  isAuthenticated,
  setStoredSession,
} from '@/auth/sessionStorage'

export interface AuthProviderProps {
  children: ReactNode
}

/**
 * Контекст M19 session auth: login/logout и синхронизация с localStorage.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState(() => getStoredSession())
  const [isLoadingUser, setIsLoadingUser] = useState(false)

  const syncSession = useCallback(() => {
    setSession(getStoredSession())
  }, [])

  useEffect(() => subscribeAuthChanged(syncSession), [syncSession])

  const refreshUser = useCallback(async () => {
    if (!getStoredSession()) {
      setSession(null)
      return
    }

    setIsLoadingUser(true)
    try {
      await getCurrentUser()
      setSession(getStoredSession())
    } catch {
      clearStoredSession()
      dispatchAuthChanged()
      setSession(null)
    } finally {
      setIsLoadingUser(false)
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const response = await loginRequest(username, password)
    setStoredSession(response)
    dispatchAuthChanged()
    setSession(getStoredSession())
  }, [])

  const logout = useCallback(async () => {
    try {
      if (getStoredSession()) {
        await logoutRequest()
      }
    } catch (error) {
      if (!isApiErrorCode(error, 'not_authenticated')) {
        throw error
      }
    } finally {
      clearStoredSession()
      dispatchAuthChanged()
      setSession(null)
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: isAuthenticated(),
      isLoadingUser,
      login,
      logout,
      refreshUser,
    }),
    [session, isLoadingUser, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
