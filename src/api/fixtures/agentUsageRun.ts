import { z } from 'zod'

export const agentUsageRunSchema = z.object({
  run_id: z.string().uuid(),
  agent_kind: z.enum(['hypothesis', 'deep']),
  gate_id: z.string(),
  audit_id: z.string().uuid().nullable(),
  model: z.string(),
  tokens_in: z.number().int(),
  tokens_out: z.number().int(),
  cost_usd: z.number(),
  status: z.string(),
  created_at: z.string(),
})

export type AgentUsageRun = z.infer<typeof agentUsageRunSchema>

/** Fixture AgentUsageRun для dev и Vitest. */
export const agentUsageRunFixture: AgentUsageRun = {
  run_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  agent_kind: 'deep',
  gate_id: '42',
  audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  model: 'gpt-4.1',
  tokens_in: 1200,
  tokens_out: 340,
  cost_usd: 0.042,
  status: 'completed',
  created_at: '2025-07-14 12:35:00',
}

export function parseAgentUsageRun(data: unknown): AgentUsageRun {
  return agentUsageRunSchema.parse(data)
}
