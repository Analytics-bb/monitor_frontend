import { useCallback, useEffect, useState } from 'react'

import { listDeepCases, type DeepCaseSummary } from '@/api/deep'
import { mapApiError } from '@/api/errors'

export interface UseDeepCasesListParams {
  gate_id?: string
  from?: string
  to?: string
  page: number
  page_size: number
}

export interface UseDeepCasesListResult {
  items: DeepCaseSummary[]
  total: number
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Загружает список deep cases с server-side pagination.
 *
 * @param params - Query-параметры `GET /api/deep/cases`
 * @returns Строки таблицы, total, флаги загрузки/ошибки и `refetch`
 */
export function useDeepCasesList(
  params: UseDeepCasesListParams,
): UseDeepCasesListResult {
  const [items, setItems] = useState<DeepCaseSummary[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = useCallback(async () => {
    setIsLoading(true)

    try {
      const response = await listDeepCases(params)
      setItems(response.items)
      setTotal(response.total)
      setError(null)
    } catch (fetchError) {
      mapApiError(fetchError)
      setError('Не удалось загрузить список deep cases')
      setItems([])
      setTotal(0)
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setIsLoading(true)

      try {
        const response = await listDeepCases(params)
        if (cancelled) {
          return
        }
        setItems(response.items)
        setTotal(response.total)
        setError(null)
      } catch (fetchError) {
        if (cancelled) {
          return
        }
        mapApiError(fetchError)
        setError('Не удалось загрузить список deep cases')
        setItems([])
        setTotal(0)
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [params])

  return { items, total, isLoading, error, refetch }
}
