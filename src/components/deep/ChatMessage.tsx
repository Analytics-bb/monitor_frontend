import type { DeepChatDisplayMessage } from '@/lib/deepChatDisplay'
import { AgentConclusionContent } from '@/components/monitoring/AgentConclusionContent'
import { isAuditSummaryContent } from '@/api/fixtures/auditSummaryFixture'
import { AuditSummaryContent } from '@/components/deep/AuditSummaryContent'
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

function isHtmlContent(content: string): boolean {
  return /^\s*</.test(content.trim())
}

/**
 * Одно сообщение чата: bubble layout по роли.
 *
 * Hypothesis user message — вывод hypothesis-агента; assistant audit summary — структурированный блок.
 */
export function ChatMessage({
  role,
  content,
  variant = 'default',
  className,
}: ChatMessageProps) {
  const isUser = role === 'user'
  const isCompact = role === 'tool'
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
            'border-l-status-awaiting-approval border-l-2',
          )}
        >
          <span className="text-muted-foreground mr-2">{ROLE_LABELS[role]}:</span>
          <span className="whitespace-pre-wrap">{content}</span>
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
        <div className="bg-elevated text-foreground max-w-[85%] min-w-0 rounded-3xl px-4 py-2.5 text-sm leading-relaxed">
          {isHtmlContent(content) ? (
            <AgentConclusionContent content={content} />
          ) : isAuditSummaryContent(content) ? (
            <AuditSummaryContent content={content} />
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
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
        <div className="border-border bg-card max-w-full min-w-0 flex-1 rounded-xl border px-4 py-3 shadow-sm">
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
