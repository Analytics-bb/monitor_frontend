import { useContext } from 'react'

import { AuthContext, type AuthContextValue } from '@/auth/authContext'

/**
 * Хук доступа к M19 session auth.
 *
 * @throws {Error} Вне {@link AuthProvider}
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
