import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { isMockAuthenticated } from '@/auth/mockSession'

export interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Guard mock-сессии: без флага — redirect `/login` с optional `state.from`.
 * При `VITE_MOCK_AUTH_ENABLED=false` пропускает children без проверки.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (isMockAuthenticated()) {
    return children
  }

  return <Navigate replace state={{ from: location }} to="/login" />
}
