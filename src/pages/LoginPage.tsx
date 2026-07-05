import { Eye, EyeOff } from 'lucide-react'
import { type FormEvent, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { isApiErrorCode } from '@/api/errors'
import { useAuth } from '@/auth/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const fieldClassName =
  'border-input bg-background placeholder:text-muted-foreground placeholder:text-xs focus:border-ring/40 focus:ring-ring/20 h-9 w-full rounded-md border px-3 text-sm transition-colors duration-200 outline-none focus:ring-1'

/**
 * Login через `POST /api/auth/login` (M19).
 * Full-screen без sidebar; redirect на `state.from` или `/monitoring`.
 */
export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const redirectTo = (location.state as { from?: { pathname: string } } | null)
    ?.from?.pathname

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo ?? '/monitoring', { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorMessage(null)

    const formData = new FormData(event.currentTarget)
    const username = String(formData.get('username') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    if (!username || !password) {
      setErrorMessage('Введите логин и пароль')
      return
    }

    setIsSubmitting(true)
    try {
      await login(username, password)
      navigate(redirectTo ?? '/monitoring', { replace: true })
    } catch (error) {
      if (isApiErrorCode(error, 'invalid_credentials')) {
        setErrorMessage('Неверный логин или пароль')
        return
      }
      setErrorMessage('Не удалось войти. Попробуйте позже.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background flex min-h-svh items-center justify-center p-6">
      <section className="border-border bg-card motion-safe:animate-login-card-fade-in w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold tracking-tight">
            BB Anomaly Monitor
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Traffic analysis</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              className="text-muted-foreground text-sm font-medium"
              htmlFor="login-username"
            >
              Логин
            </label>
            <input
              autoComplete="username"
              className={fieldClassName}
              disabled={isSubmitting}
              id="login-username"
              name="username"
              placeholder="admin"
              type="text"
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-muted-foreground text-sm font-medium"
              htmlFor="login-password"
            >
              Пароль
            </label>
            <div className="relative">
              <input
                autoComplete="current-password"
                className={cn(fieldClassName, 'pr-10')}
                disabled={isSubmitting}
                id="login-password"
                name="password"
                placeholder="Enter your password"
                type={passwordVisible ? 'text' : 'password'}
              />
              <button
                aria-label={
                  passwordVisible ? 'Скрыть пароль' : 'Показать пароль'
                }
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center transition-colors"
                disabled={isSubmitting}
                type="button"
                onClick={() => setPasswordVisible((value) => !value)}
              >
                {passwordVisible ? (
                  <EyeOff aria-hidden className="size-4" />
                ) : (
                  <Eye aria-hidden className="size-4" />
                )}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <p
              className="text-destructive text-sm"
              data-testid="login-error"
              role="alert"
            >
              {errorMessage}
            </p>
          ) : null}

          <Button className="w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Вход…' : 'Войти'}
          </Button>
        </form>
      </section>
    </div>
  )
}
