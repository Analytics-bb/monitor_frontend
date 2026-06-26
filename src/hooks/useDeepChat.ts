import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  approveChatAction,
  getChat,
  openChat,
  rejectChatAction,
  sendChatMessage,
  TERMINAL_STATES,
  type ChatSnapshot,
} from '@/api/deepChat'
import { ApiClientError, isApiErrorCode } from '@/api/errors'
import { usePolling } from '@/hooks/usePolling'

/** Интервал polling в `active` (середина 1–2 с). */
const ACTIVE_INTERVAL_MS = 1_500

/** Интервал polling в `awaiting_approval` (середина 3–5 с). */
const AWAITING_APPROVAL_INTERVAL_MS = 4_000

export interface UseDeepChatResult {
  /** Последний snapshot или `null` до первого успешного GET. */
  snapshot: ChatSnapshot | null
  /** Последняя ошибка fetch/mutation. */
  error: unknown
  /** Polling включён по текущему state. */
  isPolling: boolean
  /** Идёт автоматический POST open при `not_started`. */
  isOpening: boolean
  /** Немедленный GET snapshot. */
  refetch: () => Promise<void>
  /** POST open; после успеха — refetch и polling по state. */
  openSession: () => Promise<void>
  /**
   * POST message. При 409 `message` + pending — refetch, draft сохраняется снаружи.
   *
   * @returns `true` если сообщение отправлено
   */
  sendMessage: (content: string) => Promise<boolean>
  /** POST approve; refetch после успеха. */
  approve: (actionId: string) => Promise<void>
  /** POST reject; refetch после успеха. */
  reject: (actionId: string) => Promise<void>
}

function getPollingIntervalMs(state: ChatSnapshot['state']): number {
  if (state === 'awaiting_approval') {
    return AWAITING_APPROVAL_INTERVAL_MS
  }
  return ACTIVE_INTERVAL_MS
}

function isPollingEnabled(snapshot: ChatSnapshot | null): boolean {
  if (!snapshot) {
    return true
  }
  if (TERMINAL_STATES.has(snapshot.state)) {
    return false
  }
  if (snapshot.state === 'not_started') {
    return false
  }
  return true
}

/**
 * Polling и мутации deep chat для `/deep/{audit_id}`.
 *
 * Интервалы по M17 §10.s; terminal и `not_started` — без interval.
 * После любого POST — немедленный GET, затем interval по state.
 * На unmount polling останавливается через {@link usePolling}.
 *
 * @param auditId - UUID audit из route params
 */
export function useDeepChat(auditId: string): UseDeepChatResult {
  const [snapshot, setSnapshot] = useState<ChatSnapshot | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [isOpening, setIsOpening] = useState(false)
  const hasAutoOpenedRef = useRef(false)

  useEffect(() => {
    hasAutoOpenedRef.current = false
  }, [auditId])

  const fetcher = useCallback(async (): Promise<ChatSnapshot | null> => {
    try {
      const result = await getChat(auditId)
      setSnapshot(result)
      setError(null)
      return result
    } catch (err) {
      setError(err)
      return null
    }
  }, [auditId])

  const intervalMs = useMemo(
    () => getPollingIntervalMs(snapshot?.state ?? 'active'),
    [snapshot?.state],
  )

  const pollingEnabled = useMemo(() => isPollingEnabled(snapshot), [snapshot])

  const { refetch } = usePolling({
    fetcher,
    intervalMs,
    enabled: pollingEnabled,
  })

  const refetchSnapshot = useCallback(async () => {
    await refetch()
  }, [refetch])

  const openSession = useCallback(async () => {
    try {
      const result = await openChat(auditId)
      setSnapshot(result)
      setError(null)
      await refetch()
    } catch (err) {
      setError(err)
      throw err
    }
  }, [auditId, refetch])

  useEffect(() => {
    if (
      !snapshot ||
      snapshot.state !== 'not_started' ||
      hasAutoOpenedRef.current
    ) {
      return
    }

    hasAutoOpenedRef.current = true
    setIsOpening(true)
    void openSession()
      .catch(() => undefined)
      .finally(() => {
        setIsOpening(false)
      })
  }, [snapshot, openSession])

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      try {
        const result = await sendChatMessage(auditId, content)
        setSnapshot(result)
        setError(null)
        await refetch()
        return true
      } catch (err) {
        if (err instanceof ApiClientError && err.status === 409) {
          await refetch()
        }
        setError(err)
        return false
      }
    },
    [auditId, refetch],
  )

  const approve = useCallback(
    async (actionId: string) => {
      try {
        const result = await approveChatAction(auditId, actionId)
        setSnapshot(result)
        setError(null)
        await refetch()
      } catch (err) {
        if (isApiErrorCode(err, 'budget_exceeded')) {
          setSnapshot((current) =>
            current ? { ...current, state: 'error' } : current,
          )
        }
        setError(err)
        throw err
      }
    },
    [auditId, refetch],
  )

  const reject = useCallback(
    async (actionId: string) => {
      try {
        const result = await rejectChatAction(auditId, actionId)
        setSnapshot(result)
        setError(null)
        await refetch()
      } catch (err) {
        setError(err)
        throw err
      }
    },
    [auditId, refetch],
  )

  return {
    snapshot,
    error,
    isPolling: pollingEnabled,
    isOpening,
    refetch: refetchSnapshot,
    openSession,
    sendMessage,
    approve,
    reject,
  }
}
