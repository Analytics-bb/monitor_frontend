import { z } from 'zod'

import {
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
  /** Ось Y для dualAxis: left — пользователи, right — транзакции. */
  yAxisId?: 'left' | 'right'
}

export interface MetricsChartSlide {
  key: string
  title: string
  type: MetricsChartType
  xKey: string
  data: Array<Record<string, string | number>>
  series: MetricsChartSeries[]
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
      { key: 'approved', label: 'Approved', color: MONITORING_CHART_COLORS.green },
      { key: 'declined', label: 'Declined', color: MONITORING_CHART_COLORS.orange },
    ],
  }
}

function buildErrors24hSlide(rows: MetricsTools['errors_24h']): MetricsChartSlide {
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
    })),
    series: [
      { key: 'value', label: 'Транзакции', color: MONITORING_CHART_COLORS.blue },
    ],
  }
}

function buildSuccessRateByHourCountry24hSlide(
  rows: MetricsTools['success_rate_by_hour_country_24h'],
): MetricsChartSlide {
  const { data, groups } = pivotByBucket(
    rows.map((row) => ({
      hour_bucket: row.hour_bucket,
      customer_country: row.customer_country,
      success_rate: row.success_rate ?? 0,
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

/** Fixture SQL-tools для dev и Vitest (gate 1001, падение трафика ~12:00). */
export const metricsToolsFixture: MetricsTools = {
  tx_24h: [
    { hour_bucket: '2026-06-10 00:00:00', tx_count: 220 },
    { hour_bucket: '2026-06-10 01:00:00', tx_count: 198 },
    { hour_bucket: '2026-06-10 02:00:00', tx_count: 185 },
    { hour_bucket: '2026-06-10 03:00:00', tx_count: 176 },
    { hour_bucket: '2026-06-10 04:00:00', tx_count: 210 },
    { hour_bucket: '2026-06-10 05:00:00', tx_count: 232 },
    { hour_bucket: '2026-06-10 06:00:00', tx_count: 248 },
    { hour_bucket: '2026-06-10 07:00:00', tx_count: 255 },
    { hour_bucket: '2026-06-10 08:00:00', tx_count: 240 },
    { hour_bucket: '2026-06-10 09:00:00', tx_count: 238 },
    { hour_bucket: '2026-06-10 10:00:00', tx_count: 242 },
    { hour_bucket: '2026-06-10 11:00:00', tx_count: 235 },
    { hour_bucket: '2026-06-10 12:00:00', tx_count: 48 },
    { hour_bucket: '2026-06-10 13:00:00', tx_count: 12 },
  ],
  tx_status_24h: [
    { hour_bucket: '2026-06-10 10:00:00', approved_count: 228, declined_count: 14 },
    { hour_bucket: '2026-06-10 11:00:00', approved_count: 220, declined_count: 15 },
    { hour_bucket: '2026-06-10 12:00:00', approved_count: 46, declined_count: 2 },
    { hour_bucket: '2026-06-10 13:00:00', approved_count: 10, declined_count: 2 },
  ],
  errors_24h: [
    {
      hour_bucket: '2026-06-10 12:00:00',
      error_code: 'E001',
      error_description: 'Provider timeout',
      cnt: 1,
    },
    {
      hour_bucket: '2026-06-10 12:00:00',
      error_code: 'E002',
      error_description: 'Issuer decline',
      cnt: 1,
    },
    {
      hour_bucket: '2026-06-10 13:00:00',
      error_code: 'E001',
      error_description: 'Provider timeout',
      cnt: 1,
    },
  ],
  users_tx_buckets_24h: [
    { hour_bucket: '2026-06-10 10:00:00', tx_count: 242, user_count: 118 },
    { hour_bucket: '2026-06-10 11:00:00', tx_count: 235, user_count: 112 },
    { hour_bucket: '2026-06-10 12:00:00', tx_count: 48, user_count: 41 },
    { hour_bucket: '2026-06-10 13:00:00', tx_count: 12, user_count: 11 },
  ],
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
  top_ips_tx_details_3h: [
    {
      ip: '198.51.100.31',
      tx_count: 18,
      customer_email: 'u1@example.com',
      customer_country: 'DE',
      customer_first_name: 'Anna',
      customer_last_name: 'Müller',
      card_number: '4242',
    },
    {
      ip: '198.51.100.35',
      tx_count: 16,
      customer_email: 'u2@example.com',
      customer_country: 'US',
      customer_first_name: 'John',
      customer_last_name: 'Doe',
      card_number: '1111',
    },
    {
      ip: '198.51.100.38',
      tx_count: 14,
      customer_email: 'u3@example.com',
      customer_country: 'DE',
      customer_first_name: 'Karl',
      customer_last_name: 'Schmidt',
      card_number: '5555',
    },
    {
      ip: '198.51.100.41',
      tx_count: 12,
      customer_email: 'u4@example.com',
      customer_country: 'US',
      customer_first_name: 'Jane',
      customer_last_name: 'Roe',
      card_number: '9999',
    },
    {
      ip: '198.51.100.33',
      tx_count: 10,
      customer_email: 'u5@example.com',
      customer_country: 'FR',
      customer_first_name: 'Pierre',
      customer_last_name: 'Dupont',
      card_number: '3333',
    },
  ],
  success_rate_by_hour_country_24h: [
    {
      hour_bucket: '2026-06-10 11:00:00',
      customer_country: 'DE',
      approved_count: 110,
      declined_count: 5,
      success_rate: 95.6522,
    },
    {
      hour_bucket: '2026-06-10 11:00:00',
      customer_country: 'US',
      approved_count: 98,
      declined_count: 7,
      success_rate: 93.3333,
    },
    {
      hour_bucket: '2026-06-10 11:00:00',
      customer_country: 'unknown',
      approved_count: 12,
      declined_count: 3,
      success_rate: 80.0,
    },
    {
      hour_bucket: '2026-06-10 12:00:00',
      customer_country: 'DE',
      approved_count: 20,
      declined_count: 1,
      success_rate: 95.2381,
    },
    {
      hour_bucket: '2026-06-10 12:00:00',
      customer_country: 'US',
      approved_count: 22,
      declined_count: 1,
      success_rate: 95.6522,
    },
    {
      hour_bucket: '2026-06-10 12:00:00',
      customer_country: 'unknown',
      approved_count: 4,
      declined_count: 0,
      success_rate: 100.0,
    },
  ],
}

export const metricsChartSlidesFixture = buildMetricsChartSlides(metricsToolsFixture)

export function parseMetricsTools(data: unknown): MetricsTools {
  return metricsToolsSchema.parse(data)
}
