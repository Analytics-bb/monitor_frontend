import { isAuditSummaryContent } from '@/api/fixtures/auditSummaryFixture'
import { ChatMarkdown } from '@/components/chat/ChatMarkdown'
import { isHtmlChatContent } from '@/lib/normalizeChatMarkdown'
import { cn } from '@/lib/utils'

export interface AgentConclusionContentProps {
  /** HTML или structured markdown из `report.conclusion`. */
  content: string
  className?: string
}

/**
 * Рендер вывода hypothesis-агента на мониторинге.
 *
 * HTML и structured markdown — через {@link ChatMarkdown} (как в deep chat).
 */
export function AgentConclusionContent({
  content,
  className,
}: AgentConclusionContentProps) {
  const structured =
    isHtmlChatContent(content) || isAuditSummaryContent(content)

  return (
    <ChatMarkdown
      content={content}
      tone="assistant"
      structured={structured}
      className={cn('text-sm', className)}
    />
  )
}
