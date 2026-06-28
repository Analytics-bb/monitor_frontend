import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { MOCK_SESSION_STORAGE_KEY } from '@/auth/mockSession'
import { ProtectedRoute } from '@/app/ProtectedRoute'

function ProtectedProbe() {
  return <div>protected content</div>
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('redirects to /login without session', () => {
    render(
      <MemoryRouter initialEntries={['/monitoring']}>
        <Routes>
          <Route path="/login" element={<div>login page</div>} />
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <ProtectedProbe />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('login page')).toBeInTheDocument()
    expect(screen.queryByText('protected content')).not.toBeInTheDocument()
  })

  it('renders children when MOCK_AUTH_ENABLED=false', async () => {
    vi.stubEnv('VITE_MOCK_AUTH_ENABLED', 'false')

    const { ProtectedRoute: BypassProtectedRoute } =
      await import('@/app/ProtectedRoute')

    render(
      <MemoryRouter initialEntries={['/monitoring']}>
        <Routes>
          <Route
            path="/monitoring"
            element={
              <BypassProtectedRoute>
                <ProtectedProbe />
              </BypassProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('protected content')).toBeInTheDocument()
  })

  it('renders children with active session', () => {
    localStorage.setItem(MOCK_SESSION_STORAGE_KEY, 'true')

    render(
      <MemoryRouter initialEntries={['/monitoring']}>
        <Routes>
          <Route
            path="/monitoring"
            element={
              <ProtectedRoute>
                <ProtectedProbe />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('protected content')).toBeInTheDocument()
  })
})
