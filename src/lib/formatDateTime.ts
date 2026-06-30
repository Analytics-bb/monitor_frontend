const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const BACKEND_DATE_TIME_RE =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d+))?)?$/

/**
 * Парсит naive datetime с бэка (ISO, SQL, микросекунды) в локальный `Date`.
 *
 * @param value - Строка datetime без таймзоны (MSK as-is)
 * @returns `Date` или `null`, если строка пустая или не распознана
 */
export function parseBackendDateTime(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  let normalized = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T')
  normalized = normalized.replace(
    /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})\.(\d{3})\d*/,
    '$1.$2',
  )

  const parsed = new Date(normalized)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed
  }

  const match = trimmed.match(BACKEND_DATE_TIME_RE)
  if (!match) {
    return null
  }

  const [, year, month, day, hour, minute, second = '0', fraction] = match
  const milliseconds = fraction
    ? Number(fraction.padEnd(3, '0').slice(0, 3))
    : 0

  const manual = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    milliseconds,
  )

  return Number.isNaN(manual.getTime()) ? null : manual
}

/**
 * Форматирует datetime с бэка в `DD.MM.YYYY, HH:mm` без секунд.
 *
 * @param value - ISO/SQL datetime или `null`/`undefined`
 * @returns Отформатированная дата или `null`, если значение пустое или невалидное
 */
export function formatDateTimeRu(
  value: string | null | undefined,
): string | null {
  if (!value) {
    return null
  }

  const date = parseBackendDateTime(value)
  if (!date) {
    return null
  }

  return DATE_TIME_FORMATTER.format(date)
}

/**
 * Форматирует datetime или возвращает исходную строку, если парсинг не удался.
 */
export function formatDateTimeRuOrRaw(value: string): string {
  return formatDateTimeRu(value) ?? value
}

/**
 * Форматирует datetime или `—` для пустых значений.
 */
export function formatDateTimeRuOrDash(
  value: string | null | undefined,
): string {
  return formatDateTimeRu(value) ?? '—'
}
