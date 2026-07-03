/**
 * Форматирует оценку стоимости в USD (4 знака после запятой).
 */
export function formatCostUsd(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—'
  }

  return value.toFixed(4)
}

/**
 * Подпись стоимости с префиксом `$` для UI.
 */
export function formatCostUsdLabel(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—'
  }

  return `$${formatCostUsd(value)}`
}
