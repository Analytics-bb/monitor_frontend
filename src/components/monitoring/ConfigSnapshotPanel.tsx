import { cn } from '@/lib/utils'

export interface ConfigSnapshotPanelProps {
  configSnapshot: Record<string, unknown> | null | undefined
  className?: string
}

const HIDDEN_FIELDS = new Set(['gate_id', 'created_at', 'updated_at'])

const CONFIG_FIELD_LABELS: Record<string, string> = {
  slice_minutes: 'Длина шага',
  window_slices: 'Кол-во шагов',
  quantile_low: 'Порог нижнего квантиля',
  quantile_high: 'Порог верхнего квантиля',
  persistence: 'Срабатываний подряд',
  mode: 'Режим детекции',
}

const CONFIG_DISPLAY_ORDER = [
  'slice_minutes',
  'window_slices',
  'quantile_low',
  'quantile_high',
  'persistence',
  'mode',
] as const

function formatValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'number') {
    return value.toLocaleString('ru-RU')
  }
  return String(value)
}

function getVisibleEntries(
  configSnapshot: Record<string, unknown>,
): Array<[string, unknown]> {
  const visible = Object.entries(configSnapshot).filter(
    ([key]) => !HIDDEN_FIELDS.has(key),
  )

  const orderIndex = new Map(
    CONFIG_DISPLAY_ORDER.map((key, index) => [key, index]),
  )

  return visible.sort(([keyA], [keyB]) => {
    const indexA = orderIndex.get(keyA as (typeof CONFIG_DISPLAY_ORDER)[number])
    const indexB = orderIndex.get(keyB as (typeof CONFIG_DISPLAY_ORDER)[number])

    if (indexA !== undefined && indexB !== undefined) {
      return indexA - indexB
    }
    if (indexA !== undefined) {
      return -1
    }
    if (indexB !== undefined) {
      return 1
    }
    return keyA.localeCompare(keyB)
  })
}

function getFieldLabel(key: string): string {
  return CONFIG_FIELD_LABELS[key] ?? key
}

/**
 * Read-only просмотр `config_snapshot` — настройки конфига.
 */
export function ConfigSnapshotPanel({
  configSnapshot,
  className,
}: ConfigSnapshotPanelProps) {
  const entries = configSnapshot ? getVisibleEntries(configSnapshot) : []

  if (entries.length === 0) {
    return (
      <p className="text-muted-foreground text-sm" data-testid="config-empty">
        Нет snapshot
      </p>
    )
  }

  return (
    <div className={cn('space-y-3', className)} data-testid="config-snapshot">
      <h2 className="text-sm font-semibold">Настройки конфига</h2>
      <dl className="grid gap-2 text-sm">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-baseline justify-between gap-4"
          >
            <dt className="text-muted-foreground">{getFieldLabel(key)}</dt>
            <dd className="font-mono text-right tabular-nums">
              {formatValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
