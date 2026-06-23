import type { DeepCasesFilterValues } from '@/components/deep/DeepCasesFilters'

export interface DeepCasesFilterErrors {
  gate_id?: string
  from?: string
  to?: string
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_RE.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

/**
 * Проверяет значения фильтров deep list перед Apply.
 *
 * Gate — только цифры; даты — `yyyy-mm-dd` или пусто; при заполненных from/to
 * проверяется, что `to` не раньше `from`.
 *
 * @param values - Текущие значения панели фильтров
 * @returns Объект ошибок по полям; пустой объект — валидация пройдена
 */
export function validateDeepCasesFilters(
  values: DeepCasesFilterValues,
): DeepCasesFilterErrors {
  const errors: DeepCasesFilterErrors = {}

  if (values.gate_id && !/^\d+$/.test(values.gate_id)) {
    errors.gate_id = 'Только цифры'
  }

  if (values.from && !isValidIsoDate(values.from)) {
    errors.from = 'Формат yyyy-mm-dd'
  }

  if (values.to && !isValidIsoDate(values.to)) {
    errors.to = 'Формат yyyy-mm-dd'
  }

  if (
    !errors.from &&
    !errors.to &&
    values.from &&
    values.to &&
    values.from > values.to
  ) {
    errors.to = 'Дата «до» раньше «от»'
  }

  return errors
}

/**
 * Возвращает true, если в объекте ошибок фильтров есть хотя бы одно поле.
 *
 * @param errors - Результат `validateDeepCasesFilters`
 */
export function hasDeepCasesFilterErrors(
  errors: DeepCasesFilterErrors,
): boolean {
  return Boolean(errors.gate_id || errors.from || errors.to)
}
