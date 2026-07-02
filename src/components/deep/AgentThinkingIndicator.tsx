import { cn } from '@/lib/utils'

export interface AgentThinkingIndicatorProps {
  className?: string
}

/**
 * Индикатор «агент думает» под лентой сообщений.
 */
export function AgentThinkingIndicator({
  className,
}: AgentThinkingIndicatorProps) {
  return (
    <div
      className={cn('mb-4 flex justify-start', className)}
      data-testid="agent-thinking"
      aria-live="polite"
      aria-label="Агент формирует ответ"
    >
      <div className="bg-muted/50 flex items-center gap-1 rounded-3xl px-4 py-2.5">
        <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full [animation-delay:0ms]" />
        <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full [animation-delay:150ms]" />
        <span className="bg-muted-foreground/70 size-1.5 animate-bounce rounded-full [animation-delay:300ms]" />
      </div>
    </div>
  )
}
