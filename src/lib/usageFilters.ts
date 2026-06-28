import type { AgentUsageRun } from '@/api/usage'

export type AgentKindFilter = AgentUsageRun['agent_kind'] | ''

export interface UsageFiltersState {
  gate_id: string
  agent_kind: AgentKindFilter
  from: string
  to: string
  audit_id: string
}

export interface UsageFilterErrors {
  gate_id?: string
  from?: string
  to?: string
  audit_id?: string
}

export const EMPTY_USAGE_FILTERS: UsageFiltersState = {
  gate_id: '',
  agent_kind: '',
  from: '',
  to: '',
  audit_id: '',
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const AGENT_KINDS = new Set<AgentKindFilter>(['', 'hypothesis', 'deep'])

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
 * Читает значения фильтров usage из query string.
 *
 * @param searchParams - Текущие search params маршрута `/usage`
 */
export function readUsageFiltersFromSearchParams(
  searchParams: URLSearchParams,
): UsageFiltersState {
  const agentKind = searchParams.get('agent_kind') ?? ''

  return {
    gate_id: (searchParams.get('gate_id') ?? '').replace(/\D/g, ''),
    agent_kind: AGENT_KINDS.has(agentKind as AgentKindFilter)
      ? (agentKind as AgentKindFilter)
      : '',
    from: searchParams.get('from') ?? '',
    to: searchParams.get('to') ?? '',
    audit_id: searchParams.get('audit_id') ?? '',
  }
}

/**
 * Записывает фильтры usage в URLSearchParams, сохраняя page/page_size если переданы.
 *
 * @param searchParams - Базовые params (для сохранения pagination keys)
 * @param filters - Применённые фильтры
 */
export function writeUsageFiltersToSearchParams(
  searchParams: URLSearchParams,
  filters: UsageFiltersState,
): URLSearchParams {
  const next = new URLSearchParams(searchParams)

  const setOrDelete = (key: string, value: string) => {
    if (value) {
      next.set(key, value)
    } else {
      next.delete(key)
    }
  }

  setOrDelete('gate_id', filters.gate_id)
  setOrDelete('agent_kind', filters.agent_kind)
  setOrDelete('from', filters.from)
  setOrDelete('to', filters.to)
  setOrDelete('audit_id', filters.audit_id)

  return next
}

/**
 * Проверяет значения фильтров usage перед Apply.
 *
 * @param values - Текущие значения панели фильтров
 */
export function validateUsageFilters(
  values: UsageFiltersState,
): UsageFilterErrors {
  const errors: UsageFilterErrors = {}

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

  if (values.audit_id && !UUID_RE.test(values.audit_id)) {
    errors.audit_id = 'Некорректный UUID'
  }

  return errors
}

/** Возвращает true, если есть хотя бы одна ошибка валидации фильтров. */
export function hasUsageFilterErrors(errors: UsageFilterErrors): boolean {
  return Boolean(
    errors.gate_id || errors.from || errors.to || errors.audit_id,
  )
}

/** Возвращает true, если хотя бы один фильтр не пустой. */
export function hasActiveUsageFilters(filters: UsageFiltersState): boolean {
  return Boolean(
    filters.gate_id ||
      filters.agent_kind ||
      filters.from ||
      filters.to ||
      filters.audit_id,
  )
}
