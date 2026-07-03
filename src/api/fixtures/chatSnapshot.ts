import { z } from 'zod'

import { apiErrorEnvelopeSchema } from '@/api/errors'
import { tokenUsageSchema } from '@/api/tokenUsage'
import { buildDeepChatErrorAssistantContent } from '@/lib/deepChatErrorMessage'

import { auditSummaryFixtureContent, deepAgentSummaryFixtureContent } from './auditSummaryFixture'

const deepChatStateSchema = z.enum([
  'not_started',
  'active',
  'awaiting_approval',
  'completed',
  'cancelled',
  'error',
])

export const chatMessageSchema = z.object({
  message_id: z.string().uuid().optional(),
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
  created_at: z.string().optional(),
})

export const pendingActionSchema = z.object({
  action_id: z.string(),
  tool_name: z.string(),
  arguments_preview: z.string(),
  tool_call_id: z.string().optional(),
  arguments: z.record(z.string(), z.unknown()).optional(),
  created_at: z.string().optional(),
})

/** OpenAPI ChatSnapshot (`docs/api.md`). */
export const chatSnapshotApiSchema = z.object({
  audit_id: z.string().uuid(),
  session_id: z.string().uuid().nullable(),
  state: deepChatStateSchema,
  messages: z.array(chatMessageSchema),
  pending_action: pendingActionSchema.nullable(),
  usage_total: tokenUsageSchema.nullable().optional(),
})

/** UI-поля вне ChatSnapshot API (fixtures, обогащение из list/system). */
export const chatSnapshotDisplaySchema = z.object({
  gate_id: z.string().optional(),
  gate_name: z.string().optional(),
  created_at: z.string().optional(),
  last_error: apiErrorEnvelopeSchema.optional(),
})

export const chatSnapshotSchema = chatSnapshotApiSchema.merge(
  chatSnapshotDisplaySchema,
)

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type PendingAction = z.infer<typeof pendingActionSchema>
export type ChatSnapshot = z.infer<typeof chatSnapshotSchema>

const FIXTURE_AUDIT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
const FIXTURE_SESSION_ID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901'

/** System seed после open — формат docs/api.md §System message. */
export function buildFixtureSystemMessage(auditId = FIXTURE_AUDIT_ID): string {
  return [
    `audit_id: ${auditId}`,
    'gate_id: 42',
    'detected_at: 2025-07-14 12:30:00',
    `conclusion: ${auditSummaryFixtureContent}`,
    'hypothesis_prompt: fixture hypothesis prompt',
  ].join('\n')
}

export const fixtureSystemMessageContent = buildFixtureSystemMessage()

function buildFixtureOpenMessages(auditId = FIXTURE_AUDIT_ID): ChatMessage[] {
  return [
    {
      role: 'system',
      content: buildFixtureSystemMessage(auditId),
    },
    {
      role: 'assistant',
      content: deepAgentSummaryFixtureContent,
    },
  ]
}

function extractDisplayMetaFromMessages(
  messages: ChatMessage[],
): Pick<ChatSnapshot, 'gate_id' | 'created_at'> {
  const system = messages.find((message) => message.role === 'system')
  if (!system) {
    return {}
  }

  const gateId = system.content.match(/^gate_id:\s*(\S+)/m)?.[1]
  const detectedAt = system.content.match(/^detected_at:\s*(\S+)/m)?.[1]

  return {
    ...(gateId ? { gate_id: gateId } : {}),
    ...(detectedAt ? { created_at: detectedAt } : {}),
  }
}

/**
 * Парсит JSON ответа deep chat (`GET/POST .../chat`) по контракту OpenAPI.
 *
 * Метаданные для CaseMetaStrip (`gate_id`, `created_at`) подтягиваются из system message,
 * если их нет в теле ответа.
 */
export function parseChatSnapshot(data: unknown): ChatSnapshot {
  const parsed = chatSnapshotApiSchema.parse(data)
  const fromSystem = extractDisplayMetaFromMessages(parsed.messages)
  const record =
    typeof data === 'object' && data !== null
      ? (data as Record<string, unknown>)
      : null

  const gate_id =
    typeof record?.gate_id === 'string' ? record.gate_id : fromSystem.gate_id
  const gate_name =
    typeof record?.gate_name === 'string' ? record.gate_name : undefined
  const created_at =
    typeof record?.created_at === 'string'
      ? record.created_at
      : fromSystem.created_at
  const last_error =
    record?.last_error !== undefined
      ? apiErrorEnvelopeSchema.optional().parse(record.last_error)
      : undefined

  return {
    ...parsed,
    ...(gate_id ? { gate_id } : {}),
    ...(gate_name ? { gate_name } : {}),
    ...(created_at ? { created_at } : {}),
    ...(last_error ? { last_error } : {}),
  }
}

/** Fixture ChatSnapshot для dev и Vitest (после open). */
export const chatSnapshotFixture: ChatSnapshot = {
  audit_id: FIXTURE_AUDIT_ID,
  session_id: FIXTURE_SESSION_ID,
  gate_id: '42',
  gate_name: 'Gate 42',
  created_at: '2025-07-14 12:30:00',
  state: 'active',
  messages: buildFixtureOpenMessages(),
  pending_action: null,
  usage_total: {
    model: 'claude-sonnet-4-6',
    prompt_tokens: 12_400,
    completion_tokens: 890,
    total_tokens: 13_290,
    estimated_cost_usd: 0.0523,
  },
}

/** Snapshot для состояния `not_started` (пустой чат до open). */
export const chatSnapshotNotStartedFixture: ChatSnapshot = {
  audit_id: FIXTURE_AUDIT_ID,
  session_id: null,
  gate_id: '42',
  gate_name: 'Gate 42',
  created_at: '2025-07-14 12:30:00',
  state: 'not_started',
  messages: [],
  pending_action: null,
}

/** Snapshot для terminal state `error` с ответом агента в ленте. */
export const chatSnapshotErrorFixture: ChatSnapshot = {
  ...chatSnapshotNotStartedFixture,
  session_id: FIXTURE_SESSION_ID,
  state: 'error',
  messages: [
    {
      role: 'system',
      content: buildFixtureSystemMessage(),
    },
    {
      role: 'assistant',
      content: buildDeepChatErrorAssistantContent({
        error_code: 'budget_exceeded',
        message: 'Превышен лимит токенов для deep chat сессии.',
        details: { audit_id: FIXTURE_AUDIT_ID, limit_usd: 5 },
      }),
    },
  ],
  pending_action: null,
  last_error: {
    error_code: 'budget_exceeded',
    message: 'Превышен лимит токенов для deep chat сессии.',
    details: { audit_id: FIXTURE_AUDIT_ID, limit_usd: 5 },
  },
}

/** Snapshot для terminal state `completed`. */
export const chatSnapshotCompletedFixture: ChatSnapshot = {
  ...chatSnapshotFixture,
  state: 'completed',
  pending_action: null,
}

/** Snapshot для terminal state `cancelled`. */
export const chatSnapshotCancelledFixture: ChatSnapshot = {
  ...chatSnapshotFixture,
  state: 'cancelled',
  pending_action: null,
}
