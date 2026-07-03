import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'

import {
  getChat,
  openChat,
  sendChatMessage,
  TERMINAL_STATES,
  type ChatSnapshot,
} from '@/api/deepChat'
import { ApiClientError, mapApiError, type ApiError } from '@/api/errors'
import {
  createAwaitingReplyBaseline,
  hasUserMessagesInSnapshot,
  resolveConclusionForInitialMessage,
  shouldKeepAgentThinking,
  type AwaitingReplyBaseline,
} from '@/lib/deepChatDisplay'
import { toApiErrorFromUnknown } from '@/lib/deepChatErrorMessage'
import { isRecoverableDeepChatMutationError } from '@/lib/deepChatErrors'
import { mergeChatSnapshot } from '@/lib/deepChatSnapshotMerge'
import { usePolling } from '@/hooks/usePolling'

/** Интервал polling (середина 1–2 с). */
const POLLING_INTERVAL_MS = 1_500

export interface UseDeepChatOptions {
  /**
   * Conclusion hypothesis-агента до POST open (deep list / navigation state).
   * После open приоритет у `system.conclusion` из snapshot.
   */
  seedConclusion?: string | null
}

export interface UseDeepChatResult {
  /** Последний snapshot или `null` до первого успешного GET. */
  snapshot: ChatSnapshot | null
  /** Ошибка для отображения в ленте до ответа бэка. */
  clientChatError: ApiError | null
  /** Optimistic user message до refetch. */
  optimisticUserMessage: string | null
  /** Агент формирует ответ (после send / auto conclusion). */
  isAgentThinking: boolean
  /** Polling включён по текущемu state. */
  isPolling: boolean
  /** Идёт POST open (+ auto conclusion) при `not_started`. */
  isOpening: boolean
  /** Немедленный GET snapshot. */
  refetch: () => Promise<void>
  /** POST open; при новой сессии — auto POST conclusion. */
  openSession: () => Promise<void>
  /**
   * POST message. Сначала optimistic user bubble, затем thinking до ответа агента.
   *
   * @returns `true` если сообщение отправлено
   */
  sendMessage: (content: string) => Promise<boolean>
}

function getPollingIntervalMs(_state: ChatSnapshot['state']): number {
  return POLLING_INTERVAL_MS
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
 * Bootstrap: `POST open` (system seed) → auto `POST messages` с conclusion → ответ агента.
 * Optimistic user message + thinking между send и ответом агента.
 *
 * @param auditId - UUID audit из route params
 * @param options - seed conclusion до open
 */
export function useDeepChat(
  auditId: string,
  options?: UseDeepChatOptions,
): UseDeepChatResult {
  const seedConclusion = options?.seedConclusion ?? null
  const [snapshot, setSnapshot] = useState<ChatSnapshot | null>(null)
  const [clientChatError, setClientChatError] = useState<ApiError | null>(null)
  const [isOpening, setIsOpening] = useState(false)
  const [optimisticUserMessage, setOptimisticUserMessage] = useState<
    string | null
  >(null)
  const [isAgentThinking, setIsAgentThinking] = useState(false)
  const hasAutoOpenedRef = useRef(false)
  const awaitingReplyRef = useRef(false)
  const awaitingBaselineRef = useRef<AwaitingReplyBaseline | null>(null)
  const snapshotRef = useRef<ChatSnapshot | null>(null)
  const seedConclusionRef = useRef(seedConclusion)

  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  useEffect(() => {
    seedConclusionRef.current = seedConclusion
  }, [seedConclusion])

  useEffect(() => {
    hasAutoOpenedRef.current = false
    awaitingReplyRef.current = false
    awaitingBaselineRef.current = null
    setOptimisticUserMessage(null)
    setIsAgentThinking(false)
    setClientChatError(null)
  }, [auditId])

  const beginAwaitingReply = useCallback(
    (replyOptions?: { additionalUsers?: number }) => {
      awaitingBaselineRef.current = createAwaitingReplyBaseline(
        snapshotRef.current,
        replyOptions,
      )
      awaitingReplyRef.current = true
    },
    [],
  )

  const finishAwaitingReply = useCallback(() => {
    awaitingReplyRef.current = false
    awaitingBaselineRef.current = null
    setIsAgentThinking(false)
    setOptimisticUserMessage(null)
  }, [])

  const syncThinkingWithSnapshot = useCallback(
    (nextSnapshot: ChatSnapshot) => {
      if (
        awaitingReplyRef.current &&
        !shouldKeepAgentThinking(nextSnapshot, awaitingBaselineRef.current)
      ) {
        finishAwaitingReply()
      }
    },
    [finishAwaitingReply],
  )

  const fetcher = useCallback(async (): Promise<ChatSnapshot | null> => {
    try {
      const result = await getChat(auditId)
      let mergedResult: ChatSnapshot = result
      setSnapshot((previous) => {
        mergedResult = mergeChatSnapshot(previous, result)
        return mergedResult
      })
      setClientChatError(null)
      syncThinkingWithSnapshot(mergedResult)

      return mergedResult
    } catch (err) {
      setClientChatError(toApiErrorFromUnknown(err))
      mapApiError(err)
      return snapshotRef.current
    }
  }, [auditId, syncThinkingWithSnapshot])

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

  const sendInitialConclusion = useCallback(
    async (openedSnapshot: ChatSnapshot): Promise<void> => {
      if (hasUserMessagesInSnapshot(openedSnapshot)) {
        return
      }

      const conclusion = resolveConclusionForInitialMessage(
        openedSnapshot,
        seedConclusionRef.current,
      )
      if (!conclusion) {
        return
      }

      beginAwaitingReply({ additionalUsers: 1 })
      setIsAgentThinking(true)
      setClientChatError(null)

      try {
        const result = await sendChatMessage(auditId, conclusion)
        setSnapshot((previous) => mergeChatSnapshot(previous, result))
        syncThinkingWithSnapshot(result)
      } catch (err) {
        finishAwaitingReply()
        setClientChatError(toApiErrorFromUnknown(err))

        if (isRecoverableDeepChatMutationError(err)) {
          mapApiError(err)
          await refetch()
          return
        }

        if (err instanceof ApiClientError && err.status === 409) {
          await refetch()
        }

        mapApiError(err)
      }
    },
    [
      auditId,
      beginAwaitingReply,
      finishAwaitingReply,
      refetch,
      syncThinkingWithSnapshot,
    ],
  )

  const bootstrapSession = useCallback(async (): Promise<void> => {
    setIsOpening(true)
    try {
      const opened = await openChat(auditId)
      setSnapshot((previous) => mergeChatSnapshot(previous, opened))
      setClientChatError(null)
      await sendInitialConclusion(opened)
    } catch (err) {
      setClientChatError(toApiErrorFromUnknown(err))
      mapApiError(err)
    } finally {
      setIsOpening(false)
    }
  }, [auditId, sendInitialConclusion])

  const openSession = useCallback(async () => {
    await bootstrapSession()
  }, [bootstrapSession])

  useEffect(() => {
    if (
      !snapshot ||
      snapshot.state !== 'not_started' ||
      TERMINAL_STATES.has(snapshot.state) ||
      hasAutoOpenedRef.current
    ) {
      return
    }

    hasAutoOpenedRef.current = true
    void bootstrapSession()
  }, [snapshot, bootstrapSession])

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const trimmed = content.trim()
      if (!trimmed) {
        return false
      }

      flushSync(() => {
        setOptimisticUserMessage(trimmed)
        beginAwaitingReply({ additionalUsers: 1 })
        setIsAgentThinking(true)
        setClientChatError(null)
      })

      try {
        const result = await sendChatMessage(auditId, trimmed)
        setSnapshot((previous) => mergeChatSnapshot(previous, result))
        syncThinkingWithSnapshot(result)

        return true
      } catch (err) {
        if (isRecoverableDeepChatMutationError(err)) {
          setClientChatError(toApiErrorFromUnknown(err))
          mapApiError(err)
          await refetch()
          finishAwaitingReply()
          return false
        }

        finishAwaitingReply()
        setClientChatError(toApiErrorFromUnknown(err))

        if (err instanceof ApiClientError && err.status === 409) {
          await refetch()
        }

        mapApiError(err)
        return false
      }
    },
    [
      auditId,
      beginAwaitingReply,
      finishAwaitingReply,
      refetch,
      syncThinkingWithSnapshot,
    ],
  )

  return {
    snapshot,
    clientChatError,
    optimisticUserMessage,
    isAgentThinking,
    isPolling: pollingEnabled,
    isOpening,
    refetch: refetchSnapshot,
    openSession,
    sendMessage,
  }
}
