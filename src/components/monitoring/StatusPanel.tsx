import type { StatusResponse } from '@/api/monitoring'
import {
  getStatusLastTickAt,
  getStatusReportStatus,
} from '@/api/fixtures/statusResponse'
import { StatusBadge } from '@/components/StatusBadge'
import { cn } from '@/lib/utils'

export interface StatusPanelProps {
  /** Последний успешный status или `null`. */
  data: StatusResponse | null
  /** Нет свежих данных / последний fetch с ошибкой. */
  isStale: boolean
  /** 503 scheduler_not_initialized. */
  isDegraded: boolean
}

/**
 * Статус подключения и данные последнего тика scheduler.
 */
export function StatusPanel({ data, isStale, isDegraded }: StatusPanelProps) {
  const isLive = !isStale && data !== null
  const tickInProgress = data?.tick_in_progress ?? false
  const lastTickAt = getStatusLastTickAt(data)
  const reportStatus = getStatusReportStatus(data)

  return (
    <div className="space-y-3" data-testid="status-panel">
      <h2 className="text-sm font-semibold">Тик</h2>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-label={
              isDegraded
                ? 'Подключение: degraded'
                : isLive
                  ? 'Подключение: live'
                  : 'Подключение: stale'
            }
            className={cn(
              'size-2.5 shrink-0 rounded-full',
              isDegraded && 'bg-status-skipped',
              !isDegraded && isLive && 'bg-status-success',
              !isDegraded && !isLive && 'bg-muted-foreground/50',
              tickInProgress &&
                'bg-status-active motion-safe:animate-pulse',
            )}
          />
          <span className="text-sm font-medium">
            {isDegraded ? 'Degraded' : isLive ? 'Live' : 'Stale'}
          </span>
        </div>

        {reportStatus ? (
          <StatusBadge status={reportStatus} />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        )}
      </div>

      <div className="text-muted-foreground space-y-1 text-sm">
        <span>Последний тик</span>
        <time
          className="text-foreground block font-mono text-base tabular-nums"
          dateTime={lastTickAt ?? undefined}
        >
          {lastTickAt ?? '—'}
        </time>
      </div>

      {tickInProgress ? (
        <span
          className="text-status-active text-xs font-medium motion-safe:animate-pulse"
          data-testid="tick-in-progress"
        >
          Тик выполняется
        </span>
      ) : null}
    </div>
  )
}
