import type { ChatSnapshot } from '@/api/fixtures/chatSnapshot'
import { isHypothesisEchoContent } from '@/lib/deepChatDisplay'

const SECRET_PATTERN =
  /(token|password|secret|api[_-]?key|authorization)\s*[:=]\s*\S+/gi

/**
 * Скрывает потенциальные секреты в preview аргументов MCP tool.
 */
export function redactArgsPreview(summary: string): string {
  return summary.replace(SECRET_PATTERN, '$1: [redacted]')
}

/**
 * Последнее содержательное assistant-сообщение перед pending_action.
 */
export function getLastAssistantMessageContent(
  snapshot: ChatSnapshot,
): string | null {
  const systemMessage = snapshot.messages.find(
    (message) => message.role === 'system',
  )
  const hypothesis = systemMessage?.content ?? null

  for (let index = snapshot.messages.length - 1; index >= 0; index -= 1) {
    const message = snapshot.messages[index]
    if (message?.role !== 'assistant') {
      continue
    }
    if (isHypothesisEchoContent(message.content, hypothesis)) {
      continue
    }
    return message.content
  }

  return null
}
