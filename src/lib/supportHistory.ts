import type { SupportMessage } from '@/api/fixtures/supportChatSnapshot'

/** Дефолт лимита истории — зеркало backend `SUPPORT_MAX_HISTORY_MESSAGES`. */
export const SUPPORT_MAX_HISTORY_MESSAGES_DEFAULT = 40

/**
 * Считает сообщения, входящие в лимит ротации (user + assistant).
 */
export function countSupportHistoryMessages(
  messages: readonly SupportMessage[],
): number {
  return messages.filter(
    (message) => message.role === 'user' || message.role === 'assistant',
  ).length
}

/**
 * Лимит истории из env или дефолт.
 */
export function getSupportHistoryLimitFromEnv(): number {
  const raw = import.meta.env.VITE_SUPPORT_MAX_HISTORY_MESSAGES
  const parsed = raw ? Number.parseInt(String(raw), 10) : Number.NaN
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : SUPPORT_MAX_HISTORY_MESSAGES_DEFAULT
}

/**
 * Лимит истории исчерпан (user + assistant ≥ limit).
 */
export function isSupportHistoryLimitReached(
  messageCount: number,
  limit: number,
): boolean {
  return limit > 0 && messageCount >= limit
}

/**
 * Доля заполнения истории (0–1).
 */
export function getSupportHistoryFillRatio(
  messageCount: number,
  limit: number,
): number {
  if (limit <= 0) {
    return 0
  }
  return Math.min(messageCount / limit, 1)
}
