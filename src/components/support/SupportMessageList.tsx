import type { SupportMessage } from '@/api/fixtures/supportChatSnapshot'
import { AttachmentChips } from '@/components/support/AttachmentChips'
import { SupportChatMessage } from '@/components/support/SupportChatMessage'
import { cn } from '@/lib/utils'

export interface SupportMessageListProps {
  messages: SupportMessage[]
  attachmentLabels: ReadonlyMap<string, string>
  className?: string
}

function isAttachmentOnlyMessage(content: string): boolean {
  const trimmed = content.trim()
  return trimmed === '' || trimmed === '(вложение)'
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
    return null
  }

  return (
    <div
      className={cn('chat-message-scroll h-full overflow-y-auto', className)}
      data-testid="support-message-list"
    >
      <div className="space-y-6 px-4 py-4" aria-live="polite">
        {messages.map((message) => {
          const attachmentItems =
            message.attachment_ids?.map((id) => ({
              id,
              filename: attachmentLabels.get(id) ?? id.slice(0, 8),
            })) ?? []
          const attachmentOnly = isAttachmentOnlyMessage(message.content)
          const isUser = message.role === 'user'

          return (
            <div key={message.message_id} className="space-y-1.5">
              {!attachmentOnly ? (
                <SupportChatMessage role={message.role} content={message.content} />
              ) : null}
              {attachmentItems.length > 0 ? (
                <AttachmentChips
                  items={attachmentItems}
                  className={isUser ? 'justify-end' : undefined}
                />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
