import { cn } from '@/lib/utils'

export interface AgentConclusionContentProps {
  /** HTML или plain text из `report.conclusion`. */
  content: string
  className?: string
}

function isHtmlContent(content: string): boolean {
  return /^\s*</.test(content)
}

/**
 * Рендер вывода агента: HTML через `dangerouslySetInnerHTML` или plain text fallback.
 */
export function AgentConclusionContent({
  content,
  className,
}: AgentConclusionContentProps) {
  if (!isHtmlContent(content)) {
    return (
      <p
        className={cn('text-sm leading-relaxed whitespace-pre-wrap', className)}
      >
        {content}
      </p>
    )
  }

  return (
    <div
      className={cn('agent-conclusion text-sm leading-relaxed', className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
