import { z } from 'zod'

export const usageStepBreakdownSchema = z.object({
  tool_name: z.string(),
  latency_ms: z.number().int().nonnegative(),
})

export const agentUsageRunSchema = z.object({
  run_id: z.string().uuid(),
  agent_kind: z.enum(['hypothesis', 'deep']),
  gate_id: z.string().nullable(),
  audit_id: z.string().uuid().nullable(),
  session_id: z.string().uuid().nullable(),
  provider_run_id: z.string().nullable(),
  model: z.string(),
  prompt_tokens: z.number().int().nullable(),
  completion_tokens: z.number().int().nullable(),
  total_tokens: z.number().int().nullable(),
  estimated_cost_usd: z.number().nullable(),
  latency_ms: z.number().int().nonnegative(),
  status: z.enum(['success', 'error', 'skipped']),
  error: z.string().nullable(),
  step_breakdown: z.array(usageStepBreakdownSchema),
  created_at: z.string(),
})

export const agentUsageDailyRollupSchema = z.object({
  date: z.string(),
  gate_id: z.string(),
  agent_kind: z.literal('deep'),
  total_tokens: z.number().int().nonnegative(),
  total_cost_usd: z.number(),
  run_count: z.number().int().nonnegative(),
})

export type UsageStepBreakdown = z.infer<typeof usageStepBreakdownSchema>
export type AgentUsageRun = z.infer<typeof agentUsageRunSchema>
export type AgentUsageDailyRollup = z.infer<typeof agentUsageDailyRollupSchema>

/** Deep run с step_breakdown для dev и Vitest. */
export const agentUsageRunFixture: AgentUsageRun = {
  run_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  agent_kind: 'deep',
  gate_id: '42',
  audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  session_id: 'c3d4e5f6-a7b8-4012-8def-123456789012',
  provider_run_id: 'prov-run-deep-001',
  model: 'gpt-4.1',
  prompt_tokens: 1200,
  completion_tokens: 340,
  total_tokens: 1540,
  estimated_cost_usd: 0.042,
  latency_ms: 1850,
  status: 'success',
  error: null,
  step_breakdown: [
    { tool_name: 'mysql_query', latency_ms: 420 },
    { tool_name: 'summarize', latency_ms: 1430 },
  ],
  created_at: '2025-07-14 12:35:00',
}

/** Hypothesis run без audit_id (backfill pending). */
export const agentUsageRunHypothesisFixture: AgentUsageRun = {
  run_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  agent_kind: 'hypothesis',
  gate_id: '42',
  audit_id: null,
  session_id: null,
  provider_run_id: 'prov-run-hyp-001',
  model: 'gpt-4.1-mini',
  prompt_tokens: 800,
  completion_tokens: 120,
  total_tokens: 920,
  estimated_cost_usd: 0.008,
  latency_ms: 640,
  status: 'success',
  error: null,
  step_breakdown: [],
  created_at: '2025-07-14 11:20:00',
}

/** Список runs для fixture list API. */
export const agentUsageRunsListFixture: AgentUsageRun[] = [
  agentUsageRunFixture,
  agentUsageRunHypothesisFixture,
  {
    run_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
    agent_kind: 'deep',
    gate_id: '17',
    audit_id: 'f5a6b7c8-d9e0-4234-f012-456789012345',
    session_id: 'a6b7c8d9-e0f1-4234-a123-567890123456',
    provider_run_id: null,
    model: 'gpt-4.1',
    prompt_tokens: 2100,
    completion_tokens: 510,
    total_tokens: 2610,
    estimated_cost_usd: 0.071,
    latency_ms: 2340,
    status: 'error',
    error: 'tool timeout',
    step_breakdown: [{ tool_name: 'mysql_query', latency_ms: 2340 }],
    created_at: '2025-07-13 18:05:00',
  },
]

/** Daily rollups для fixture daily API. */
export const agentUsageDailyRollupFixture: AgentUsageDailyRollup[] = [
  {
    date: '2025-07-14',
    gate_id: '42',
    agent_kind: 'deep',
    total_tokens: 1540,
    total_cost_usd: 0.042,
    run_count: 1,
  },
  {
    date: '2025-07-14',
    gate_id: '17',
    agent_kind: 'deep',
    total_tokens: 2610,
    total_cost_usd: 0.071,
    run_count: 1,
  },
]

/**
 * Парсит JSON как AgentUsageRun.
 *
 * @param data - Сырой ответ API или fixture
 * @returns Валидный AgentUsageRun
 * @throws {z.ZodError} При несоответствии OpenAPI M14
 */
export function parseAgentUsageRun(data: unknown): AgentUsageRun {
  return agentUsageRunSchema.parse(data)
}

/**
 * Парсит JSON как AgentUsageDailyRollup.
 *
 * @param data - Сырой элемент массива daily rollups
 * @returns Валидный rollup
 * @throws {z.ZodError} При несоответствии OpenAPI M14
 */
export function parseAgentUsageDailyRollup(
  data: unknown,
): AgentUsageDailyRollup {
  return agentUsageDailyRollupSchema.parse(data)
}
