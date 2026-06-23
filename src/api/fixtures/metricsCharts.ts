import { z } from 'zod'

import {
  CHART_SERIES_THEME_COLORS,
  MONITORING_CHART_COLORS,
  MONITORING_CHART_PALETTE,
} from '@/components/monitoring/chartTheme'
import { formatChartTimeBucket } from '@/lib/formatChartTime'

const tx24hRowSchema = z.object({
  hour_bucket: z.string(),
  tx_count: z.number(),
})

const txStatus24hRowSchema = z.object({
  hour_bucket: z.string(),
  approved_count: z.number(),
  declined_count: z.number(),
})

const errors24hRowSchema = z.object({
  hour_bucket: z.string(),
  error_code: z.string(),
  error_description: z.string().optional(),
  cnt: z.number(),
})

const usersTxBuckets24hRowSchema = z.object({
  hour_bucket: z.string(),
  tx_count: z.number(),
  user_count: z.number(),
})

const usersTxBuckets3h10mRowSchema = z.object({
  time_bucket: z.string(),
  tx_count: z.number(),
  user_count: z.number(),
})

const topIpsTxDetails3hRowSchema = z.object({
  ip: z.string(),
  tx_count: z.number(),
  customer_email: z.string().optional(),
  customer_country: z.string().optional(),
  customer_first_name: z.string().optional(),
  customer_last_name: z.string().optional(),
  card_number: z.string().optional(),
})

const successRateByHourCountry24hRowSchema = z.object({
  hour_bucket: z.string(),
  customer_country: z.string(),
  approved_count: z.number(),
  declined_count: z.number(),
  success_rate: z.number().nullable(),
})

/** Сырые результаты SQL-tools для графиков monitoring. */
export const metricsToolsSchema = z.object({
  tx_24h: z.array(tx24hRowSchema),
  tx_status_24h: z.array(txStatus24hRowSchema),
  errors_24h: z.array(errors24hRowSchema),
  users_tx_buckets_24h: z.array(usersTxBuckets24hRowSchema),
  users_tx_buckets_3h_10m: z.array(usersTxBuckets3h10mRowSchema),
  top_ips_tx_details_3h: z.array(topIpsTxDetails3hRowSchema),
  success_rate_by_hour_country_24h: z.array(successRateByHourCountry24hRowSchema),
})

export type MetricsTools = z.infer<typeof metricsToolsSchema>

export type MetricsChartType = 'line' | 'multiLine' | 'dualAxis' | 'bar'

export interface MetricsChartSeries {
  key: string
  label: string
  color: string
  /** Текст ошибки для tooltip (например, error_description). */
  description?: string
  /** Ось Y для dualAxis: left — пользователи, right — транзакции. */
  yAxisId?: 'left' | 'right'
}

/** Дополнительные поля во всплывающей подсказке графика. */
export interface MetricsChartTooltipField {
  label: string
  key: string
}

export const TOP_IP_TOOLTIP_FIELDS: MetricsChartTooltipField[] = [
  { label: 'Почта', key: 'customer_email' },
  { label: 'Страна', key: 'customer_country' },
  { label: 'Имя', key: 'customer_first_name' },
  { label: 'Фамилия', key: 'customer_last_name' },
  { label: 'Номер карты', key: 'card_number' },
]

export interface MetricsChartSlide {
  key: string
  title: string
  type: MetricsChartType
  xKey: string
  data: Array<Record<string, string | number>>
  series: MetricsChartSeries[]
  /** Фиксированный диапазон левой оси Y. */
  yAxisDomain?: [number, number]
  /** Формат тиков левой оси Y. */
  yAxisTickFormatter?: (value: number) => string
  yAxisDomainRight?: [number, number]
  yAxisTickFormatterRight?: (value: number) => string
  tooltipFields?: MetricsChartTooltipField[]
  /** Только поля tooltipFields, без IP и значений серий. */
  tooltipFieldsOnly?: boolean
}

const CHART_COLORS = MONITORING_CHART_PALETTE

function pivotByBucket<T extends Record<string, string | number>>(
  rows: T[],
  bucketKey: keyof T,
  valueKey: keyof T,
  groupKey: keyof T,
  formatBucket: (value: string) => string = formatChartTimeBucket,
): { data: MetricsChartSlide['data']; groups: string[] } {
  const buckets = new Map<string, Record<string, string | number>>()
  const groups = new Set<string>()

  for (const row of rows) {
    const bucket = String(row[bucketKey])
    const group = String(row[groupKey])
    const label = formatBucket(bucket)
    groups.add(group)

    const point = buckets.get(label) ?? { label }
    point[group] = Number(row[valueKey])
    buckets.set(label, point)
  }

  return {
    data: Array.from(buckets.values()),
    groups: Array.from(groups),
  }
}

function buildTx24hSlide(rows: MetricsTools['tx_24h']): MetricsChartSlide {
  return {
    key: 'tx_24h',
    title: 'Объём транзакций (24ч)',
    type: 'bar',
    xKey: 'label',
    data: rows.map((row) => ({
      label: formatChartTimeBucket(row.hour_bucket),
      value: row.tx_count,
    })),
    series: [
      { key: 'value', label: 'Транзакции', color: MONITORING_CHART_COLORS.blue },
    ],
  }
}

function buildTxStatus24hSlide(
  rows: MetricsTools['tx_status_24h'],
): MetricsChartSlide {
  return {
    key: 'tx_status_24h',
    title: 'Approved / Declined (24ч)',
    type: 'multiLine',
    xKey: 'label',
    data: rows.map((row) => ({
      label: formatChartTimeBucket(row.hour_bucket),
      approved: row.approved_count,
      declined: row.declined_count,
    })),
    series: [
      {
        key: 'approved',
        label: 'Approved',
        color: CHART_SERIES_THEME_COLORS.approved,
      },
      {
        key: 'declined',
        label: 'Declined',
        color: CHART_SERIES_THEME_COLORS.declined,
      },
    ],
  }
}

function buildErrors24hSlide(rows: MetricsTools['errors_24h']): MetricsChartSlide {
  const descriptions = new Map<string, string>()

  for (const row of rows) {
    if (row.error_description) {
      descriptions.set(row.error_code, row.error_description)
    }
  }

  const { data, groups } = pivotByBucket(
    rows,
    'hour_bucket',
    'cnt',
    'error_code',
  )

  return {
    key: 'errors_24h',
    title: 'Ошибки по кодам (24ч)',
    type: 'multiLine',
    xKey: 'label',
    data,
    series: groups.map((group, index) => ({
      key: group,
      label: group,
      description: descriptions.get(group),
      color: CHART_COLORS[index % CHART_COLORS.length]!,
    })),
  }
}

function buildUsersTxBuckets24hSlide(
  rows: MetricsTools['users_tx_buckets_24h'],
): MetricsChartSlide {
  return {
    key: 'users_tx_buckets_24h',
    title: 'Транзакции и пользователи (24ч)',
    type: 'dualAxis',
    xKey: 'label',
    data: rows.map((row) => ({
      label: formatChartTimeBucket(row.hour_bucket),
      tx_count: row.tx_count,
      user_count: row.user_count,
    })),
    series: [
      {
        key: 'tx_count',
        label: 'Транзакции',
        color: MONITORING_CHART_COLORS.blue,
        yAxisId: 'right',
      },
      {
        key: 'user_count',
        label: 'Пользователи',
        color: MONITORING_CHART_COLORS.green,
        yAxisId: 'left',
      },
    ],
  }
}

function buildUsersTxBuckets3h10mSlide(
  rows: MetricsTools['users_tx_buckets_3h_10m'],
): MetricsChartSlide {
  return {
    key: 'users_tx_buckets_3h_10m',
    title: 'Транзакции и пользователи (3ч / 10м)',
    type: 'dualAxis',
    xKey: 'label',
    data: rows.map((row) => ({
      label: formatChartTimeBucket(row.time_bucket),
      tx_count: row.tx_count,
      user_count: row.user_count,
    })),
    series: [
      {
        key: 'tx_count',
        label: 'Транзакции',
        color: MONITORING_CHART_COLORS.blue,
        yAxisId: 'right',
      },
      {
        key: 'user_count',
        label: 'Пользователи',
        color: MONITORING_CHART_COLORS.green,
        yAxisId: 'left',
      },
    ],
  }
}

function buildTopIpsTxDetails3hSlide(
  rows: MetricsTools['top_ips_tx_details_3h'],
): MetricsChartSlide {
  return {
    key: 'top_ips_tx_details_3h',
    title: 'Top IP (3ч)',
    type: 'bar',
    xKey: 'label',
    data: rows.map((row) => ({
      label: row.ip,
      value: row.tx_count,
      customer_email: row.customer_email ?? '—',
      customer_first_name: row.customer_first_name ?? '—',
      customer_last_name: row.customer_last_name ?? '—',
      card_number: row.card_number ?? '—',
      customer_country: row.customer_country ?? '—',
    })),
    series: [
      { key: 'value', label: 'Транзакции', color: MONITORING_CHART_COLORS.blue },
    ],
    tooltipFields: TOP_IP_TOOLTIP_FIELDS,
  }
}

function buildSuccessRateByHourCountry24hSlide(
  rows: MetricsTools['success_rate_by_hour_country_24h'],
): MetricsChartSlide {
  const { data, groups } = pivotByBucket(
    rows.map((row) => ({
      hour_bucket: row.hour_bucket,
      customer_country: row.customer_country,
      success_rate: (row.success_rate ?? 0) / 100,
    })),
    'hour_bucket',
    'success_rate',
    'customer_country',
  )

  return {
    key: 'success_rate_by_hour_country_24h',
    title: 'Success rate по странам (24ч)',
    type: 'multiLine',
    xKey: 'label',
    data,
    series: groups.map((group, index) => ({
      key: group,
      label: group.toUpperCase(),
      color: CHART_COLORS[index % CHART_COLORS.length]!,
    })),
    yAxisDomain: [0, 1],
    yAxisTickFormatter: (value) => value.toFixed(1),
  }
}

/**
 * Собирает 7 слайдов графиков из результатов SQL-tools.
 */
export function buildMetricsChartSlides(
  tools: MetricsTools | null | undefined,
): MetricsChartSlide[] {
  if (!tools) {
    return []
  }

  const slides = [
    buildTx24hSlide(tools.tx_24h),
    buildTxStatus24hSlide(tools.tx_status_24h),
    buildErrors24hSlide(tools.errors_24h),
    buildUsersTxBuckets24hSlide(tools.users_tx_buckets_24h),
    buildUsersTxBuckets3h10mSlide(tools.users_tx_buckets_3h_10m),
    buildTopIpsTxDetails3hSlide(tools.top_ips_tx_details_3h),
    buildSuccessRateByHourCountry24hSlide(tools.success_rate_by_hour_country_24h),
  ]

  return slides.filter((slide) => slide.data.length > 0)
}

const FIXTURE_DAY = '2026-06-10'

function fixtureHourBucket(hour: number): string {
  return `${FIXTURE_DAY} ${String(hour).padStart(2, '0')}:00:00`
}

/** Объём транзакций по часу: стабильный трафик до 12:00, затем падение. */
function fixtureTxCountByHour(hour: number): number {
  if (hour <= 11) {
    const pattern = [220, 198, 185, 176, 210, 232, 248, 255, 240, 238, 242, 235]
    return pattern[hour]!
  }
  if (hour === 12) return 48
  if (hour === 13) return 12
  return Math.min(55, 14 + (hour - 14) * 4)
}

function buildTx24hFixture(): MetricsTools['tx_24h'] {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour_bucket: fixtureHourBucket(hour),
    tx_count: fixtureTxCountByHour(hour),
  }))
}

function buildTxStatus24hFixture(): MetricsTools['tx_status_24h'] {
  return Array.from({ length: 24 }, (_, hour) => {
    const tx = fixtureTxCountByHour(hour)
    const declined =
      hour === 12 || hour === 13
        ? Math.min(2, Math.max(1, Math.round(tx * 0.04)))
        : Math.round(tx * 0.058)

    return {
      hour_bucket: fixtureHourBucket(hour),
      approved_count: tx - declined,
      declined_count: declined,
    }
  })
}

const ERROR_CODE_FIXTURES = [
  {
    error_code: '942405',
    error_description: '[784094] Insufficient funds/over credit limit',
  },
  {
    error_code: '950952',
    error_description: 'Canceled by timeout',
  },
  {
    error_code: '1015',
    error_description: 'SECURE_3D_TIMEOUT',
  },
  {
    error_code: '947167',
    error_description: 'Payment form canceled',
  },
  {
    error_code: '942427',
    error_description: '[784005] Do not honor',
  },
] as const

type ErrorCodeFixture = (typeof ERROR_CODE_FIXTURES)[number]
type ErrorCode = ErrorCodeFixture['error_code']

function fixtureErrorCountsByHour(hour: number): Record<ErrorCode, number> {
  const counts = Object.fromEntries(
    ERROR_CODE_FIXTURES.map(({ error_code }) => [error_code, 0]),
  ) as Record<ErrorCode, number>

  if (hour === 23) {
    counts['942405'] = 4
    counts['950952'] = 3
    counts['1015'] = 2
    counts['947167'] = 1
    counts['942427'] = 1
    return counts
  }

  if (hour === 12) {
    counts['942405'] = 2
    counts['950952'] = 2
    counts['1015'] = 1
    return counts
  }

  if (hour === 13) {
    counts['942405'] = 1
    counts['950952'] = 1
    counts['947167'] = 1
    return counts
  }

  if (hour % 6 === 0) {
    counts['942405'] = 1
  }

  if (hour % 8 === 3) {
    counts['950952'] = 1
  }

  if (hour % 10 === 7) {
    counts['1015'] = 1
  }

  return counts
}

function buildErrors24hFixture(): MetricsTools['errors_24h'] {
  const rows: MetricsTools['errors_24h'] = []

  for (let hour = 0; hour < 24; hour += 1) {
    const hour_bucket = fixtureHourBucket(hour)
    const counts = fixtureErrorCountsByHour(hour)

    for (const { error_code, error_description } of ERROR_CODE_FIXTURES) {
      rows.push({
        hour_bucket,
        error_code,
        error_description,
        cnt: counts[error_code],
      })
    }
  }

  return rows
}

function buildUsersTxBuckets24hFixture(): MetricsTools['users_tx_buckets_24h'] {
  return Array.from({ length: 24 }, (_, hour) => {
    const tx_count = fixtureTxCountByHour(hour)
    const userRatio = hour < 12 ? 0.49 : hour <= 13 ? 0.85 : 0.55

    return {
      hour_bucket: fixtureHourBucket(hour),
      tx_count,
      user_count: Math.round(tx_count * userRatio),
    }
  })
}

const SUCCESS_RATE_COUNTRIES = [
  { country: 'DE', share: 0.45, declineRatio: 0.045 },
  { country: 'US', share: 0.4, declineRatio: 0.067 },
  { country: 'unknown', share: 0.15, declineRatio: 0.2 },
] as const

function buildSuccessRateByHourCountry24hFixture(): MetricsTools['success_rate_by_hour_country_24h'] {
  const rows: MetricsTools['success_rate_by_hour_country_24h'] = []

  for (let hour = 0; hour < 24; hour += 1) {
    const tx = fixtureTxCountByHour(hour)

    for (const { country, share, declineRatio } of SUCCESS_RATE_COUNTRIES) {
      const total = Math.max(1, Math.round(tx * share))
      const declined_count = Math.max(0, Math.round(total * declineRatio))
      const approved_count = total - declined_count
      const success_rate =
        total > 0 ? Math.round((approved_count / total) * 10000) / 10000 : null

      rows.push({
        hour_bucket: fixtureHourBucket(hour),
        customer_country: country,
        approved_count,
        declined_count,
        success_rate,
      })
    }
  }

  return rows
}

function buildTopIpsTxDetails3hFixture(): MetricsTools['top_ips_tx_details_3h'] {
  return [
    {
      ip: '185.220.101.42',
      tx_count: 18,
      customer_email: 'xmarcusx89@googlemail.com',
      customer_country: 'DEU',
      customer_first_name: 'Marcus',
      customer_last_name: 'Junge',
      card_number: '454793XXXXXX0072',
    },
    {
      ip: '91.198.174.192',
      tx_count: 17,
      customer_email: 'rocky92@web.de',
      customer_country: 'DEU',
      customer_first_name: 'Dennis',
      customer_last_name: 'Wiemken',
      card_number: '999999XXXXXX9999',
    },
    {
      ip: '178.63.89.11',
      tx_count: 16,
      customer_email: 'rouven1025@gmail.com',
      customer_country: 'DEU',
      customer_first_name: 'Rouven',
      customer_last_name: 'Ulbricht',
      card_number: '462761XXXXXX0474',
    },
    {
      ip: '194.232.104.55',
      tx_count: 15,
      customer_email: 'galyas.jennifer@gmail.com',
      customer_country: 'AUT',
      customer_first_name: 'Jennifer',
      customer_last_name: 'Regina Galyas',
      card_number: '999999XXXXXX9999',
    },
    {
      ip: '87.122.241.88',
      tx_count: 14,
      customer_email: 'kevin210392@web.de',
      customer_country: 'DEU',
      customer_first_name: 'Kevin',
      customer_last_name: 'Dippel',
      card_number: '530351XXXXXX7675',
    },
    {
      ip: '212.102.63.77',
      tx_count: 13,
      customer_email: 'kenansabic321@gmail.com',
      customer_country: 'DEU',
      customer_first_name: 'Kenan',
      customer_last_name: 'Sabic',
      card_number: '534964XXXXXX6844',
    },
    {
      ip: '46.5.78.203',
      tx_count: 12,
      customer_email: 'luanapex18@gmx.de',
      customer_country: 'DEU',
      customer_first_name: 'Luan-Luca',
      customer_last_name: 'Böhnlein',
      card_number: '454793XXXXXX2930',
    },
    {
      ip: '77.117.168.34',
      tx_count: 11,
      customer_email: 'stefan.wallner1@gmx.net',
      customer_country: 'AUT',
      customer_first_name: 'Stefan Josef',
      customer_last_name: 'Wallner',
      card_number: '447634XXXXXX5178',
    },
    {
      ip: '93.104.214.19',
      tx_count: 10,
      customer_email: 'jm.amato@icloud.com',
      customer_country: 'DEU',
      customer_first_name: 'Justin-Mike',
      customer_last_name: 'Amato',
      card_number: '427665XXXXXX0834',
    },
    {
      ip: '84.236.112.66',
      tx_count: 9,
      customer_email: 'balladaniel17@gmail.com',
      customer_country: 'HUN',
      customer_first_name: 'Balla',
      customer_last_name: 'Daniel',
      card_number: '531596XXXXXX2626',
    },
  ]
}

/** Fixture SQL-tools для dev и Vitest (gate 1001, падение трафика ~12:00). */
export const metricsToolsFixture: MetricsTools = {
  tx_24h: buildTx24hFixture(),
  tx_status_24h: buildTxStatus24hFixture(),
  errors_24h: buildErrors24hFixture(),
  users_tx_buckets_24h: buildUsersTxBuckets24hFixture(),
  users_tx_buckets_3h_10m: [
    { time_bucket: '2026-06-10 10:00:00', tx_count: 38, user_count: 22 },
    { time_bucket: '2026-06-10 10:10:00', tx_count: 40, user_count: 24 },
    { time_bucket: '2026-06-10 10:20:00', tx_count: 42, user_count: 25 },
    { time_bucket: '2026-06-10 10:30:00', tx_count: 39, user_count: 23 },
    { time_bucket: '2026-06-10 10:40:00', tx_count: 41, user_count: 24 },
    { time_bucket: '2026-06-10 11:00:00', tx_count: 37, user_count: 21 },
    { time_bucket: '2026-06-10 11:10:00', tx_count: 36, user_count: 20 },
    { time_bucket: '2026-06-10 11:20:00', tx_count: 35, user_count: 19 },
    { time_bucket: '2026-06-10 11:30:00', tx_count: 34, user_count: 18 },
    { time_bucket: '2026-06-10 11:40:00', tx_count: 33, user_count: 17 },
    { time_bucket: '2026-06-10 12:00:00', tx_count: 8, user_count: 7 },
    { time_bucket: '2026-06-10 12:10:00', tx_count: 6, user_count: 6 },
    { time_bucket: '2026-06-10 12:20:00', tx_count: 4, user_count: 4 },
    { time_bucket: '2026-06-10 12:30:00', tx_count: 2, user_count: 2 },
  ],
  top_ips_tx_details_3h: buildTopIpsTxDetails3hFixture(),
  success_rate_by_hour_country_24h: buildSuccessRateByHourCountry24hFixture(),
}

export const metricsChartSlidesFixture = buildMetricsChartSlides(metricsToolsFixture)

export function parseMetricsTools(data: unknown): MetricsTools {
  return metricsToolsSchema.parse(data)
}
