import { type FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router'

import { isMockAuthenticated, setMockSession } from '@/auth/mockSession'
import { Button } from '@/components/ui/button'

const fieldClassName =
  'border-input bg-background focus:border-ring/40 focus:ring-ring/20 h-9 w-full rounded-md border px-3 text-sm transition-colors duration-200 outline-none focus:ring-1'

/**
 * Mock login без API: любые credentials → localStorage flag → `/monitoring`.
 * Full-screen без sidebar; тема из ThemeProvider / `monitor-theme`.
 */
export function LoginPage() {
  const navigate = useNavigate()

  useEffect(() => {
    if (isMockAuthenticated()) {
      navigate('/monitoring', { replace: true })
    }
  }, [navigate])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMockSession()
    navigate('/monitoring', { replace: true })
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <section className="border-border bg-card motion-safe:animate-login-card-fade-in w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            BB Anomaly Monitor
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Ops dashboard</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="login-email">
              Email
            </label>
            <input
              autoComplete="username"
              className={fieldClassName}
              id="login-email"
              name="email"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="login-password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className={fieldClassName}
              id="login-password"
              name="password"
              type="password"
            />
          </div>

          <Button className="w-full" type="submit">
            Войти
          </Button>
        </form>

        <p className="text-muted-foreground mt-4 text-center text-xs">
          R2 mock auth — любые данные
        </p>
      </section>
    </div>
  )
}
