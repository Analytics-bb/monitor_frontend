import { UserCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { getCurrentUser, type AuthUserPublic } from '@/api/auth'
import { isApiErrorCode, mapApiError } from '@/api/errors'
import { useAuth } from '@/auth/useAuth'
import { formatDateTimeRuOrDash } from '@/lib/formatDateTime'

/**
 * Личный кабинет: профиль из `GET /api/auth/me` (M19).
 */
export function CabinetPage() {
  const { session, refreshUser } = useAuth()
  const [user, setUser] = useState<AuthUserPublic | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorCode, setErrorCode] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)
      setErrorCode(null)
      try {
        const profile = await getCurrentUser()
        if (!cancelled) {
          setUser(profile)
        }
      } catch (error) {
        if (!cancelled) {
          if (isApiErrorCode(error, 'not_authenticated')) {
            setErrorCode('not_authenticated')
          } else {
            setErrorCode('load_failed')
            mapApiError(error)
          }
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [refreshUser, session?.token])

  if (isLoading) {
    return (
      <section className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">Загрузка профиля…</p>
      </section>
    )
  }

  if (errorCode === 'not_authenticated') {
    return (
      <section className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">Сессия истекла. Войдите снова.</p>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-sm">Не удалось загрузить профиль</p>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-lg">
      <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <UserCircle className="text-muted-foreground size-10 shrink-0" aria-hidden />
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Личный кабинет</h1>
            <p className="text-muted-foreground text-sm">{user.username}</p>
          </div>
        </div>

        <dl className="space-y-4 text-sm">
          <div>
            <dt className="text-muted-foreground mb-1">Логин</dt>
            <dd className="font-medium">{user.username}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">User ID</dt>
            <dd className="font-mono text-xs break-all">{user.user_id}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground mb-1">Создан</dt>
            <dd className="font-mono text-xs tabular-nums">
              {formatDateTimeRuOrDash(user.created_at)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  )
}
