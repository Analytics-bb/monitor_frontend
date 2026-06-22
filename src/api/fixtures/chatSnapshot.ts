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

export type ChatSnapshot = z.infer<typeof chatSnapshotSchema>

/** Fixture ChatSnapshot для dev и Vitest. */
export const chatSnapshotFixture: ChatSnapshot = {
  state: 'active',
  messages: [
    {
      role: 'assistant',
      content: 'Начинаю deep analysis по snapshot audit.',
    },
  ],
  pending_action: null,
}

export function parseChatSnapshot(data: unknown): ChatSnapshot {
  return chatSnapshotSchema.parse(data)
}
