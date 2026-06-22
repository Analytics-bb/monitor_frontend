import { z } from 'zod'

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
  /** Ускоренный polling, если бэкенд сигнализирует активный тик. */
  tick_in_progress: z.boolean().optional(),
})

export type StatusResponse = z.infer<typeof statusResponseSchema>

/** Fixture StatusResponse для dev и Vitest. */
export const statusResponseFixture: StatusResponse = {
  audit_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  tick_id: '11111111-1111-4111-8111-111111111111',
  created_at: '2026-06-07T12:05:00',
  telegram_status: null,
  deep_chat: null,
  tick_in_progress: false,
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
    conclusion:
      'Трафик ниже нормы на 3 среза подряд. Рекомендация: проверить merchant routing.',
    latency_ms: 1200,
    status: 'success',
    error: null,
    decision: 'close_fast',
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

/** Время последнего тика для StatusPanel. */
export function getStatusLastTickAt(
  data: StatusResponse | null | undefined,
): string | null {
  return data?.created_at ?? null
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
