/**
 * Фаза индикатора «агент думает» во время долгого `POST .../messages`
 * (propose + MCP auto-retry на бэкенде).
 */
export type AgentThinkingPhase = 'forming' | 'mcp' | 'mcp_retry'

const MCP_PHASE_MS = 6_000
const MCP_RETRY_PHASE_MS = 8_000

/**
 * Определяет фазу thinking по времени ожидания и числу записей usage за цикл.
 *
 * `usageIncrements` растёт при polling, когда `usage_total` увеличился без ответа
 * assistant — типично после propose и после неудачного MCP в retry-loop.
 */
export function resolveAgentThinkingPhase({
  elapsedMs,
  usageIncrements,
}: {
  elapsedMs: number
  usageIncrements: number
}): AgentThinkingPhase {
  if (usageIncrements >= 2 && elapsedMs >= MCP_RETRY_PHASE_MS) {
    return 'mcp_retry'
  }

  if (elapsedMs >= MCP_PHASE_MS || usageIncrements >= 1) {
    return 'mcp'
  }

  return 'forming'
}

/**
 * Подпись для UI по фазе thinking.
 */
export function getAgentThinkingLabel(phase: AgentThinkingPhase): string {
  switch (phase) {
    case 'mcp_retry':
      return 'MCP-запрос не удался — выполняется следующая попытка'
    case 'mcp':
      return 'Выполняется запрос к аналитике (MCP)'
    case 'forming':
    default:
      return 'Агент формирует ответ'
  }
}
