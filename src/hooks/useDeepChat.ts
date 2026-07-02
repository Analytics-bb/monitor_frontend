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
import { ApiClientError, isApiErrorCode, mapApiError } from '@/api/errors'
import { hasAssistantReplyAfterLastUser } from '@/lib/deepChatDisplay'
import {
  isFatalDeepChatLoadError,
  isRecoverableDeepChatMutationError,
} from '@/lib/deepChatErrors'
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
  /** Optimistic user message до refetch. */
  optimisticUserMessage: string | null
  /** Агент формирует ответ (после send/open). */
  isAgentThinking: boolean
  /** Polling включён по текущемu state. */
  isPolling: boolean
  /** Идёт автоматический POST open при `not_started`. */
  isOpening: boolean
  /** Немедленный GET snapshot. */
  refetch: () => Promise<void>
  /** POST open; после успеха — refetch и polling по state. */
  openSession: () => Promise<void>
  /**
   * POST message. Сначала optimistic user bubble, затем thinking до ответа агента.
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

function shouldKeepThinking(snapshot: ChatSnapshot | null): boolean {
  if (!snapshot) {
    return true
  }

  if (snapshot.state === 'awaiting_approval') {
    return false
  }

  return !hasAssistantReplyAfterLastUser(snapshot)
}

/**
 * Polling и мутации deep chat для `/deep/{audit_id}`.
 *
 * Optimistic user message + thinking indicator между send и ответом агента.
 * Recoverable ошибки (409/422) не ломают чат — toast + refetch.
 *
 * @param auditId - UUID audit из route params
 */
export function useDeepChat(auditId: string): UseDeepChatResult {
  const [snapshot, setSnapshot] = useState<ChatSnapshot | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<
    string | null
  >(null)
  const [isAgentThinking, setIsAgentThinking] = useState(false)
  const hasAutoOpenedRef = useRef(false)
  const awaitingReplyRef = useRef(false)
  const snapshotRef = useRef<ChatSnapshot | null>(null)

  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  useEffect(() => {
    hasAutoOpenedRef.current = false
    awaitingReplyRef.current = false
    setOptimisticUserMessage(null)
    setIsAgentThinking(false)
  }, [auditId])

  const fetcher = useCallback(async (): Promise<ChatSnapshot | null> => {
    try {
      const result = await getChat(auditId)
      setSnapshot(result)
      setError(null)

      if (awaitingReplyRef.current && !shouldKeepThinking(result)) {
        awaitingReplyRef.current = false
        setIsAgentThinking(false)
        setOptimisticUserMessage(null)
      }

      return result
    } catch (err) {
      if (!snapshotRef.current || isFatalDeepChatLoadError(err)) {
        setError(err)
      } else {
        mapApiError(err)
      }
      return null
    }
  }, [auditId])

  const intervalMs = useMemo(
    () => getPollingIntervalMs(snapshot?.state ?? 'active'),
    [snapshot?.state],
  )

  const pollingEnabled = useMemo(
    () => isPollingEnabled(snapshot) || isAgentThinking,
    [isAgentThinking, snapshot],
  )

  const { refetch } = usePolling({
    fetcher,
    intervalMs,
    enabled: pollingEnabled,
  })

  const refetchSnapshot = useCallback(async () => {
    await refetch()
  }, [refetch])

  const openSession = useCallback(async () => {
    awaitingReplyRef.current = true
    setIsAgentThinking(true)
    try {
      const result = await openChat(auditId)
      setSnapshot(result)
      setError(null)
      await refetch()

      if (!shouldKeepThinking(result)) {
        awaitingReplyRef.current = false
        setIsAgentThinking(false)
      }
    } catch (err) {
      awaitingReplyRef.current = false
      setIsAgentThinking(false)
      if (isFatalDeepChatLoadError(err)) {
        setError(err)
      } else {
        mapApiError(err)
      }
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
      const trimmed = content.trim()
      if (!trimmed) {
        return false
      }

      setOptimisticUserMessage(trimmed)
      awaitingReplyRef.current = true
      setIsAgentThinking(true)
      setError(null)

      try {
        const result = await sendChatMessage(auditId, trimmed)
        setSnapshot(result)
        await refetch()

        if (!shouldKeepThinking(result)) {
          awaitingReplyRef.current = false
          setIsAgentThinking(false)
          setOptimisticUserMessage(null)
        }

        return true
      } catch (err) {
        if (isRecoverableDeepChatMutationError(err)) {
          mapApiError(err)
          await refetch()
          awaitingReplyRef.current = false
          setIsAgentThinking(false)
          setOptimisticUserMessage(null)
          return false
        }

        awaitingReplyRef.current = false
        setIsAgentThinking(false)
        setOptimisticUserMessage(null)

        if (err instanceof ApiClientError && err.status === 409) {
          await refetch()
        }

        mapApiError(err)
        return false
      }
    },
    [auditId, refetch],
  )

  const approve = useCallback(
    async (actionId: string) => {
      awaitingReplyRef.current = true
      setIsAgentThinking(true)
      try {
        const result = await approveChatAction(auditId, actionId)
        setSnapshot(result)
        setError(null)
        await refetch()

        if (!shouldKeepThinking(result)) {
          awaitingReplyRef.current = false
          setIsAgentThinking(false)
        }
      } catch (err) {
        awaitingReplyRef.current = false
        setIsAgentThinking(false)

        if (isApiErrorCode(err, 'budget_exceeded')) {
          setSnapshot((current) =>
            current ? { ...current, state: 'error' } : current,
          )
        }

        if (isRecoverableDeepChatMutationError(err)) {
          mapApiError(err)
          await refetch()
          return
        }

        mapApiError(err)
        throw err
      }
    },
    [auditId, refetch],
  )

  const reject = useCallback(
    async (actionId: string) => {
      awaitingReplyRef.current = true
      setIsAgentThinking(true)
      try {
        const result = await rejectChatAction(auditId, actionId)
        setSnapshot(result)
        setError(null)
        await refetch()

        if (!shouldKeepThinking(result)) {
          awaitingReplyRef.current = false
          setIsAgentThinking(false)
        }
      } catch (err) {
        awaitingReplyRef.current = false
        setIsAgentThinking(false)

        if (isRecoverableDeepChatMutationError(err)) {
          mapApiError(err)
          await refetch()
          return
        }

        setError(err)
        throw err
      }
    },
    [auditId, refetch],
  )

  return {
    snapshot,
    error,
    optimisticUserMessage,
    isAgentThinking,
    isPolling: pollingEnabled,
    isOpening,
    refetch: refetchSnapshot,
    openSession,
    sendMessage,
    approve,
    reject,
  }
}
