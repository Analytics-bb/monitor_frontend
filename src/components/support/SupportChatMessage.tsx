import type { SupportMessage } from '@/api/fixtures/supportChatSnapshot'
import { cn } from '@/lib/utils'

export interface SupportChatMessageProps {
  role: SupportMessage['role']
  content: string
  className?: string
}

/**
 * Сообщение support-чата: user — до 50% ширины справа; assistant — на всю ширину.
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
        <div className="border-border bg-muted/40 max-w-full min-w-0 rounded-md border px-3 py-2 font-mono text-xs break-words whitespace-pre-wrap">
          {content}
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
        <div className="bg-elevated text-foreground max-w-[50%] min-w-0 rounded-3xl px-4 py-2.5 text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
          {content}
        </div>
      ) : (
        <p className="text-foreground min-w-0 max-w-full text-sm leading-relaxed break-words whitespace-pre-wrap [overflow-wrap:anywhere]">
          {content}
        </p>
      )}
    </div>
  )
}
