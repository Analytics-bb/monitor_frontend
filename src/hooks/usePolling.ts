import { useCallback, useEffect, useRef } from 'react'

export interface UsePollingOptions<T> {
  /** Асинхронный fetcher (обычно GET API). */
  fetcher: () => Promise<T>
  /** Базовый интервал polling в мс. */
  intervalMs: number
  /** Включить polling; по умолчанию `true`. */
  enabled?: boolean
  /** Колбэк при успешном обновлении данных. */
  onData?: (data: T) => void
  /** Колбэк при ошибке fetcher. */
  onError?: (error: unknown) => void
}

export interface UsePollingResult {
  /** Немедленный refetch вне интервала. */
  refetch: () => Promise<void>
  /** Polling активен (`enabled`). */
  isPolling: boolean
}

function getEffectiveInterval(intervalMs: number): number {
  if (typeof document === 'undefined') {
    return intervalMs
  }
  return document.visibilityState === 'hidden' ? intervalMs * 2 : intervalMs
}

/**
 * HTTP polling с lifecycle для live-данных (monitoring, deep chat).
 *
 * При mount запускает немедленный fetch и периодический timer; при unmount останавливает.
 * При `document.visibilityState=hidden` интервал удваивается. Смена `intervalMs` перезапускает timer.
 *
 * Побочные эффекты: сетевые вызовы через `fetcher`, подписка на `visibilitychange`.
 *
 * @param options - fetcher, interval и колбэки
 * @returns `refetch` для ручного обновления и флаг `isPolling` (= `enabled`)
 */
export function usePolling<T>({
  fetcher,
  intervalMs,
  enabled = true,
  onData,
  onError,
}: UsePollingOptions<T>): UsePollingResult {
  const fetcherRef = useRef(fetcher)
  const onDataRef = useRef(onData)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    fetcherRef.current = fetcher
    onDataRef.current = onData
    onErrorRef.current = onError
  }, [fetcher, onData, onError])

  const runFetch = useCallback(async () => {
    try {
      const data = await fetcherRef.current()
      onDataRef.current?.(data)
    } catch (error) {
      onErrorRef.current?.(error)
    }
  }, [])

  const refetch = useCallback(async () => {
    await runFetch()
  }, [runFetch])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined
    let cancelled = false

    const schedule = () => {
      if (cancelled) {
        return
      }
      const delay = getEffectiveInterval(intervalMs)
      timeoutId = setTimeout(() => {
        void runFetch().finally(() => {
          schedule()
        })
      }, delay)
    }

    void runFetch().finally(() => {
      schedule()
    })

    const onVisibilityChange = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      schedule()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      cancelled = true
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [enabled, intervalMs, runFetch])

  return { refetch, isPolling: enabled }
}
