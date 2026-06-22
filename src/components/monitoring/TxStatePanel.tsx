import { cn } from '@/lib/utils'

interface BaselineMetrics {
  min: number
  max: number
  mean: number
  q_low: number
  q_high: number
}

interface EventStateShape {
  value?: number
  classification?: string
  direction?: string | null
  streak?: number
  baseline_slices_count?: number
  baseline?: BaselineMetrics
}

const BASELINE_METRICS: Array<{ key: keyof BaselineMetrics; label: string }> = [
  { key: 'min', label: 'Мин' },
  { key: 'max', label: 'Макс' },
  { key: 'mean', label: 'Среднее' },
  { key: 'q_low', label: 'Q низ' },
  { key: 'q_high', label: 'Q верх' },
]

function formatNumber(value: unknown): string {
  if (typeof value !== 'number') {
    return '—'
  }
  return value.toLocaleString('ru-RU')
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'number') {
    return formatNumber(value)
  }
  return String(value)
}

function isBaselineMetrics(value: unknown): value is BaselineMetrics {
  if (!value || typeof value !== 'object') {
    return false
  }
  const baseline = value as Record<string, unknown>
  return (
    typeof baseline.min === 'number' &&
    typeof baseline.max === 'number' &&
    typeof baseline.mean === 'number' &&
    typeof baseline.q_low === 'number' &&
    typeof baseline.q_high === 'number'
  )
}

function parseEventState(state: Record<string, unknown> | null | undefined): EventStateShape | null {
  if (!state || Object.keys(state).length === 0) {
    return null
  }

  return {
    value: typeof state.value === 'number' ? state.value : undefined,
    direction:
      typeof state.direction === 'string' || state.direction === null
        ? state.direction
        : undefined,
    streak: typeof state.streak === 'number' ? state.streak : undefined,
    baseline: isBaselineMetrics(state.baseline) ? state.baseline : undefined,
  }
}

interface EventStateSummaryPanelProps {
  title: string
  state: Record<string, unknown> | null | undefined
  testId: string
  className?: string
}

function EventStateSummaryPanel({
  title,
  state,
  testId,
  className,
}: EventStateSummaryPanelProps) {
  const parsed = parseEventState(state)

  return (
    <div className={cn('space-y-3', className)} data-testid={testId}>
      <h2 className="text-sm font-semibold">{title}</h2>

      {!parsed ? (
        <p className="text-muted-foreground text-sm">Нет данных</p>
      ) : (
        <div className="space-y-4">
          <dl className="grid gap-2 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Текущее значение</dt>
              <dd className="font-mono tabular-nums">
                {formatScalar(parsed.value)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Направление аномалии</dt>
              <dd className="font-mono tabular-nums">
                {formatScalar(parsed.direction)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Срабатываний подряд</dt>
              <dd className="font-mono tabular-nums">
                {formatScalar(parsed.streak)}
              </dd>
            </div>
          </dl>

          {parsed.baseline ? (
            <div className="space-y-2">
              <p className="text-muted-foreground text-xs font-medium">
                Исторические показатели
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                {BASELINE_METRICS.map(({ key, label }) => (
                  <div
                    key={key}
                    className="border-border bg-muted/30 rounded-md border px-2 py-2 text-center"
                  >
                    <p className="text-muted-foreground text-[11px]">{label}</p>
                    <p className="mt-0.5 font-mono text-sm font-medium tabular-nums">
                      {formatNumber(parsed.baseline![key])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}

export interface TxStatePanelProps {
  txState: Record<string, unknown> | null | undefined
  className?: string
}

/** Сводка по объёму транзакций из `event.tx_state`. */
export function TxStatePanel({ txState, className }: TxStatePanelProps) {
  return (
    <EventStateSummaryPanel
      title="Сводка по объёму транзакций"
      state={txState}
      testId="tx-state-panel"
      className={className}
    />
  )
}

export interface SrStatePanelProps {
  srState: Record<string, unknown> | null | undefined
  className?: string
}

/** Сводка по конверсии из `event.sr_state`. */
export function SrStatePanel({ srState, className }: SrStatePanelProps) {
  return (
    <EventStateSummaryPanel
      title="Сводка по конверсии"
      state={srState}
      testId="sr-state-panel"
      className={className}
    />
  )
}
