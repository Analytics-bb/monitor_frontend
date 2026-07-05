import type { SupportMessage } from '@/api/fixtures/supportChatSnapshot'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { cn } from '@/lib/utils'

export interface SupportChatMessageProps {
  role: SupportMessage['role']
  content: string
  className?: string
}

/**
 * Сообщение support-чата: user — bubble справа; assistant — borderless markdown.
 */
export function SupportChatMessage({
  role,
  content,
  className,
}: SupportChatMessageProps) {
  const isUser = role === 'user'

  if (role === 'system') {
    return (
      <div
        className={cn('flex w-full justify-start', className)}
        data-testid="chat-message-system"
      >
        <div className="border-border bg-muted/40 max-w-full min-w-0 rounded-md border px-3 py-2 select-text">
          <ChatMarkdown content={content} tone="system" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start', className)}
      data-testid={`chat-message-${role}`}
    >
      {isUser ? (
        <div className="bg-elevated text-foreground max-w-[50%] min-w-0 rounded-3xl px-4 py-2.5 select-text">
          <ChatMarkdown content={content} tone="user" />
        </div>
      ) : (
        <ChatMarkdown
          content={content}
          tone="assistant"
          className="min-w-0 max-w-full"
        />
      )}
    </div>
  )
}
