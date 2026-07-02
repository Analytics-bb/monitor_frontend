import type { ChatMessage, ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import { isAuditSummaryContent } from '@/api/fixtures/auditSummaryFixture'

export type DeepChatDisplayMessage = {
  id: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  /** Вывод hypothesis-агента в первом user-сообщении. */
  variant?: 'hypothesis' | 'default'
}

/**
 * Извлекает `conclusion` из system message deep chat snapshot.
 */
export function extractHypothesisConclusionFromSystem(
  systemContent: string,
): string | null {
  const withPromptBoundary = systemContent.match(
    /^conclusion:\s*(.+?)(?=\nhypothesis_prompt:)/ms,
  )
  if (withPromptBoundary?.[1]) {
    return withPromptBoundary[1].trim()
  }

  const trailing = systemContent.match(/^conclusion:\s*(.+)$/ms)
  return trailing?.[1]?.trim() ?? null
}

/**
 * Проверяет, что assistant message — сырой echo hypothesis-вывода, а не краткий ответ deep-агента.
 */
export function isHypothesisEchoContent(content: string): boolean {
  if (isAuditSummaryContent(content)) {
    return true
  }

  const trimmed = content.trim()
  if (trimmed.includes('<article>')) {
    return true
  }

  return /^\S+[^\n]*\n\n<article>/s.test(trimmed)
}

function mapApiMessage(message: ChatMessage, index: number): DeepChatDisplayMessage {
  return {
    id: message.message_id ?? `${message.role}-${index}`,
    role: message.role === 'tool' ? 'tool' : message.role,
    content: message.content,
  }
}

/**
 * Строит ленту сообщений для UI: hypothesis как первое user-сообщение, без system и echo-dump.
 *
 * @param snapshot - ChatSnapshot с API
 * @param options.optimisticUserMessage - Локально отправленное сообщение до refetch
 */
export function buildDeepChatDisplayMessages(
  snapshot: ChatSnapshot,
  options?: { optimisticUserMessage?: string | null },
): DeepChatDisplayMessage[] {
  const result: DeepChatDisplayMessage[] = []
  const systemMessage = snapshot.messages.find(
    (message) => message.role === 'system',
  )
  const hypothesis = systemMessage
    ? extractHypothesisConclusionFromSystem(systemMessage.content)
    : null
  const apiUserMessages = snapshot.messages.filter(
    (message) => message.role === 'user',
  )

  if (apiUserMessages.length === 0 && hypothesis) {
    result.push({
      id: 'hypothesis-seed',
      role: 'user',
      content: hypothesis,
      variant: 'hypothesis',
    })
  }

  for (const [index, message] of snapshot.messages.entries()) {
    if (message.role === 'user') {
      result.push(mapApiMessage(message, index))
    }
  }

  const optimistic = options?.optimisticUserMessage?.trim()
  if (optimistic) {
    const alreadyInSnapshot = apiUserMessages.some(
      (message) => message.content.trim() === optimistic,
    )
    if (!alreadyInSnapshot) {
      result.push({
        id: 'optimistic-user',
        role: 'user',
        content: optimistic,
      })
    }
  }

  for (const [index, message] of snapshot.messages.entries()) {
    if (message.role === 'assistant') {
      if (isHypothesisEchoContent(message.content)) {
        continue
      }
      result.push(mapApiMessage(message, index))
    }

    if (message.role === 'tool') {
      result.push(mapApiMessage(message, index))
    }
  }

  return result
}

/**
 * Есть ли в snapshot новый assistant-ответ после последнего user-сообщения.
 */
export function hasAssistantReplyAfterLastUser(
  snapshot: ChatSnapshot,
): boolean {
  let lastUserIndex = -1
  for (let index = snapshot.messages.length - 1; index >= 0; index -= 1) {
    if (snapshot.messages[index]?.role === 'user') {
      lastUserIndex = index
      break
    }
  }

  if (lastUserIndex === -1) {
    return snapshot.messages.some(
      (message) =>
        message.role === 'assistant' &&
        !isHypothesisEchoContent(message.content),
    )
  }

  return snapshot.messages
    .slice(lastUserIndex + 1)
    .some(
      (message) =>
        message.role === 'assistant' &&
        !isHypothesisEchoContent(message.content),
    )
}
