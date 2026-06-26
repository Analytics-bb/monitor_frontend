import { z } from 'zod'

export const triggeredBySchema = z.enum(['tx_count', 'success_rate', 'any'])
export const directionSchema = z.enum(['LOW', 'HIGH', 'any'])
export const decisionSchema = z.enum(['close_fast', 'escalate'])
export const severitySchema = z.enum(['info', 'warning', 'critical'])

export const otherMetricSchema = z.object({
  name: z.string(),
  classification_in: z.array(z.string()),
})

export const matchPredicateSchema = z.object({
  gate_id: z.string().nullable(),
  triggered_by: triggeredBySchema,
  direction: directionSchema,
  other_metric: otherMetricSchema.nullable(),
  zeros_share_min: z.number().nullable(),
  zeros_share_max: z.number().nullable(),
})

export const actionSchema = z.object({
  decision: decisionSchema,
  severity: severitySchema,
  require_sql: z.boolean(),
  sql_tools: z.array(z.string()).nullable(),
})

export const agentInstructionSchema = z.object({
  instruction_id: z.string().uuid(),
  name: z.string(),
  enabled: z.boolean(),
  match: matchPredicateSchema,
  action: actionSchema,
  prompt_template: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type MatchPredicate = z.infer<typeof matchPredicateSchema>
export type Action = z.infer<typeof actionSchema>
export type AgentInstruction = z.infer<typeof agentInstructionSchema>

export const agentInstructionPatchSchema = z.object({
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  match: matchPredicateSchema.partial().optional(),
  action: actionSchema.partial().optional(),
  prompt_template: z.string().optional(),
})

export type AgentInstructionPatch = z.infer<typeof agentInstructionPatchSchema>

export const agentInstructionCreateSchema = z.object({
  name: z.string().min(1),
  enabled: z.boolean().optional(),
  match: matchPredicateSchema,
  action: actionSchema,
  prompt_template: z.string(),
})

export type AgentInstructionCreate = z.infer<typeof agentInstructionCreateSchema>

export const defaultMatchPredicate: MatchPredicate = {
  gate_id: null,
  triggered_by: 'any',
  direction: 'any',
  other_metric: null,
  zeros_share_min: null,
  zeros_share_max: null,
}

export const defaultAction: Action = {
  decision: 'escalate',
  severity: 'warning',
  require_sql: false,
  sql_tools: null,
}

/** Fixture AgentInstruction для dev и Vitest. */
export const agentInstructionFixture: AgentInstruction = {
  instruction_id: '11111111-1111-4111-8111-111111111111',
  name: 'deep_analyst_prompt',
  enabled: true,
  match: { ...defaultMatchPredicate, gate_id: '42' },
  action: defaultAction,
  prompt_template: 'You are a deep analysis agent for payment anomalies.',
  created_at: '2025-07-14 09:00:00',
  updated_at: '2025-07-14 10:00:00',
}

export const agentInstructionsListFixture: AgentInstruction[] = [
  agentInstructionFixture,
  {
    instruction_id: '22222222-2222-4222-8222-222222222222',
    name: 'hypothesis_generator',
    enabled: false,
    match: defaultMatchPredicate,
    action: { ...defaultAction, decision: 'close_fast', severity: 'info' },
    prompt_template: 'Generate concise hypotheses from monitoring signals.',
    created_at: '2025-07-13 17:00:00',
    updated_at: '2025-07-13 18:30:00',
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
  return z.array(agentInstructionSchema).parse(data)
}

/**
 * Краткое описание match для таблицы.
 */
export function formatMatchSummary(match: MatchPredicate): string {
  const parts: string[] = [match.triggered_by, match.direction]
  if (match.gate_id) {
    parts.push(`gate ${match.gate_id}`)
  }
  return parts.join(' · ')
}
