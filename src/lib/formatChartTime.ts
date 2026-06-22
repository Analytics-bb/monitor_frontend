const HOUR_FORMATTER = new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
})

/**
 * Форматирует bucket времени для оси X графика.
 *
 * @param bucket - ISO datetime или SQL bucket string
 * @returns Короткая метка `HH:mm`
 */
export function formatChartTimeBucket(bucket: string): string {
  const normalized = bucket.includes('T') ? bucket : bucket.replace(' ', 'T')
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    return bucket
  }
  return HOUR_FORMATTER.format(date)
}
