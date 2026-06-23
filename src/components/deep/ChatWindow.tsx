import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export interface ChatWindowProps {
  /** Scrollable messages area. */
  messages: ReactNode
  /** Sticky approval bar между messages и composer. */
  approval?: ReactNode
  /** Sticky composer внизу. */
  composer?: ReactNode
  /** Центрированный empty state поверх messages (not_started). */
  emptyState?: ReactNode
  /** Баннер terminal state над composer. */
  terminalBanner?: ReactNode
  className?: string
}

/**
 * Вертикальный LLM-layout: flex-1 scroll messages + sticky approval + sticky composer.
 *
 * Composer всегда внизу; на mobile — тот же vertical stack.
 */
export function ChatWindow({
  messages,
  approval,
  composer,
  emptyState,
  terminalBanner,
  className,
}: ChatWindowProps) {
  return (
    <div
      className={cn(
        'border-border bg-card flex min-h-0 flex-1 flex-col rounded-lg border',
        className,
      )}
      data-testid="chat-window"
    >
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1" data-testid="chat-window-messages">
          {messages}
        </div>
        {emptyState ? (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-4"
            data-testid="chat-window-empty"
          >
            <div className="pointer-events-auto">{emptyState}</div>
          </div>
        ) : null}
      </div>

      {approval ? (
        <div className="shrink-0" data-testid="chat-window-approval">
          {approval}
        </div>
      ) : null}

      {terminalBanner ? (
        <div className="shrink-0" data-testid="chat-window-terminal-banner">
          {terminalBanner}
        </div>
      ) : null}

      {composer ? (
        <div
          className="border-border shrink-0 border-t p-3"
          data-testid="chat-window-composer"
        >
          {composer}
        </div>
      ) : null}
    </div>
  )
}
