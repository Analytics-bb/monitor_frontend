import type { SupportMessage } from '@/api/fixtures/supportChatSnapshot'
import { ChatMessage } from '@/components/deep/ChatMessage'
import { AttachmentChips } from '@/components/support/AttachmentChips'
import { cn } from '@/lib/utils'

export interface SupportMessageListProps {
  messages: SupportMessage[]
  attachmentLabels: ReadonlyMap<string, string>
  className?: string
}

/**
 * Список сообщений support-чата с отображением вложений.
 */
export function SupportMessageList({
  messages,
  attachmentLabels,
  className,
}: SupportMessageListProps) {
  if (messages.length === 0) {
    return (
      <p className="text-muted-foreground p-4 text-sm">Сообщений пока нет</p>
    )
  }

  return (
    <div className={cn('space-y-0 p-4', className)} aria-live="polite">
      {messages.map((message) => {
        const attachmentItems =
          message.attachment_ids?.map((id) => ({
            id,
            filename: attachmentLabels.get(id) ?? id.slice(0, 8),
          })) ?? []

        return (
          <div key={message.message_id} className="mb-4">
            <ChatMessage role={message.role} content={message.content} />
            {attachmentItems.length > 0 ? (
              <div
                className={cn(
                  'mt-1 flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <AttachmentChips items={attachmentItems} />
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}
