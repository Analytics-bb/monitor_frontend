const AUTH_CHANGED_EVENT = 'monitor-auth-changed'

/**
 * Подписывается на смену auth-сессии (login / logout / 401).
 *
 * @returns Функция отписки
 */
export function subscribeAuthChanged(listener: () => void): () => void {
  window.addEventListener(AUTH_CHANGED_EVENT, listener)
  return () => {
    window.removeEventListener(AUTH_CHANGED_EVENT, listener)
  }
}

/** Уведомляет подписчиков о смене auth-сессии. */
export function dispatchAuthChanged(): void {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT))
}
