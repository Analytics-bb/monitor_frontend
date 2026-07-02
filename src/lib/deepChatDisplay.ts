import type { ChatMessage, ChatSnapshot } from '@/api/fixtures/chatSnapshot'

import { chatMessageStableKey } from './deepChatSnapshotMerge'

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
  return extractHypothesisConclusionBlock(systemContent)
}

/**
 * Извлекает raw `conclusion:` блок из system message (для сравнения echo).
 */
export function extractHypothesisConclusionBlock(
  systemContent: string,
): string | null {
  const withPromptBoundary = systemContent.match(
    /(?:^|\n)conclusion:\s*([\s\S]+?)(?=\nhypothesis_prompt:)/m,
  )
  if (withPromptBoundary?.[1]) {
    return withPromptBoundary[1].trim()
  }

  const trailing = systemContent.match(/(?:^|\n)conclusion:\s*([\s\S]+)$/s)
  return trailing?.[1]?.trim() ?? null
}

/**
 * Проверяет, что assistant message — echo hypothesis-вывода, а не ответ deep-агента.
 */
export function isHypothesisEchoContent(
  content: string,
  hypothesisSource: string | null = null,
): boolean {
  const hypothesisConclusion = hypothesisSource
    ? extractHypothesisConclusionBlock(hypothesisSource) ??
      hypothesisSource.trim()
    : null

  if (hypothesisConclusion && content.trim() === hypothesisConclusion) {
    return true
  }

  const trimmed = content.trim()
  if (trimmed.includes('<article>')) {
    if (hypothesisConclusion?.includes('<article>')) {
      return trimmed === hypothesisConclusion
    }
    return /^\S+[^\n]*\n\n<article>/s.test(trimmed)
  }

  return false
}

function mapApiMessage(message: ChatMessage): DeepChatDisplayMessage {
  const role =
    message.role === 'tool'
      ? 'tool'
      : message.role === 'assistant'
        ? 'assistant'
        : 'user'

  return {
    id: chatMessageStableKey(message),
    role,
    content: message.content,
  }
}

/**
 * Строит ленту сообщений для UI в хронологическом порядке API.
 *
 * Hypothesis — как первое user-сообщение (из system или seed до open).
 * Optimistic user — в конце ленты до появления в snapshot.
 */
export function buildDeepChatDisplayMessages(
  snapshot: ChatSnapshot,
  options?: {
    optimisticUserMessage?: string | null
    /** Conclusion из списка / navigation state до POST open. */
    seedHypothesisConclusion?: string | null
  },
): DeepChatDisplayMessage[] {
  const result: DeepChatDisplayMessage[] = []
  const systemMessage = snapshot.messages.find(
    (message) => message.role === 'system',
  )
  const hypothesisContent = systemMessage?.content ?? null
  const hypothesisFromSystem = hypothesisContent
    ? extractHypothesisConclusionFromSystem(hypothesisContent)
    : null
  const hypothesis =
    hypothesisFromSystem ??
    options?.seedHypothesisConclusion?.trim() ??
    null

  const apiUserMessages = snapshot.messages.filter(
    (message) => message.role === 'user',
  )
  const hypothesisAlreadyAsUser = apiUserMessages.some(
    (message) => message.content.trim() === hypothesis?.trim(),
  )
  const showHypothesisSeed = Boolean(hypothesis) && !hypothesisAlreadyAsUser
  let hypothesisBubbleRendered = false

  const pushHypothesisIfNeeded = () => {
    if (!showHypothesisSeed || hypothesisBubbleRendered || !hypothesis) {
      return
    }

    result.push({
      id: 'hypothesis-seed',
      role: 'user',
      content: hypothesis,
      variant: 'hypothesis',
    })
    hypothesisBubbleRendered = true
  }

  for (const message of snapshot.messages) {
    if (message.role === 'system') {
      continue
    }

    if (message.role === 'user') {
      result.push(mapApiMessage(message))
      continue
    }

    if (message.role === 'assistant') {
      if (isHypothesisEchoContent(message.content, hypothesisContent)) {
        continue
      }
      pushHypothesisIfNeeded()
      result.push(mapApiMessage(message))
      continue
    }

    if (message.role === 'tool') {
      pushHypothesisIfNeeded()
      result.push(mapApiMessage(message))
    }
  }

  pushHypothesisIfNeeded()

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

  return result
}

/**
 * Есть ли в snapshot новый assistant-ответ после последнего user-сообщения.
 */
export function hasAssistantReplyAfterLastUser(
  snapshot: ChatSnapshot,
): boolean {
  const systemMessage = snapshot.messages.find(
    (message) => message.role === 'system',
  )
  const hypothesisContent = systemMessage?.content ?? null

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
        !isHypothesisEchoContent(message.content, hypothesisContent),
    )
  }

  return snapshot.messages
    .slice(lastUserIndex + 1)
    .some(
      (message) =>
        message.role === 'assistant' &&
        !isHypothesisEchoContent(message.content, hypothesisContent),
    )
}

export interface AwaitingReplyBaseline {
  /** Сколько user-сообщений должно быть в snapshot (включая только что отправленное). */
  expectedUserCount: number
  /** Число assistant-сообщений на момент старта ожидания. */
  assistantCount: number
}

function countMessagesByRole(snapshot: ChatSnapshot): {
  user: number
  assistant: number
} {
  let user = 0
  let assistant = 0
  for (const message of snapshot.messages) {
    if (message.role === 'user') {
      user += 1
    }
    if (message.role === 'assistant') {
      assistant += 1
    }
  }
  return { user, assistant }
}

/**
 * Появился ли новый assistant-ответ с момента отправки user-сообщения.
 *
 * Игнорирует stale poll, где в snapshot ещё нет нашего user или старый assistant после прошлого user.
 */
export function hasAssistantReplySinceBaseline(
  snapshot: ChatSnapshot,
  baseline: AwaitingReplyBaseline,
): boolean {
  const counts = countMessagesByRole(snapshot)

  if (counts.user < baseline.expectedUserCount) {
    return false
  }

  return counts.assistant > baseline.assistantCount
}

/**
 * Создаёт baseline для ожидания ответа агента после send/open/approve.
 */
export function createAwaitingReplyBaseline(
  snapshot: ChatSnapshot | null,
  options?: { additionalUsers?: number },
): AwaitingReplyBaseline {
  const counts = snapshot
    ? countMessagesByRole(snapshot)
    : { user: 0, assistant: 0 }

  return {
    expectedUserCount: counts.user + (options?.additionalUsers ?? 0),
    assistantCount: counts.assistant,
  }
}

/**
 * Нужно ли продолжать thinking indicator.
 */
export function shouldKeepAgentThinking(
  snapshot: ChatSnapshot | null,
  baseline: AwaitingReplyBaseline | null,
): boolean {
  if (!snapshot) {
    return true
  }

  if (snapshot.state === 'awaiting_approval') {
    return false
  }

  if (!baseline) {
    return !hasAssistantReplyAfterLastUser(snapshot)
  }

  return !hasAssistantReplySinceBaseline(snapshot, baseline)
}
