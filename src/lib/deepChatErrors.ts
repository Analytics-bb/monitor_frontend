import { ApiClientError } from '@/api/errors'

/**
 * Ошибка первичной загрузки чата — показываем full-page error.
 */
export function isFatalDeepChatLoadError(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) {
    return true
  }

  return error.status >= 500 || error.status === 404
}

/**
 * Ошибка мутации, при которой чат остаётся рабочим (toast + refetch).
 */
export function isRecoverableDeepChatMutationError(error: unknown): boolean {
  if (!(error instanceof ApiClientError)) {
    return false
  }

  return error.status === 409 || error.status === 422 || error.status === 400
}
