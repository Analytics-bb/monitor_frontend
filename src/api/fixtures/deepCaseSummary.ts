import { z } from 'zod'

export const deepCaseSummarySchema = z.object({
  audit_id: z.string().uuid(),
  gate_id: z.string(),
  event_summary: z.string(),
  conclusion: z.string().nullish(),
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

const DEEP_CHAT_STATES = [
  'not_started',
  'active',
  'awaiting_approval',
  'completed',
  'cancelled',
  'error',
] as const satisfies readonly DeepCaseSummary['deep_chat_state'][]

const DEEP_LIST_GATES = ['42', '43'] as const

function fixtureAuditId(index: number): string {
  if (index === 0) {
    return deepCaseSummaryFixture.audit_id
  }

  const suffix = index.toString(16).padStart(12, '0')
  return `00000000-0000-4000-8000-${suffix}`
}

function buildDeepCasesListFixture(count: number): DeepCaseSummary[] {
  return Array.from({ length: count }, (_, index) => {
    if (index === 0) {
      return deepCaseSummaryFixture
    }

    const gateId = DEEP_LIST_GATES[index % DEEP_LIST_GATES.length]!
    const day = String((index % 28) + 1).padStart(2, '0')
    const hour = String(8 + (index % 12)).padStart(2, '0')
    const state = DEEP_CHAT_STATES[index % DEEP_CHAT_STATES.length]!

    return {
      audit_id: fixtureAuditId(index),
      gate_id: gateId,
      event_summary: `Event #${index + 1} on gate ${gateId}`,
      conclusion: `Вывод по audit ${index + 1}: требуется проверка оператором.`,
      deep_chat_state: state,
      created_at: `2025-07-${day} ${hour}:15:00`,
    }
  })
}

/** 30 записей для dev-списка `/deep` и pagination. */
export const deepCasesListFixture: DeepCaseSummary[] =
  buildDeepCasesListFixture(30)

export function parseDeepCaseSummary(data: unknown): DeepCaseSummary {
  const parsed = deepCaseSummarySchema.parse(data)
  return {
    ...parsed,
    conclusion: parsed.conclusion ?? null,
  }
}
