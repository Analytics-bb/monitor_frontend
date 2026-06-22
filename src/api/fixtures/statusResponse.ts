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
  report_error: z.string().nullable().optional(),
  audit_id: z.string().uuid().nullable().optional(),
  metrics_charts: z
    .array(
      z.object({
        key: z.string(),
        title: z.string(),
        data: z.array(
          z.object({
            label: z.string(),
            value: z.number(),
          }),
        ),
      }),
    )
    .nullable()
    .optional(),
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
  metrics_charts: [
    {
      key: 'tx_volume',
      title: 'Объём транзакций',
      data: [
        { label: '10:00', value: 120 },
        { label: '11:00', value: 184 },
        { label: '12:00', value: 210 },
      ],
    },
    {
      key: 'decline_rate',
      title: 'Decline rate',
      data: [
        { label: '10:00', value: 2.1 },
        { label: '11:00', value: 3.4 },
        { label: '12:00', value: 5.8 },
      ],
    },
  ],
}

export function parseStatusResponse(data: unknown): StatusResponse {
  return statusResponseSchema.parse(data)
}
