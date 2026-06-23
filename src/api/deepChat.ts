import { apiFetch, apiGetJson } from './client'
import { ApiClientError } from './errors'
import {
  chatSnapshotFixture,
  chatSnapshotNotStartedFixture,
  parseChatSnapshot,
  type ChatSnapshot,
  type PendingAction,
} from './fixtures/chatSnapshot'

const TERMINAL_STATES = new Set<ChatSnapshot['state']>([
  'completed',
  'cancelled',
  'error',
])

interface FixtureChatState {
  snapshot: ChatSnapshot
  budgetExceeded: boolean
}

function useFixtureMode(): boolean {
  return !import.meta.env.VITE_ANOMALY_API_BASE_URL
}

const fixtureStore = new Map<string, FixtureChatState>()

function cloneSnapshot(snapshot: ChatSnapshot): ChatSnapshot {
  return {
    ...snapshot,
    messages: snapshot.messages.map((message) => ({ ...message })),
    pending_action: snapshot.pending_action
      ? { ...snapshot.pending_action }
      : null,
  }
}

function getFixtureState(auditId: string): FixtureChatState {
  const existing = fixtureStore.get(auditId)
  if (existing) {
    return existing
  }

  const initial = cloneSnapshot({
    ...chatSnapshotNotStartedFixture,
    gate_id: auditId.includes('active') ? '42' : chatSnapshotNotStartedFixture.gate_id,
  })
  const state: FixtureChatState = { snapshot: initial, budgetExceeded: false }
  fixtureStore.set(auditId, state)
  return state
}

/**
 * Сбрасывает in-memory fixture store (Vitest).
 */
export function resetDeepChatFixtureStore(): void {
  fixtureStore.clear()
}

function chatPath(auditId: string, suffix = ''): string {
  return `/api/deep/cases/${encodeURIComponent(auditId)}/chat${suffix}`
}

/**
 * Загружает снимок deep chat (`GET /api/deep/cases/{audit_id}/chat`).
 *
 * В dev без `VITE_ANOMALY_API_BASE_URL` возвращает fixture из in-memory store.
 */
export async function getChat(auditId: string): Promise<ChatSnapshot> {
  if (useFixtureMode()) {
    return cloneSnapshot(getFixtureState(auditId).snapshot)
  }

  const json = await apiGetJson<unknown>(chatPath(auditId))
  return parseChatSnapshot(json)
}

/**
 * Открывает сессию deep chat (`POST .../chat/open`).
 *
 * Идемпотентен: повторный вызов возвращает текущий snapshot.
 */
export async function openChat(auditId: string): Promise<ChatSnapshot> {
  if (useFixtureMode()) {
    const state = getFixtureState(auditId)
    if (state.snapshot.state === 'not_started') {
      state.snapshot = cloneSnapshot({
        ...state.snapshot,
        state: 'active',
        messages: [
          {
            role: 'assistant',
            content: 'Начинаю deep analysis по snapshot audit.',
          },
        ],
      })
    }
    return cloneSnapshot(state.snapshot)
  }

  const response = await apiFetch(chatPath(auditId, '/open'), {
    method: 'POST',
  })
  const json: unknown = await response.json()
  return parseChatSnapshot(json)
}

/**
 * Отправляет сообщение пользователя (`POST .../chat/messages`).
 *
 * @throws {ApiClientError} 409 при активном `pending_action`
 */
export async function sendChatMessage(
  auditId: string,
  content: string,
): Promise<ChatSnapshot> {
  if (useFixtureMode()) {
    const state = getFixtureState(auditId)
    if (state.snapshot.pending_action) {
      throw new ApiClientError(409, {
        error_code: 'message',
        message: 'Pending action blocks new messages',
      })
    }

    state.snapshot = cloneSnapshot({
      ...state.snapshot,
      messages: [
        ...state.snapshot.messages,
        { role: 'user', content },
        {
          role: 'assistant',
          content: 'Принял сообщение, продолжаю анализ.',
        },
      ],
    })
    return cloneSnapshot(state.snapshot)
  }

  const response = await apiFetch(chatPath(auditId, '/messages'), {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
  const json: unknown = await response.json()
  return parseChatSnapshot(json)
}

/**
 * Подтверждает pending action (`POST .../actions/{action_id}/approve`).
 *
 * @throws {ApiClientError} 409 `budget_exceeded`
 */
export async function approveChatAction(
  auditId: string,
  actionId: string,
): Promise<ChatSnapshot> {
  if (useFixtureMode()) {
    const state = getFixtureState(auditId)
    if (state.budgetExceeded) {
      throw new ApiClientError(409, {
        error_code: 'budget_exceeded',
        message: 'Budget exceeded',
      })
    }

    state.snapshot = applyActionResolution(state.snapshot, actionId, 'approve')
    return cloneSnapshot(state.snapshot)
  }

  const response = await apiFetch(
    `/api/deep/cases/${encodeURIComponent(auditId)}/actions/${encodeURIComponent(actionId)}/approve`,
    { method: 'POST' },
  )
  const json: unknown = await response.json()
  return parseChatSnapshot(json)
}

/**
 * Отклоняет pending action (`POST .../actions/{action_id}/reject`).
 */
export async function rejectChatAction(
  auditId: string,
  actionId: string,
): Promise<ChatSnapshot> {
  if (useFixtureMode()) {
    const state = getFixtureState(auditId)
    state.snapshot = applyActionResolution(state.snapshot, actionId, 'reject')
    return cloneSnapshot(state.snapshot)
  }

  const response = await apiFetch(
    `/api/deep/cases/${encodeURIComponent(auditId)}/actions/${encodeURIComponent(actionId)}/reject`,
    { method: 'POST' },
  )
  const json: unknown = await response.json()
  return parseChatSnapshot(json)
}

function applyActionResolution(
  snapshot: ChatSnapshot,
  actionId: string,
  resolution: 'approve' | 'reject',
): ChatSnapshot {
  if (!snapshot.pending_action || snapshot.pending_action.action_id !== actionId) {
    return cloneSnapshot(snapshot)
  }

  return cloneSnapshot({
    ...snapshot,
    state: 'active',
    pending_action: null,
    messages: [
      ...snapshot.messages,
      {
        role: 'tool',
        content: `${resolution === 'approve' ? 'Approved' : 'Rejected'}: ${snapshot.pending_action.tool_name}`,
      },
    ],
  })
}

/** Устанавливает fixture snapshot для тестов. */
export function setFixtureChatSnapshot(
  auditId: string,
  snapshot: ChatSnapshot,
): void {
  fixtureStore.set(auditId, {
    snapshot: cloneSnapshot(snapshot),
    budgetExceeded: false,
  })
}

/** Устанавливает fixture с pending action для тестов approve flow. */
export function setFixtureChatAwaitingApproval(
  auditId: string,
  pendingAction: PendingAction,
): void {
  fixtureStore.set(auditId, {
    snapshot: cloneSnapshot({
      ...chatSnapshotFixture,
      state: 'awaiting_approval',
      pending_action: pendingAction,
    }),
    budgetExceeded: false,
  })
}

/** Включает 409 budget_exceeded на следующий approve (Vitest). */
export function setFixtureBudgetExceeded(auditId: string): void {
  const state = getFixtureState(auditId)
  state.budgetExceeded = true
}

export { TERMINAL_STATES }
export type { ChatSnapshot }
