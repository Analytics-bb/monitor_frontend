import { cn } from '@/lib/utils'
import { getSupportHistoryFillRatio } from '@/lib/supportHistory'

export interface SupportHistoryMeterProps {
  messageCount: number
  limit: number
  className?: string
}

/**
 * Шкала заполнения истории support-чата (только индикатор).
 */
export function SupportHistoryMeter({
  messageCount,
  limit,
  className,
}: SupportHistoryMeterProps) {
  const fillRatio = getSupportHistoryFillRatio(messageCount, limit)
  const fillPercent = Math.round(fillRatio * 100)
  const isNearLimit = fillRatio >= 0.8
  const isFull = fillRatio >= 1

  return (
    <div
      className={cn(
        'flex min-w-[7.5rem] flex-col gap-1.5 rounded-md px-2 py-1.5',
        className,
      )}
      data-testid="support-history-meter"
      aria-label={`История чата: ${messageCount} из ${limit} сообщений`}
    >
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <span>История</span>
        <span className="tabular-nums">
          {messageCount}/{limit}
        </span>
      </div>
      <div
        className="bg-muted h-1.5 w-full overflow-hidden rounded-full"
        aria-hidden
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-200',
            isFull
              ? 'bg-destructive'
              : isNearLimit
                ? 'bg-accent-warn'
                : 'bg-primary',
          )}
          style={{ width: `${fillPercent}%` }}
        />
      </div>
    </div>
  )
}
