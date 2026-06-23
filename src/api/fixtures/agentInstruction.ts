import { z } from 'zod'

export const agentInstructionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  enabled: z.boolean(),
  prompt_template: z.string(),
  updated_at: z.string(),
  agent_kind: z.enum(['hypothesis', 'deep']).optional(),
})

export type AgentInstruction = z.infer<typeof agentInstructionSchema>

export const agentInstructionPatchSchema = agentInstructionSchema
  .partial()
  .omit({ id: true })

export type AgentInstructionPatch = z.infer<typeof agentInstructionPatchSchema>

/** Fixture AgentInstruction для dev и Vitest. */
export const agentInstructionFixture: AgentInstruction = {
  id: '11111111-1111-4111-8111-111111111111',
  name: 'Deep analyst system prompt',
  enabled: true,
  prompt_template: 'You are a deep analysis agent for payment anomalies.',
  updated_at: '2025-07-14 10:00:00',
  agent_kind: 'deep',
}

export const agentInstructionsListFixture: AgentInstruction[] = [
  agentInstructionFixture,
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Hypothesis generator',
    enabled: false,
    prompt_template: 'Generate concise hypotheses from monitoring signals.',
    updated_at: '2025-07-13 18:30:00',
    agent_kind: 'hypothesis',
  },
]

/**
 * Парсит одну instruction из JSON ответа API.
 */
export function parseAgentInstruction(data: unknown): AgentInstruction {
  return agentInstructionSchema.parse(data)
}

/**
 * Парсит список instructions из JSON ответа API.
 */
export function parseAgentInstructionList(data: unknown): AgentInstruction[] {
  if (Array.isArray(data)) {
    return z.array(agentInstructionSchema).parse(data)
  }

  const envelope = z.object({ items: z.array(z.unknown()) }).parse(data)
  return envelope.items.map((item) => parseAgentInstruction(item))
}
