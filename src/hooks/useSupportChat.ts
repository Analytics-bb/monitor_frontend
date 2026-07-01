import { useCallback, useMemo, useState } from 'react'

import {
  getSupportChat,
  resetSupportChat,
  sendSupportMessage,
  uploadSupportAttachment,
  type SendSupportMessageInput,
  type SupportChatSnapshot,
} from '@/api/support'
import { ApiClientError, isApiErrorCode } from '@/api/errors'
import { usePolling } from '@/hooks/usePolling'

/** Интервал polling при `processing` (середина 1–2 с, M18). */
const PROCESSING_INTERVAL_MS = 1_500

export interface UseSupportChatResult {
  /** Последний snapshot или `null` до первого успешного GET. */
  snapshot: SupportChatSnapshot | null
  /** Последняя ошибка fetch/mutation. */
  error: unknown
  /** Polling включён по текущему state. */
  isPolling: boolean
  /** Кэш имён вложений по `attachment_id`. */
  attachmentLabels: ReadonlyMap<string, string>
  /** Немедленный GET snapshot. */
  refetch: () => Promise<void>
  /**
   * POST message. При 409 `chat_processing` — refetch, draft снаружи.
   *
   * @returns `true` если сообщение отправлено
   */
  sendMessage: (input: SendSupportMessageInput) => Promise<boolean>
  /** POST attachment upload; обновляет `attachmentLabels`. */
  uploadAttachment: (file: File) => Promise<string | null>
  /** POST reset истории. */
  resetChat: () => Promise<void>
}

function isPollingEnabled(snapshot: SupportChatSnapshot | null): boolean {
  if (!snapshot) {
    return true
  }
  return snapshot.state === 'processing'
}

/**
 * Polling и мутации support chat для `/support`.
 *
 * Polling только при `state=processing`; после POST — immediate GET.
 * На unmount polling останавливается через {@link usePolling}.
 */
export function useSupportChat(): UseSupportChatResult {
  const [snapshot, setSnapshot] = useState<SupportChatSnapshot | null>(null)
  const [error, setError] = useState<unknown>(null)
  const [attachmentLabels, setAttachmentLabels] = useState(
    () => new Map<string, string>(),
  )

  const fetcher = useCallback(async (): Promise<SupportChatSnapshot | null> => {
    try {
      const result = await getSupportChat()
      setSnapshot(result)
      setError(null)
      return result
    } catch (err) {
      setError(err)
      return null
    }
  }, [])

  const pollingEnabled = useMemo(() => isPollingEnabled(snapshot), [snapshot])

  const { refetch } = usePolling({
    fetcher,
    intervalMs: PROCESSING_INTERVAL_MS,
    enabled: pollingEnabled,
  })

  const refetchSnapshot = useCallback(async () => {
    await refetch()
  }, [refetch])

  const sendMessage = useCallback(
    async (input: SendSupportMessageInput): Promise<boolean> => {
      try {
        const result = await sendSupportMessage(input)
        setSnapshot(result)
        setError(null)
        await refetch()
        return true
      } catch (err) {
        if (
          err instanceof ApiClientError &&
          (err.status === 409 || isApiErrorCode(err, 'chat_processing'))
        ) {
          await refetch()
        }
        setError(err)
        return false
      }
    },
    [refetch],
  )

  const uploadAttachment = useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const result = await uploadSupportAttachment(file)
        setAttachmentLabels((current) => {
          const next = new Map(current)
          next.set(result.attachment_id, result.filename)
          return next
        })
        setError(null)
        await refetch()
        return result.attachment_id
      } catch (err) {
        setError(err)
        return null
      }
    },
    [refetch],
  )

  const resetChat = useCallback(async () => {
    try {
      const result = await resetSupportChat()
      setSnapshot(result)
      setError(null)
      await refetch()
    } catch (err) {
      setError(err)
      throw err
    }
  }, [refetch])

  return {
    snapshot,
    error,
    isPolling: pollingEnabled,
    attachmentLabels,
    refetch: refetchSnapshot,
    sendMessage,
    uploadAttachment,
    resetChat,
  }
}
