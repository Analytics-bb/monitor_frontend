import { useEffect, useMemo, useState } from 'react'

import { mapApiError } from '@/api/errors'
import { ChatWindow } from '@/components/deep/ChatWindow'
import {
  ContextResetBanner,
  SupportComposer,
  SupportHeader,
  SupportMessageList,
} from '@/components/support'
import { useSupportChat } from '@/hooks/useSupportChat'

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

  const handleUpload = async (file: File) => {
    const id = await uploadAttachment(file)
    if (id) {
      setPendingAttachments((current) => [
        ...current,
        { id, filename: file.name },
      ])
    }
  }

  const handleSend = async (content: string, attachmentIds: string[]) => {
    const ok = await sendMessage({
      content: content || undefined,
      attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
    })
    if (ok) {
      setPendingAttachments([])
    }
  }

  const handleReset = () => {
    if (!window.confirm('Сбросить историю support-чата?')) {
      return
    }
    void resetChat().catch(() => undefined)
  }

  return (
    <section
      className="flex h-[calc(100vh-4rem)] min-h-0 flex-col gap-3"
      data-testid="support-page"
    >
      <SupportHeader onReset={handleReset} />

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
            disabled={isProcessing}
            placeholder={
              isProcessing ? 'Ожидание ответа агента…' : 'Напишите в support…'
            }
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
