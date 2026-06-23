const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Форматирует ISO datetime в `DD.MM.YYYY, HH:mm` без секунд.
 *
 * @param iso - ISO-строка или `null`/`undefined`
 * @returns Отформатированная дата или `null`, если значение пустое или невалидное
 */
export function formatDateTimeRu(
  iso: string | null | undefined,
): string | null {
  if (!iso) {
    return null
  }

  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return DATE_TIME_FORMATTER.format(date)
}
