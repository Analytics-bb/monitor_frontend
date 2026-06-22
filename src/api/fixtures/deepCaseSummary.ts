import { z } from 'zod'

export const deepCaseSummarySchema = z.object({
  audit_id: z.string().uuid(),
  gate_id: z.string(),
  event_summary: z.string(),
  conclusion: z.string(),
  deep_chat_state: z.enum([
    'not_started',
    'active',
    'awaiting_approval',
    'completed',
    'cancelled',
    'error',
  ]),
  created_at: z.string(),
})

export type DeepCaseSummary = z.infer<typeof deepCaseSummarySchema>

/** Fixture DeepCaseSummary для dev и Vitest. */
export const deepCaseSummaryFixture: DeepCaseSummary = {
  audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  gate_id: '42',
  event_summary: 'Spike in decline rate on gate 42',
  conclusion: 'Порог превышен; рекомендован deep analysis.',
  deep_chat_state: 'not_started',
  created_at: '2025-07-14 12:30:00',
}

export function parseDeepCaseSummary(data: unknown): DeepCaseSummary {
  return deepCaseSummarySchema.parse(data)
}
