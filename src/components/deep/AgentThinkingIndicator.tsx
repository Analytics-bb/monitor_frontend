import {
  getAgentThinkingLabel,
  type AgentThinkingPhase,
} from '@/lib/deepChatThinking'
import { cn } from '@/lib/utils'

export interface AgentThinkingIndicatorProps {
  phase?: AgentThinkingPhase
  className?: string
}

/**
 * Индикатор «агент думает» под лентой сообщений.
 *
 * Фазы `mcp` / `mcp_retry` — долгий propose + MCP auto-retry (`docs/api.md`).
 */
export function AgentThinkingIndicator({
  phase = 'forming',
  className,
}: AgentThinkingIndicatorProps) {
  const isRetry = phase === 'mcp_retry'
  const label = getAgentThinkingLabel(phase)
  const dotClassName = isRetry ? 'bg-amber-600/80' : 'bg-muted-foreground/70'

  return (
    <div
      className={cn('mb-4 flex justify-start', className)}
      data-testid="agent-thinking"
      data-thinking-phase={phase}
      aria-live="polite"
      aria-label={`${label}…`}
    >
      <div
        className={cn(
          'inline-flex max-w-[min(100%,28rem)] items-end gap-0.5 rounded-3xl px-4 py-2.5',
          isRetry
            ? 'border border-amber-500/30 bg-amber-500/10'
            : 'bg-muted/50',
        )}
      >
        <span
          className={cn(
            'text-sm',
            isRetry ? 'text-amber-900 dark:text-amber-100' : 'text-muted-foreground',
          )}
        >
          {label}
        </span>
        <span className="inline-flex items-end gap-px mb-px" aria-hidden>
          <span
            className={cn(
              'size-1 animate-bounce rounded-full [animation-delay:0ms]',
              dotClassName,
            )}
          />
          <span
            className={cn(
              'size-1 animate-bounce rounded-full [animation-delay:150ms]',
              dotClassName,
            )}
          />
          <span
            className={cn(
              'size-1 animate-bounce rounded-full [animation-delay:300ms]',
              dotClassName,
            )}
          />
        </span>
      </div>
    </div>
  )
}
