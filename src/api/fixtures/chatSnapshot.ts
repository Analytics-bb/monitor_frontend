import { z } from 'zod'

import { apiErrorEnvelopeSchema } from '@/api/errors'

import { auditSummaryFixtureContent } from './auditSummaryFixture'

export const chatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string(),
})

export const pendingActionSchema = z.object({
  action_id: z.string(),
  tool_name: z.string(),
  args_summary: z.string(),
})

export const chatSnapshotSchema = z.object({
  gate_id: z.string(),
  gate_name: z.string().optional(),
  created_at: z.string(),
  conclusion: z.string().optional(),
  state: z.enum([
    'not_started',
    'active',
    'awaiting_approval',
    'completed',
    'cancelled',
    'error',
  ]),
  messages: z.array(chatMessageSchema),
  pending_action: pendingActionSchema.nullable(),
  last_error: apiErrorEnvelopeSchema.optional(),
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type PendingAction = z.infer<typeof pendingActionSchema>
export type ChatSnapshot = z.infer<typeof chatSnapshotSchema>

/** Fixture ChatSnapshot для dev и Vitest. */
export const chatSnapshotFixture: ChatSnapshot = {
  gate_id: '42',
  gate_name: 'Gate 42',
  created_at: '2025-07-14 12:30:00',
  conclusion: 'Порог превышен; рекомендован deep analysis.',
  state: 'active',
  messages: [
    {
      role: 'assistant',
      content: auditSummaryFixtureContent,
    },
  ],
  pending_action: null,
}

/** Snapshot для состояния `not_started` (пустой чат до open). */
export const chatSnapshotNotStartedFixture: ChatSnapshot = {
  gate_id: '42',
  gate_name: 'Gate 42',
  created_at: '2025-07-14 12:30:00',
  conclusion: 'Порог превышен; рекомендован deep analysis.',
  state: 'not_started',
  messages: [],
  pending_action: null,
}

/** Snapshot для terminal state `error`. */
export const chatSnapshotErrorFixture: ChatSnapshot = {
  ...chatSnapshotFixture,
  state: 'error',
  pending_action: null,
  last_error: {
    error_code: 'budget_exceeded',
    message: 'Превышен лимит токенов для deep chat сессии.',
    details: { audit_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', limit_usd: 5 },
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

export function parseChatSnapshot(data: unknown): ChatSnapshot {
  return chatSnapshotSchema.parse(data)
}
