import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router'

import { isAuthenticated } from '@/auth/sessionStorage'

export interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * Guard M19 session: без Bearer-сессии — redirect `/login` с optional `state.from`.
 * При `VITE_MOCK_AUTH_ENABLED=false` пропускает children без проверки.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation()

  if (isAuthenticated()) {
    return children
  }

  return <Navigate replace state={{ from: location }} to="/login" />
}
