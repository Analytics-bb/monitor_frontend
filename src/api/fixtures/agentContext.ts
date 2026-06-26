import { z } from 'zod'

export const agentKindSchema = z.enum(['hypothesis', 'deep'])

export type AgentKind = z.infer<typeof agentKindSchema>

export const agentContextSchema = z.object({
  context_id: z.string().uuid(),
  agent_kind: agentKindSchema,
  gate_id: z.string().nullable(),
  context_body: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type AgentContext = z.infer<typeof agentContextSchema>

export const agentContextUpsertSchema = z.object({
  agent_kind: agentKindSchema,
  gate_id: z.string().nullable(),
  context_body: z.string(),
})

export type AgentContextUpsert = z.infer<typeof agentContextUpsertSchema>

export const agentContextListPageSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
})

export type AgentContextListPage = {
  items: AgentContext[]
  total: number
  page: number
  page_size: number
}

/** Fixture AgentContext для dev и Vitest. */
export const agentContextFixture: AgentContext = {
  context_id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  agent_kind: 'deep',
  gate_id: null,
  context_body: 'Decline rate spikes above 2% require manual review.',
  created_at: '2025-07-14 08:00:00',
  updated_at: '2025-07-14 09:00:00',
}

export const agentContextsListFixture: AgentContext[] = [
  agentContextFixture,
  {
    context_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    agent_kind: 'deep',
    gate_id: '42',
    context_body: 'Gate 42 uses stricter thresholds on weekends.',
    created_at: '2025-07-13 14:00:00',
    updated_at: '2025-07-13 15:00:00',
  },
  {
    context_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    agent_kind: 'hypothesis',
    gate_id: null,
    context_body: 'Keep hypotheses short and testable.',
    created_at: '2025-07-12 10:00:00',
    updated_at: '2025-07-12 11:00:00',
  },
]

/**
 * Парсит список contexts из envelope API.
 */
export function parseAgentContextListPage(data: unknown): AgentContextListPage {
  const envelope = agentContextListPageSchema.parse(data)
  return {
    items: envelope.items.map((item) => agentContextSchema.parse(item)),
    total: envelope.total,
    page: envelope.page,
    page_size: envelope.page_size,
  }
}

/**
 * Метка scope для карточки (без UUID).
 */
export function formatContextScope(context: AgentContext): string {
  if (context.gate_id === null) {
    return 'Global'
  }
  return `Gate ${context.gate_id}`
}
