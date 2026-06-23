import { z } from 'zod'

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
})

export type ChatMessage = z.infer<typeof chatMessageSchema>
export type PendingAction = z.infer<typeof pendingActionSchema>
export type ChatSnapshot = z.infer<typeof chatSnapshotSchema>

/** Fixture ChatSnapshot для dev и Vitest. */
export const chatSnapshotFixture: ChatSnapshot = {
  gate_id: '42',
  created_at: '2025-07-14 12:30:00',
  conclusion: 'Порог превышен; рекомендован deep analysis.',
  state: 'active',
  messages: [
    {
      role: 'assistant',
      content: 'Начинаю deep analysis по snapshot audit.',
    },
  ],
  pending_action: null,
}

/** Snapshot для состояния `not_started` (пустой чат до open). */
export const chatSnapshotNotStartedFixture: ChatSnapshot = {
  gate_id: '42',
  created_at: '2025-07-14 12:30:00',
  conclusion: 'Порог превышен; рекомендован deep analysis.',
  state: 'not_started',
  messages: [],
  pending_action: null,
}

export function parseChatSnapshot(data: unknown): ChatSnapshot {
  return chatSnapshotSchema.parse(data)
}
