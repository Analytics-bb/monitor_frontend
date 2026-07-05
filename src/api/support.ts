import { apiFetch, apiGetJson, getApiBaseUrl, isFixtureMode } from './client'
import { ApiClientError, parseApiError } from './errors'
import {
  parseAttachmentUploadResponse,
  parseSupportChatSnapshot,
  supportChatSnapshotEmptyFixture,
  supportChatSnapshotFixture,
  type AttachmentUploadResponse,
  type SupportChatSnapshot,
} from './fixtures/supportChatSnapshot'
import {
  countSupportHistoryMessages,
  getSupportHistoryLimitFromEnv,
} from '@/lib/supportHistory'

const CHAT_PATH = '/support/chat'

interface FixtureSupportState {
  snapshot: SupportChatSnapshot
  nextAttachmentIndex: number
}

let fixtureState: FixtureSupportState | null = null

function getHistoryLimit(snapshot: SupportChatSnapshot): number {
  return snapshot.history_message_limit ?? getSupportHistoryLimitFromEnv()
}

function rotateSupportHistoryIfNeeded(snapshot: SupportChatSnapshot): SupportChatSnapshot {
  const limit = getHistoryLimit(snapshot)
  if (countSupportHistoryMessages(snapshot.messages) < limit) {
    return snapshot
  }

  return {
    ...snapshot,
    messages: [],
    context_generation: snapshot.context_generation + 1,
    context_reset: true,
  }
}

function cloneSnapshot(snapshot: SupportChatSnapshot): SupportChatSnapshot {
  return {
    ...snapshot,
    messages: snapshot.messages.map((message) => ({ ...message })),
    usage_total: { ...snapshot.usage_total },
  }
}

function getFixtureState(): FixtureSupportState {
  if (!fixtureState) {
    fixtureState = {
      snapshot: cloneSnapshot(supportChatSnapshotEmptyFixture),
      nextAttachmentIndex: 1,
    }
  }
  return fixtureState
}

/**
 * Сбрасывает in-memory fixture store support chat (Vitest).
 */
export function resetSupportChatFixtureStore(): void {
  fixtureState = null
}

/**
 * Устанавливает fixture snapshot для тестов.
 */
export function setFixtureSupportChatSnapshot(
  snapshot: SupportChatSnapshot,
): void {
  fixtureState = {
    snapshot: cloneSnapshot(snapshot),
    nextAttachmentIndex: 1,
  }
}

/**
 * Загружает снимок support chat (`GET /api/support/chat`).
 *
 * В fixture mode возвращает in-memory snapshot (lazy create).
 */
export async function getSupportChat(): Promise<SupportChatSnapshot> {
  if (isFixtureMode()) {
    return cloneSnapshot(getFixtureState().snapshot)
  }

  const json = await apiGetJson<unknown>(CHAT_PATH)
  return parseSupportChatSnapshot(json)
}

export interface SendSupportMessageInput {
  content?: string
  attachment_ids?: string[]
}

/**
 * Отправляет сообщение (`POST /api/support/chat/messages`).
 *
 * @throws {ApiClientError} 409 `chat_processing`
 */
export async function sendSupportMessage(
  input: SendSupportMessageInput,
): Promise<SupportChatSnapshot> {
  if (isFixtureMode()) {
    const state = getFixtureState()
    if (state.snapshot.state === 'processing') {
      throw new ApiClientError(409, {
        error_code: 'chat_processing',
        message: 'Chat is processing',
      })
    }

    const content = input.content?.trim() ?? ''
    const attachmentIds = input.attachment_ids ?? []
    if (!content && attachmentIds.length === 0) {
      throw new ApiClientError(422, {
        error_code: 'validation_error',
        message: 'Empty message',
      })
    }

    state.snapshot = rotateSupportHistoryIfNeeded(state.snapshot)

    const userMessage = {
      message_id: `aaaaaaaa-aaaa-4aaa-8aaa-${String(state.snapshot.messages.length + 1).padStart(12, '0')}`,
      role: 'user' as const,
      content,
      attachment_ids: attachmentIds.length > 0 ? attachmentIds : undefined,
      created_at: '2025-07-14 12:00:00',
    }

    state.snapshot = cloneSnapshot({
      ...state.snapshot,
      state: 'processing',
      messages: [...state.snapshot.messages, userMessage],
    })

    state.snapshot = cloneSnapshot({
      ...state.snapshot,
      state: 'active',
      messages: [
        ...state.snapshot.messages,
        {
          message_id: `bbbbbbbb-bbbb-4bbb-8bbb-${String(state.snapshot.messages.length + 1).padStart(12, '0')}`,
          role: 'assistant',
          content: 'Принял запрос, вот ответ support-агента.',
          created_at: '2025-07-14 12:00:02',
        },
      ],
    })

    return cloneSnapshot(state.snapshot)
  }

  const response = await apiFetch(`${CHAT_PATH}/messages`, {
    method: 'POST',
    body: JSON.stringify(input),
  })
  const json: unknown = await response.json()
  return parseSupportChatSnapshot(json)
}

/**
 * Загружает вложение (`POST /api/support/chat/attachments`, multipart).
 *
 * @throws {ApiClientError} 422 `attachment_rejected`
 */
export async function uploadSupportAttachment(
  file: File,
): Promise<AttachmentUploadResponse> {
  if (isFixtureMode()) {
    const state = getFixtureState()
    const index = state.nextAttachmentIndex
    state.nextAttachmentIndex += 1
    return {
      attachment_id: `cccccccc-cccc-4ccc-8ccc-${String(index).padStart(12, '0')}`,
      filename: file.name,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size,
    }
  }

  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    throw new Error('VITE_API_BASE_URL is not configured')
  }

  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${baseUrl}${CHAT_PATH}/attachments`, {
    method: 'POST',
    body: formData,
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const apiError = await parseApiError(response)
    throw new ApiClientError(response.status, apiError)
  }

  const json: unknown = await response.json()
  return parseAttachmentUploadResponse(json)
}

/**
 * Сбрасывает историю support chat (`POST /api/support/chat/reset`).
 */
export async function resetSupportChat(): Promise<SupportChatSnapshot> {
  if (isFixtureMode()) {
    const state = getFixtureState()
    state.snapshot = cloneSnapshot({
      ...supportChatSnapshotEmptyFixture,
      chat_id: state.snapshot.chat_id,
      user_id: state.snapshot.user_id,
      context_generation: state.snapshot.context_generation + 1,
      context_reset: true,
    })
    return cloneSnapshot(state.snapshot)
  }

  const response = await apiFetch(`${CHAT_PATH}/reset`, { method: 'POST' })
  const json: unknown = await response.json()
  return parseSupportChatSnapshot(json)
}

export { supportChatSnapshotFixture }
export type { AttachmentUploadResponse, SupportChatSnapshot }
