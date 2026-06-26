import type { ApiError } from '@/api/errors'
import { cn } from '@/lib/utils'

export interface ChatErrorPanelProps {
  error: ApiError
  className?: string
}

function formatDetails(details: unknown): string | null {
  if (details == null) {
    return null
  }

  if (typeof details === 'string') {
    return details
  }

  try {
    return JSON.stringify(details, null, 2)
  } catch {
    return String(details)
  }
}

/**
 * Панель ошибки deep chat внутри ChatWindow при `state === error`.
 *
 * Показывает API envelope: `error_code`, `message`, optional `details`.
 */
export function ChatErrorPanel({ error, className }: ChatErrorPanelProps) {
  const detailsText = formatDetails(error.details)

  return (
    <div
      className={cn('flex h-full items-center justify-center p-6', className)}
      data-testid="chat-error-panel"
    >
      <div className="border-destructive/25 bg-destructive/5 w-full max-w-lg space-y-4 rounded-xl border p-6">
        <div className="space-y-2">
          <p className="text-destructive font-mono text-xs font-semibold tracking-wide uppercase">
            {error.error_code}
          </p>
          <h2 className="text-foreground text-lg font-semibold">
            Не удалось продолжить анализ
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {error.message}
          </p>
        </div>
        {detailsText ? (
          <div className="space-y-2">
            <p className="text-muted-foreground text-xs font-medium uppercase">
              Детали
            </p>
            <pre className="border-border bg-card text-foreground/90 max-h-48 overflow-auto rounded-md border p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {detailsText}
            </pre>
          </div>
        ) : null}
      </div>
    </div>
  )
}
