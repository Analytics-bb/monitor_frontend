import type { DeepChatDisplayMessage } from '@/lib/deepChatDisplay'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { cn } from '@/lib/utils'

export interface ChatMessageProps {
  role: DeepChatDisplayMessage['role']
  content: string
  variant?: DeepChatDisplayMessage['variant']
  className?: string
}

const ROLE_LABELS: Record<DeepChatDisplayMessage['role'], string> = {
  user: 'Вы',
  assistant: 'Агент',
  tool: 'Tool',
}

/**
 * Одно сообщение deep chat: user bubble справа, assistant — borderless markdown.
 */
export function ChatMessage({
  role,
  content,
  variant = 'default',
  className,
}: ChatMessageProps) {
  const isUser = role === 'user'
  const isCompact = role === 'tool'

  if (isCompact) {
    return (
      <div
        className={cn('mb-4 flex justify-start', className)}
        data-testid={`chat-message-${role}`}
      >
        <div
          className={cn(
            'border-border bg-muted/40 max-w-[90%] rounded-md border px-3 py-2 select-text',
            'border-l-status-awaiting-approval border-l-2',
          )}
        >
          <span className="text-muted-foreground mr-2 font-mono text-xs">
            {ROLE_LABELS[role]}:
          </span>
          <ChatMarkdown content={content} tone="compact" className="inline" />
        </div>
      </div>
    )
  }

  if (isUser && variant === 'hypothesis') {
    return (
      <div
        className={cn('mb-6 flex justify-end', className)}
        data-testid="chat-message-hypothesis"
      >
        <div className="bg-elevated text-foreground max-w-[85%] min-w-0 rounded-3xl px-4 py-2.5 select-text">
          <ChatMarkdown content={content} tone="user" structured />
        </div>
      </div>
    )
  }

  if (!isUser) {
    return (
      <div
        className={cn('mb-8 flex w-full justify-start', className)}
        data-testid="chat-message-assistant-wrapper"
      >
        <ChatMarkdown content={content} tone="assistant" structured />
      </div>
    )
  }

  return (
    <div
      className={cn('mb-4 flex justify-end', className)}
      data-testid={`chat-message-${role}`}
    >
      <div className="bg-elevated text-foreground max-w-[80%] rounded-3xl px-4 py-2.5 select-text">
        <ChatMarkdown content={content} tone="user" />
      </div>
    </div>
  )
}
