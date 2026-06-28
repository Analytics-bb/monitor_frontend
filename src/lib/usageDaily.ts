import type { AgentUsageDailyRollup } from '@/api/usage'

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
