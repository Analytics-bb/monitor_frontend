import type { ChatMessage, ChatSnapshot } from '@/api/fixtures/chatSnapshot'

/**
 * Стабильный ключ сообщения для merge и React key.
 */
export function chatMessageStableKey(message: ChatMessage): string {
  if (message.message_id) {
    return message.message_id
  }
  if (message.created_at) {
    return `${message.role}:${message.created_at}`
  }
  return `${message.role}:${message.content.length}:${message.content.slice(0, 64)}`
}

/**
 * Объединяет snapshot при polling: не теряем messages, если GET вернул устаревший короткий список.
 */
export function mergeChatSnapshot(
  previous: ChatSnapshot | null,
  incoming: ChatSnapshot,
): ChatSnapshot {
  if (!previous || previous.audit_id !== incoming.audit_id) {
    return incoming
  }

  const mergedByKey = new Map<string, ChatMessage>()
  for (const message of previous.messages) {
    mergedByKey.set(chatMessageStableKey(message), message)
  }
  for (const message of incoming.messages) {
    mergedByKey.set(chatMessageStableKey(message), message)
  }

  const ordered: ChatMessage[] = []
  const seen = new Set<string>()

  for (const message of incoming.messages) {
    const key = chatMessageStableKey(message)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    ordered.push(mergedByKey.get(key) ?? message)
  }

  for (const message of previous.messages) {
    const key = chatMessageStableKey(message)
    if (seen.has(key)) {
      continue
    }
    seen.add(key)
    ordered.push(message)
  }

  return {
    ...incoming,
    messages: ordered,
    gate_name: incoming.gate_name ?? previous.gate_name,
    gate_id: incoming.gate_id ?? previous.gate_id,
    created_at: incoming.created_at ?? previous.created_at,
    usage_total: incoming.usage_total ?? previous.usage_total,
  }
}
