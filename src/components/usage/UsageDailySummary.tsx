import type { AgentUsageDailyRollup } from '@/api/usage'
import { sumUsageDailyRollups } from '@/lib/usageDaily'
import { cn } from '@/lib/utils'

export interface UsageDailySummaryProps {
  rollups: AgentUsageDailyRollup[]
  isLoading?: boolean
  className?: string
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
