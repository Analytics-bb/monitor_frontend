import { useCallback, useMemo, useState } from 'react'

import { getStatus, type StatusResponse } from '@/api/monitoring'
import { ApiClientError, isApiErrorCode } from '@/api/errors'
import { usePolling } from '@/hooks/usePolling'

/** Штатный интервал polling (середина диапазона 5–10 с). */
const NORMAL_INTERVAL_MS = 7_000

/** Ускоренный интервал при активном тике (середина 2–3 с). */
const TICK_IN_PROGRESS_INTERVAL_MS = 2_500

/** Backoff при 503 `scheduler_not_initialized`. */
const DEGRADED_BACKOFF_MS = [5_000, 15_000, 30_000] as const

export interface UseMonitoringPollingResult {
  /** Последний успешный ответ или `null` до первого успеха. */
  data: StatusResponse | null
  /** Последняя ошибка fetcher. */
  error: unknown
  /** Нет успешного fetch недавно или последний завершился ошибкой. */
  isStale: boolean
  /** 503 `scheduler_not_initialized` — scheduler не готов. */
  isDegraded: boolean
  /** Немедленный refetch без сброса interval. */
  refetch: () => Promise<void>
  /** Время последнего успешного fetch. */
  lastFetchAt: Date | null
}

/**
 * Polling `GET /api/status` для страницы `/monitoring`.
 *
 * Интервал 7 с штатно, 2.5 с при `tick_in_progress`; при 503 degraded — backoff 5→15→30 с.
 * Останавливается на unmount через {@link usePolling}.
 *
 * @returns Снимок status, флаги stale/degraded и `refetch`
 */
export function useMonitoringPolling(): UseMonitoringPollingResult {
  const [data, setData] = useState<StatusResponse | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [lastFetchAt, setLastFetchAt] = useState<Date | null>(null)
  const [isStale, setIsStale] = useState(false)
  const [isDegraded, setIsDegraded] = useState(false)
  const [backoffIndex, setBackoffIndex] = useState(0)

  const fetcher = useCallback(async (): Promise<StatusResponse | null> => {
    try {
      const result = await getStatus()
      setData(result)
      setError(null)
      setIsStale(false)
      setIsDegraded(false)
      setBackoffIndex(0)
      setLastFetchAt(new Date())
      return result
    } catch (err) {
      setError(err)
      setIsStale(true)

      if (
        err instanceof ApiClientError &&
        err.status === 503 &&
        isApiErrorCode(err, 'scheduler_not_initialized')
      ) {
        setIsDegraded(true)
        setBackoffIndex((index) =>
          Math.min(index + 1, DEGRADED_BACKOFF_MS.length - 1),
        )
      }

      return null
    }
  }, [])

  const intervalMs = useMemo(() => {
    if (isDegraded) {
      return DEGRADED_BACKOFF_MS[backoffIndex]
    }
    if (data?.tick_in_progress) {
      return TICK_IN_PROGRESS_INTERVAL_MS
    }
    return NORMAL_INTERVAL_MS
  }, [isDegraded, backoffIndex, data?.tick_in_progress])

  const { refetch } = usePolling({
    fetcher,
    intervalMs,
  })

  return {
    data,
    error,
    isStale,
    isDegraded,
    refetch,
    lastFetchAt,
  }
}
