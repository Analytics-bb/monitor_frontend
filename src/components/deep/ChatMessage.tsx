import type { ChatMessage as ChatMessageType } from '@/api/fixtures/chatSnapshot'
import { isAuditSummaryContent } from '@/api/fixtures/auditSummaryFixture'
import { AuditSummaryContent } from '@/components/deep/AuditSummaryContent'
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
 * Assistant audit summary — структурированный блок без bubble; user — справа.
 */
export function ChatMessage({ role, content, className }: ChatMessageProps) {
  const isUser = role === 'user'
  const isCompact = role === 'system' || role === 'tool'
  const isSummary = role === 'assistant' && isAuditSummaryContent(content)

  if (isCompact) {
    return (
      <div
        className={cn('mb-4 flex justify-start', className)}
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

  if (isSummary) {
    return (
      <div
        className={cn('mb-6 flex justify-start', className)}
        data-testid="chat-message-assistant"
      >
        <div className="max-w-full min-w-0 flex-1">
          <AuditSummaryContent content={content} />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'mb-4 flex',
        isUser ? 'justify-end' : 'justify-start',
        className,
      )}
      data-testid={`chat-message-${role}`}
    >
      {isUser ? (
        <div className="bg-elevated text-foreground max-w-[80%] rounded-3xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </div>
      ) : (
        <p className="text-foreground max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      )}
    </div>
  )
}
