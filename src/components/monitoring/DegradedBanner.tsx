import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface DegradedBannerProps {
  visible: boolean
  onRetry?: () => void
  className?: string
}

/**
 * Баннер degraded при 503 `scheduler_not_initialized`.
 */
export function DegradedBanner({
  visible,
  onRetry,
  className,
}: DegradedBannerProps) {
  if (!visible) {
    return null
  }

  return (
    <div
      className={cn(
        'border-status-skipped/40 bg-status-skipped/10 text-status-skipped flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
        className,
      )}
      data-testid="degraded-banner"
      role="status"
    >
      <p>
        Scheduler не инициализирован (503). Показаны последние доступные данные.
      </p>
      {onRetry ? (
        <Button type="button" size="sm" className="min-w-28" onClick={onRetry}>
          Повторить
        </Button>
      ) : null}
    </div>
  )
}
