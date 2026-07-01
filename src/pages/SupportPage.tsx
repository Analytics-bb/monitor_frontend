import { useEffect, useMemo, useState } from 'react'

import { mapApiError } from '@/api/errors'
import { ChatWindow } from '@/components/deep/ChatWindow'
import {
  ContextResetBanner,
  SupportComposer,
  SupportHeader,
  SupportHistoryLimitBanner,
  SupportMessageList,
} from '@/components/support'
import { useSupportChat } from '@/hooks/useSupportChat'
import {
  countSupportHistoryMessages,
  getSupportHistoryLimitFromEnv,
  isSupportHistoryLimitReached,
} from '@/lib/supportHistory'

/**
 * Страница `/support` — user-centric support-чат с вложениями и polling.
 */
export function SupportPage() {
  const {
    snapshot,
    error,
    attachmentLabels,
    sendMessage,
    uploadAttachment,
    resetChat,
  } = useSupportChat()

  const [pendingAttachments, setPendingAttachments] = useState<
    { id: string; filename: string }[]
  >([])
  const [dismissedContextGeneration, setDismissedContextGeneration] = useState<
    number | null
  >(null)
  const [historyLimitDeclined, setHistoryLimitDeclined] = useState(false)

  useEffect(() => {
    if (error) {
      mapApiError(error)
    }
  }, [error])

  const isProcessing = snapshot?.state === 'processing'
  const showResetBanner =
    Boolean(snapshot?.context_reset) &&
    dismissedContextGeneration !== snapshot?.context_generation

  const messages = useMemo(() => snapshot?.messages ?? [], [snapshot?.messages])
  const historyMessageCount = useMemo(
    () => countSupportHistoryMessages(messages),
    [messages],
  )
  const historyMessageLimit =
    snapshot?.history_message_limit ?? getSupportHistoryLimitFromEnv()
  const isHistoryLimitReached = isSupportHistoryLimitReached(
    historyMessageCount,
    historyMessageLimit,
  )

  useEffect(() => {
    if (!isHistoryLimitReached) {
      setHistoryLimitDeclined(false)
    }
  }, [isHistoryLimitReached])

  const isComposerBlockedByHistory = isHistoryLimitReached
  const composerDisabled = isProcessing || isComposerBlockedByHistory

  const composerPlaceholder = useMemo(() => {
    if (isProcessing) {
      return 'Ожидание ответа агента…'
    }
    if (isComposerBlockedByHistory) {
      return historyLimitDeclined
        ? 'Отправка заблокирована — очистите историю'
        : 'Очистите историю, чтобы продолжить'
    }
    return 'Напишите в support…'
  }, [historyLimitDeclined, isComposerBlockedByHistory, isProcessing])

  const handleUpload = async (file: File) => {
    if (isComposerBlockedByHistory) {
      return
    }
    const id = await uploadAttachment(file)
    if (id) {
      setPendingAttachments((current) => [
        ...current,
        { id, filename: file.name },
      ])
    }
  }

  const handleSend = async (content: string, attachmentIds: string[]) => {
    if (isComposerBlockedByHistory) {
      return
    }
    const ok = await sendMessage({
      content: content || undefined,
      attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
    })
    if (ok) {
      setPendingAttachments([])
    }
  }

  const handleAcceptHistoryReset = () => {
    setHistoryLimitDeclined(false)
    setPendingAttachments([])
    void resetChat().catch(() => undefined)
  }

  const handleDeclineHistoryReset = () => {
    setHistoryLimitDeclined(true)
    setPendingAttachments([])
  }

  return (
    <section
      className="-mb-6 flex h-[calc(100svh-2.5rem)] min-h-0 flex-col gap-2 overflow-hidden"
      data-testid="support-page"
    >
      <SupportHeader
        historyMessageCount={historyMessageCount}
        historyMessageLimit={historyMessageLimit}
      />

      <SupportHistoryLimitBanner
        visible={isHistoryLimitReached}
        declined={historyLimitDeclined}
        onAcceptReset={handleAcceptHistoryReset}
        onDecline={handleDeclineHistoryReset}
      />

      <ContextResetBanner
        visible={showResetBanner}
        onDismiss={() =>
          setDismissedContextGeneration(snapshot?.context_generation ?? null)
        }
      />

      <ChatWindow
        className="min-h-0 flex-1"
        emptyState={
          messages.length === 0 ? (
            <p className="text-muted-foreground text-base font-medium">
              Задайте ваш вопрос
            </p>
          ) : undefined
        }
        messages={
          <SupportMessageList
            messages={messages}
            attachmentLabels={attachmentLabels}
          />
        }
        composer={
          <SupportComposer
            disabled={composerDisabled}
            placeholder={composerPlaceholder}
            pendingAttachments={pendingAttachments}
            onUpload={handleUpload}
            onRemoveAttachment={(id) => {
              setPendingAttachments((current) =>
                current.filter((item) => item.id !== id),
              )
            }}
            onSend={handleSend}
          />
        }
      />
    </section>
  )
}
