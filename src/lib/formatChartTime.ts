import { parseBackendDateTime } from '@/lib/formatDateTime'

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
  const date = parseBackendDateTime(bucket)
  if (!date) {
    return bucket
  }
  return HOUR_FORMATTER.format(date)
}
