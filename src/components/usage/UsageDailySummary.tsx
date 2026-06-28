import type { AgentUsageDailyRollup } from '@/api/usage'
import { cn } from '@/lib/utils'

export interface UsageDailySummaryProps {
  rollups: AgentUsageDailyRollup[]
  isLoading?: boolean
  className?: string
}

export interface UsageDailyTotals {
  totalTokens: number
  totalCostUsd: number
  runCount: number
}

/**
 * Суммирует daily rollups для stat cards.
 *
 * @param rollups - Элементы `GET /agent/usage/daily`
 */
export function sumUsageDailyRollups(
  rollups: AgentUsageDailyRollup[],
): UsageDailyTotals {
  return rollups.reduce(
    (acc, item) => ({
      totalTokens: acc.totalTokens + item.total_tokens,
      totalCostUsd: acc.totalCostUsd + item.total_cost_usd,
      runCount: acc.runCount + item.run_count,
    }),
    { totalTokens: 0, totalCostUsd: 0, runCount: 0 },
  )
}

/**
 * Возвращает сегодняшнюю дату в формате `yyyy-mm-dd` без TZ-конвертации API.
 */
export function getUsageTodayDateString(reference = new Date()): string {
  const year = reference.getFullYear()
  const month = String(reference.getMonth() + 1).padStart(2, '0')
  const day = String(reference.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function SummaryCard({
  label,
  value,
  testId,
}: {
  label: string
  value: string
  testId: string
}) {
  return (
    <div
      className="border-border bg-card rounded-lg border px-4 py-3"
      data-testid={testId}
    >
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold tabular-nums">{value}</p>
    </div>
  )
}

/**
 * Daily summary cards для deep usage (client-side sum rollups).
 */
export function UsageDailySummary({
  rollups,
  isLoading = false,
  className,
}: UsageDailySummaryProps) {
  const totals = sumUsageDailyRollups(rollups)

  if (isLoading) {
    return (
      <div
        className={cn('grid grid-cols-1 gap-3 sm:grid-cols-3', className)}
        data-testid="usage-daily-summary-loading"
      >
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="bg-muted/60 h-16 animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn('grid grid-cols-1 gap-3 sm:grid-cols-3', className)}
      data-testid="usage-daily-summary"
    >
      <SummaryCard
        label="Deep tokens today"
        value={totals.totalTokens.toLocaleString('ru-RU')}
        testId="usage-daily-tokens"
      />
      <SummaryCard
        label="Deep cost USD"
        value={totals.totalCostUsd.toFixed(4)}
        testId="usage-daily-cost"
      />
      <SummaryCard
        label="Deep runs"
        value={String(totals.runCount)}
        testId="usage-daily-runs"
      />
    </div>
  )
}
