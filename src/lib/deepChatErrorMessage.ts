import { ApiClientError, type ApiError } from '@/api/errors'

/**
 * Приводит произвольную ошибку к API envelope для отображения в чате.
 */
export function toApiErrorFromUnknown(error: unknown): ApiError {
  if (error instanceof ApiClientError && error.apiError) {
    return error.apiError
  }

  if (error instanceof ApiClientError) {
    return {
      error_code: `http_${error.status}`,
      message: error.message,
    }
  }

  if (error instanceof Error) {
    if (error.name === 'AbortError' || /aborted/i.test(error.message)) {
      return {
        error_code: 'request_timeout',
        message:
          'Превышено время ожидания ответа. Анализ может ещё выполняться на сервере — подождите и обновите чат.',
      }
    }

    return {
      error_code: 'client_error',
      message: error.message,
    }
  }

  return {
    error_code: 'unknown_error',
    message: 'Произошла неизвестная ошибка.',
  }
}

function formatErrorDetails(details: unknown): string | null {
  if (details == null) {
    return null
  }

  if (typeof details === 'string') {
    return details
  }

  try {
    return JSON.stringify(details, null, 2)
  } catch {
    return String(details)
  }
}

/**
 * Structured markdown-ответ агента об ошибке для ленты чата.
 */
export function buildDeepChatErrorAssistantContent(error: ApiError): string {
  const details = formatErrorDetails(error.details)

  return `📈 **Ошибка**

**Код:** \`${error.error_code}\`

${error.message}

${details ? `\`\`\`\n${details}\n\`\`\`` : ''}

🎯 **Итог:** анализ приостановлен. Проверьте детали выше и повторите действие при необходимости.`
}

/**
 * Проверяет, что assistant уже ответил по этой ошибке (избегаем дублей).
 */
export function isErrorCoveredByAssistantMessage(
  content: string,
  error: ApiError,
): boolean {
  const trimmed = content.trim()
  return (
    trimmed.includes(error.error_code) ||
    trimmed.includes(error.message) ||
    trimmed.includes('📈 **Ошибка**')
  )
}
