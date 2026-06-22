import { z } from 'zod'

export const statusResponseSchema = z.object({
  last_tick_at: z.string().nullable(),
  last_status: z.enum(['success', 'error', 'skipped']),
  tick_in_progress: z.boolean(),
  gate_id: z.string(),
  config_snapshot: z.record(z.string(), z.unknown()).nullable(),
  tx_state: z.record(z.string(), z.unknown()).nullable(),
  sr_state: z.record(z.string(), z.unknown()).nullable(),
  conclusion: z.string().nullable(),
  audit_id: z.string().uuid().nullable().optional(),
})

export type StatusResponse = z.infer<typeof statusResponseSchema>

/** Fixture StatusResponse для dev и Vitest. */
export const statusResponseFixture: StatusResponse = {
  last_tick_at: '2025-07-14 12:30:00',
  last_status: 'success',
  tick_in_progress: false,
  gate_id: '42',
  config_snapshot: {
    detector_version: '1.2.0',
    threshold: 0.85,
  },
  tx_state: {
    pending: 12,
    processed: 1842,
  },
  sr_state: {
    open_cases: 3,
    resolved_today: 7,
  },
  conclusion: 'Порог превышен на gate 42; рекомендован deep analysis.',
  audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
}

export function parseStatusResponse(data: unknown): StatusResponse {
  return statusResponseSchema.parse(data)
}
