import { CheckCircle2, XCircle } from 'lucide-react'

import type { StatusResponse } from '@/api/monitoring'
import { getStatusScheduler } from '@/api/fixtures/statusResponse'
import { formatDateTimeRu } from '@/lib/formatDateTime'
import { cn } from '@/lib/utils'

export interface StatusPanelProps {
  /** Последний успешный status или `null`. */
  data: StatusResponse | null
  /** Нет свежих данных / последний fetch с ошибкой. */
  isStale: boolean
  /** 503 scheduler_not_initialized. */
  isDegraded: boolean
}

function formatOptionalDateTime(value: string | null | undefined): string {
  return formatDateTimeRu(value) ?? 'нет'
}

function formatBoolean(value: boolean | null | undefined): string {
  if (value === true) {
    return 'Да'
  }
  if (value === false) {
    return 'Нет'
  }
  return 'нет'
}

function formatOptionalText(value: string | null | undefined): string {
  if (!value) {
    return 'нет'
  }
  return value
}

function formatCount(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return 'нет'
  }
  return value.toLocaleString('ru-RU')
}

function isSchedulerStatusOk(status: string | null | undefined): boolean {
  return status === 'ok'
}

/**
 * Статус scheduler: live-индикатор, `last_status` и поля `scheduler`.
 */
export function StatusPanel({ data, isStale, isDegraded }: StatusPanelProps) {
  const isLive = !isStale && data !== null
  const scheduler = getStatusScheduler(data)
  const lastStatus = scheduler?.last_status

  const fields = [
    {
      label: 'Сервис запущен',
      value: formatOptionalDateTime(scheduler?.created_at),
    },
    {
      label: 'Крайний тик отработал',
      value: formatOptionalDateTime(scheduler?.last_tick_at),
    },
    {
      label: 'Крайний тик запущен',
      value: formatOptionalDateTime(scheduler?.last_tick_started_at),
    },
    {
      label: 'Детектор запущен',
      value: formatBoolean(scheduler?.tick_in_progress),
    },
    {
      label: 'Крайняя ошибка',
      value: formatOptionalText(scheduler?.last_error_code),
    },
    {
      label: 'Всего тиков',
      value: formatCount(scheduler?.ticks_total),
    },
    {
      label: 'Всего тиков с ошибкой',
      value: formatCount(scheduler?.ticks_error_total),
    },
  ] as const

  return (
    <div className="space-y-3" data-testid="status-panel">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
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
              !isDegraded &&
                isLive &&
                'bg-status-success motion-safe:animate-soft-pulse',
              !isDegraded && !isLive && 'bg-muted-foreground/50',
            )}
            data-testid="status-live-indicator"
          />
          <h2 className="text-sm font-semibold">Статус</h2>
        </div>

        {lastStatus ? (
          isSchedulerStatusOk(lastStatus) ? (
            <CheckCircle2
              aria-label="Последний тик: успех"
              className="text-status-success size-5 shrink-0"
              data-testid="status-last-ok-icon"
            />
          ) : (
            <XCircle
              aria-label="Последний тик: ошибка"
              className="text-status-error size-5 shrink-0"
              data-testid="status-last-error-icon"
            />
          )
        ) : null}
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label} className="space-y-0.5">
            <dt className="text-muted-foreground text-xs leading-snug">
              {field.label}
            </dt>
            <dd className="text-foreground font-mono text-sm tabular-nums">
              {field.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
