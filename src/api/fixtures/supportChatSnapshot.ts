import { z } from 'zod'

import { tokenUsageSchema, type TokenUsage } from '@/api/tokenUsage'

export { tokenUsageSchema, type TokenUsage }

export const supportMessageSchema = z.object({
  message_id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  attachment_ids: z.array(z.string().uuid()).optional(),
  created_at: z.string(),
})

export const supportChatSnapshotSchema = z.object({
  chat_id: z.string().uuid(),
  user_id: z.string(),
  state: z.enum(['active', 'processing', 'error']),
  messages: z.array(supportMessageSchema),
  context_generation: z.number().int(),
  context_reset: z.boolean(),
  history_message_limit: z.number().int().positive().optional(),
  usage_total: tokenUsageSchema,
})

export const attachmentUploadResponseSchema = z.object({
  attachment_id: z.string().uuid(),
  filename: z.string(),
  mime_type: z.string(),
  size_bytes: z.number().int().nonnegative(),
})

export type SupportMessage = z.infer<typeof supportMessageSchema>
export type SupportChatSnapshot = z.infer<typeof supportChatSnapshotSchema>
export type AttachmentUploadResponse = z.infer<
  typeof attachmentUploadResponseSchema
>

const defaultUsageTotal: TokenUsage = {
  model: 'claude-sonnet-4-20250514',
  prompt_tokens: 420,
  completion_tokens: 180,
  total_tokens: 600,
  estimated_cost_usd: 0.012,
}

/** Пустой support-чат после lazy create. */
export const supportChatSnapshotEmptyFixture: SupportChatSnapshot = {
  chat_id: '11111111-1111-4111-8111-111111111111',
  user_id: 'admin',
  state: 'active',
  messages: [],
  context_generation: 0,
  context_reset: false,
  history_message_limit: 40,
  usage_total: defaultUsageTotal,
}

/** Support-чат с историей для dev и Vitest. */
export const supportChatSnapshotFixture: SupportChatSnapshot = {
  chat_id: '11111111-1111-4111-8111-111111111111',
  user_id: 'admin',
  state: 'active',
  context_generation: 1,
  context_reset: false,
  history_message_limit: 40,
  usage_total: defaultUsageTotal,
  messages: [
    {
      message_id: '22222222-2222-4222-8222-222222222222',
      role: 'user',
      content: 'Как посмотреть расход токенов?',
      created_at: '2025-07-14 10:00:00',
    },
    {
      message_id: '33333333-3333-4333-8333-333333333333',
      role: 'assistant',
      content: 'Откройте вкладку Usage — там список runs по agent_kind.',
      created_at: '2025-07-14 10:00:05',
    },
  ],
}

/** Snapshot в состоянии processing. */
export const supportChatSnapshotProcessingFixture: SupportChatSnapshot = {
  ...supportChatSnapshotFixture,
  state: 'processing',
}

/**
 * Парсит JSON как SupportChatSnapshot.
 *
 * @param data - Сырой ответ API или fixture
 * @returns Валидный SupportChatSnapshot
 * @throws {z.ZodError} При несоответствии OpenAPI M18
 */
export function parseSupportChatSnapshot(data: unknown): SupportChatSnapshot {
  return supportChatSnapshotSchema.parse(data)
}

/**
 * Парсит JSON как AttachmentUploadResponse.
 *
 * @param data - Сырой ответ POST attachments
 * @returns Валидный AttachmentUploadResponse
 * @throws {z.ZodError} При несоответствии OpenAPI M18
 */
export function parseAttachmentUploadResponse(
  data: unknown,
): AttachmentUploadResponse {
  return attachmentUploadResponseSchema.parse(data)
}
