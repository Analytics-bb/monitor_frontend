import { createContext } from 'react'

import type { StoredAuthSession } from '@/auth/sessionStorage'

export interface AuthContextValue {
  session: StoredAuthSession | null
  isAuthenticated: boolean
  isLoadingUser: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
