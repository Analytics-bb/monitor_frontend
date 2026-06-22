import { z } from 'zod'

import { agentConclusionHtmlFixture } from './agentConclusionHtml'
import type { MetricsChartSlide } from './metricsCharts'
import {
  buildMetricsChartSlides,
  metricsToolsFixture,
  metricsToolsSchema,
} from './metricsCharts'

type ReportStatusVariant = 'success' | 'error' | 'skipped'

const baselineSchema = z.object({
  min: z.number(),
  max: z.number(),
  mean: z.number(),
  q_low: z.number(),
  q_high: z.number(),
})

const txStateSchema = z.object({
  value: z.number(),
  classification: z.string(),
  direction: z.string().nullable(),
  streak: z.number(),
  baseline: baselineSchema,
})

const srStateSchema = z.object({
  value: z.number(),
  classification: z.string(),
  direction: z.string().nullable(),
  streak: z.number(),
  baseline_slices_count: z.number().optional(),
  baseline: baselineSchema,
})

const configSnapshotSchema = z.record(z.string(), z.unknown())

const eventSchema = z.object({
  event_id: z.string().uuid(),
  gate_id: z.string(),
  gate_name: z.string().optional(),
  triggered_by: z.string().optional(),
  direction: z.string().nullable().optional(),
  zeros_share: z.number().optional(),
  history_len: z.number().optional(),
  detected_at: z.string().optional(),
  tx_state: txStateSchema.nullable().optional(),
  sr_state: srStateSchema.nullable().optional(),
  config_snapshot: configSnapshotSchema.nullable().optional(),
})

const recentTickSchema = z.object({
  tick_id: z.string().uuid(),
  gate_id: z.string(),
  started_at: z.string(),
  finished_at: z.string().nullable().optional(),
  status: z.string(),
  n_events: z.number().optional(),
  error: z.string().nullable().optional(),
})

const schedulerSchema = z.object({
  created_at: z.string(),
  last_tick_at: z.string().nullable(),
  last_tick_started_at: z.string().nullable().optional(),
  tick_in_progress: z.boolean(),
  current_tick_started_at: z.string().nullable().optional(),
  last_status: z.string().nullable().optional(),
  last_error_code: z.string().nullable().optional(),
  ticks_total: z.number(),
  ticks_error_total: z.number(),
  recent_ticks: z.array(recentTickSchema).optional(),
})

const reportUsageSchema = z.object({
  model: z.string(),
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
  estimated_cost_usd: z.string(),
})

const reportSchema = z.object({
  report_id: z.string().uuid(),
  event_id: z.string().uuid(),
  instruction_id: z.string().uuid().nullable().optional(),
  matched_instruction_id: z.string().uuid().nullable().optional(),
  prompt_rendered: z.string().optional(),
  tool_calls: z.array(z.unknown()).optional(),
  conclusion: z.string().nullable(),
  latency_ms: z.number().optional(),
  status: z.enum(['success', 'error', 'skipped']),
  error: z.string().nullable(),
  decision: z.string().optional(),
  severity: z.string().optional(),
  usage_run_id: z.string().uuid().optional(),
  usage: reportUsageSchema.optional(),
  created_at: z.string().optional(),
})

/** Ответ `GET /api/status` (последний тик scheduler). */
export const statusResponseSchema = z.object({
  audit_id: z.string().uuid().nullable().optional(),
  tick_id: z.string().uuid().nullable().optional(),
  created_at: z.string().nullable(),
  telegram_status: z.unknown().nullable().optional(),
  deep_chat: z.unknown().nullable().optional(),
  event: eventSchema.nullable().optional(),
  report: reportSchema.nullable().optional(),
  scheduler: schedulerSchema.nullable().optional(),
  metrics_tools: metricsToolsSchema.nullable().optional(),
  /** Ускоренный polling, если бэкенд сигнализирует активный тик. */
  tick_in_progress: z.boolean().optional(),
})

export type StatusResponse = z.infer<typeof statusResponseSchema>
export type SchedulerStatus = z.infer<typeof schedulerSchema>

/** Fixture StatusResponse для dev и Vitest. */
export const statusResponseFixture: StatusResponse = {
  audit_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  tick_id: '11111111-1111-4111-8111-111111111111',
  created_at: '2026-06-07T12:05:00',
  telegram_status: null,
  deep_chat: null,
  tick_in_progress: false,
  scheduler: {
    created_at: '2026-06-07T12:00:00',
    last_tick_at: '2026-06-07T12:05:00',
    last_tick_started_at: '2026-06-07T12:04:30',
    tick_in_progress: false,
    current_tick_started_at: null,
    last_status: 'ok',
    last_error_code: null,
    ticks_total: 12,
    ticks_error_total: 0,
    recent_ticks: [
      {
        tick_id: '11111111-1111-4111-8111-111111111111',
        gate_id: '1001',
        started_at: '2026-06-07T12:04:30',
        finished_at: '2026-06-07T12:05:00',
        status: 'ok',
        n_events: 1,
        error: null,
      },
    ],
  },
  metrics_tools: metricsToolsFixture,
  event: {
    event_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    gate_id: '1001',
    gate_name: 'Test Gate 1001 Test Method',
    triggered_by: 'tx_count',
    direction: 'LOW',
    zeros_share: 0.0,
    history_len: 18,
    detected_at: '2026-06-07T12:05:00',
    tx_state: {
      value: 5,
      classification: 'LOW',
      direction: 'LOW',
      streak: 3,
      baseline: {
        min: 1,
        max: 100,
        mean: 50.0,
        q_low: 10.0,
        q_high: 90.0,
      },
    },
    sr_state: {
      value: 0.9,
      classification: 'NORMAL',
      direction: null,
      streak: 0,
      baseline_slices_count: 3,
      baseline: {
        min: 1,
        max: 100,
        mean: 50.0,
        q_low: 10.0,
        q_high: 90.0,
      },
    },
    config_snapshot: {
      gate_id: null,
      slice_minutes: 10,
      window_slices: 18,
      quantile_low: 0.1,
      quantile_high: 0.9,
      persistence: 3,
      mode: 'anomaly',
      created_at: '2026-05-25T12:00:00',
      updated_at: '2026-05-25T12:00:00',
    },
  },
  report: {
    report_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    event_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    instruction_id: null,
    matched_instruction_id: null,
    prompt_rendered: '',
    tool_calls: [],
    conclusion: agentConclusionHtmlFixture,
    latency_ms: 1200,
    status: 'success',
    error: null,
    decision: 'escalate',
    severity: 'warning',
    usage_run_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    usage: {
      model: 'gpt-4.1',
      prompt_tokens: 800,
      completion_tokens: 120,
      total_tokens: 920,
      estimated_cost_usd: '0.004500',
    },
    created_at: '2026-06-07T12:05:00',
  },
}

export function parseStatusResponse(data: unknown): StatusResponse {
  return statusResponseSchema.parse(data)
}

/** Gate id из последнего status. */
export function getStatusGateId(
  data: StatusResponse | null | undefined,
): string | null {
  return data?.event?.gate_id ?? null
}

/** Human-readable имя gate из последнего status. */
export function getStatusGateName(
  data: StatusResponse | null | undefined,
): string | null {
  return data?.event?.gate_name ?? null
}

/** Время последнего тика (`scheduler.last_tick_at` или fallback). */
export function getStatusLastTickAt(
  data: StatusResponse | null | undefined,
): string | null {
  return data?.scheduler?.last_tick_at ?? data?.created_at ?? null
}

/** Активный тик scheduler для ускоренного polling. */
export function getStatusTickInProgress(
  data: StatusResponse | null | undefined,
): boolean {
  return data?.scheduler?.tick_in_progress ?? data?.tick_in_progress ?? false
}

/** Снимок scheduler из status. */
export function getStatusScheduler(
  data: StatusResponse | null | undefined,
): SchedulerStatus | null {
  return data?.scheduler ?? null
}

/** Слайды графиков из `metrics_tools` status. */
export function getStatusMetricsChartSlides(
  data: StatusResponse | null | undefined,
): MetricsChartSlide[] {
  return buildMetricsChartSlides(data?.metrics_tools ?? null)
}

/** Статус отчёта для StatusBadge. */
export function getStatusReportStatus(
  data: StatusResponse | null | undefined,
): ReportStatusVariant | null {
  const status = data?.report?.status
  if (status === 'success' || status === 'error' || status === 'skipped') {
    return status
  }
  return null
}

/** Conclusion из report. */
export function getStatusConclusion(
  data: StatusResponse | null | undefined,
): string | null {
  return data?.report?.conclusion ?? null
}

/** Ошибка report для ConclusionPanel. */
export function getStatusReportError(
  data: StatusResponse | null | undefined,
): string | null {
  return data?.report?.error ?? null
}
