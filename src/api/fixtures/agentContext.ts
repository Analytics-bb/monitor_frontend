import { z } from 'zod'

export const agentKindSchema = z.enum(['hypothesis', 'deep'])

export type AgentKind = z.infer<typeof agentKindSchema>

export const agentContextSchema = z.object({
  context_id: z.string().uuid(),
  agent_kind: agentKindSchema,
  gate_id: z.string().nullable(),
  key: z.string(),
  content: z.string(),
  updated_at: z.string().optional(),
})

export type AgentContext = z.infer<typeof agentContextSchema>

/** Fixture AgentContext для dev и Vitest. */
export const agentContextFixture: AgentContext = {
  context_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  agent_kind: 'deep',
  gate_id: null,
  key: 'payment_rules',
  content: 'Decline rate spikes above 2% require manual review.',
  updated_at: '2025-07-14 09:00:00',
}

export const agentContextsListFixture: AgentContext[] = [
  agentContextFixture,
  {
    context_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    agent_kind: 'deep',
    gate_id: '42',
    key: 'gate_42_notes',
    content: 'Gate 42 uses stricter thresholds on weekends.',
    updated_at: '2025-07-13 15:00:00',
  },
  {
    context_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    agent_kind: 'hypothesis',
    gate_id: null,
    key: 'hypothesis_style',
    content: 'Keep hypotheses short and testable.',
    updated_at: '2025-07-12 11:00:00',
  },
]

/**
 * Парсит список contexts из JSON ответа API.
 */
export function parseAgentContextList(data: unknown): AgentContext[] {
  if (Array.isArray(data)) {
    return z.array(agentContextSchema).parse(data)
  }

  const envelope = z.object({ items: z.array(z.unknown()) }).parse(data)
  return envelope.items.map((item) => agentContextSchema.parse(item))
}
