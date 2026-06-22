import { cn } from '@/lib/utils'

type StateRecord = Record<string, unknown>

export interface StateRecordPanelProps {
  title: string
  state: StateRecord | null | undefined
  testId: string
  className?: string
}

function renderValue(value: unknown): string {
  if (value === null || value === undefined) {
    return '—'
  }
  if (typeof value === 'number') {
    return value.toLocaleString('ru-RU')
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

function StateRecordPanel({
  title,
  state,
  testId,
  className,
}: StateRecordPanelProps) {
  const isEmpty = !state || Object.keys(state).length === 0

  return (
    <div className={cn('space-y-3', className)} data-testid={testId}>
      <h2 className="text-sm font-semibold">{title}</h2>
      {isEmpty ? (
        <p className="text-muted-foreground text-sm">Нет данных</p>
      ) : (
        <dl className="grid gap-2 text-sm">
          {Object.entries(state).map(([key, value]) => (
            <div
              key={key}
              className="flex items-baseline justify-between gap-4"
            >
              <dt className="text-muted-foreground">{key}</dt>
              <dd className="font-mono text-right text-xs whitespace-pre-wrap tabular-nums">
                {renderValue(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

export interface TxStatePanelProps {
  txState: StateRecord | null | undefined
  className?: string
}

export function TxStatePanel({ txState, className }: TxStatePanelProps) {
  return (
    <StateRecordPanel
      title="TX state"
      state={txState}
      testId="tx-state-panel"
      className={className}
    />
  )
}

export interface SrStatePanelProps {
  srState: StateRecord | null | undefined
  className?: string
}

export function SrStatePanel({ srState, className }: SrStatePanelProps) {
  return (
    <StateRecordPanel
      title="SR state"
      state={srState}
      testId="sr-state-panel"
      className={className}
    />
  )
}
