import type { AgentUsageRun } from '@/api/usage'

/**
 * Ссылка на страницу usage из deep chat — без фильтров.
 */
export function buildDeepChatUsageHref(): string {
  return '/usage'
}

/**
 * Краткая подпись step_breakdown для таблицы runs.
 */
export function formatUsageStepSummary(
  item: Pick<AgentUsageRun, 'agent_kind' | 'step_breakdown'>,
): string {
  if (item.agent_kind !== 'deep') {
    return '—'
  }

  if (item.step_breakdown.length === 0) {
    return 'Только LLM'
  }

  return item.step_breakdown.map((step) => step.tool_name).join(', ')
}
