import type { ChatMessage as ChatMessageType } from '@/api/fixtures/chatSnapshot'
import { cn } from '@/lib/utils'

export interface ChatMessageProps {
  role: ChatMessageType['role']
  content: string
  className?: string
}

const ROLE_LABELS: Record<ChatMessageType['role'], string> = {
  user: 'Вы',
  assistant: 'Агент',
  system: 'Система',
  tool: 'Tool',
}

/**
 * Одно сообщение чата: bubble layout по роли.
 *
 * User — справа; assistant — слева; system/tool — compact mono.
 */
export function ChatMessage({ role, content, className }: ChatMessageProps) {
  const isUser = role === 'user'
  const isCompact = role === 'system' || role === 'tool'

  if (isCompact) {
    return (
      <div
        className={cn('mb-3 flex justify-start', className)}
        data-testid={`chat-message-${role}`}
      >
        <div
          className={cn(
            'border-border bg-muted/40 max-w-[90%] rounded-md border px-3 py-2 font-mono text-xs',
            role === 'tool' && 'border-l-status-awaiting-approval border-l-2',
          )}
        >
          <span className="text-muted-foreground mr-2">{ROLE_LABELS[role]}:</span>
          <span className="whitespace-pre-wrap">{content}</span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'mb-3 flex',
        isUser ? 'justify-end' : 'justify-start',
        className,
      )}
      data-testid={`chat-message-${role}`}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap',
          isUser
            ? 'bg-primary/10 text-foreground'
            : 'border-border bg-card text-foreground border',
        )}
      >
        {content}
      </div>
    </div>
  )
}
