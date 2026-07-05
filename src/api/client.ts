import { ApiClientError, parseApiError } from './errors'
import { dispatchAuthChanged } from '@/auth/authEvents'
import {
  clearStoredSession,
  getSessionToken,
} from '@/auth/sessionStorage'

/** Таймаут HTTP-запроса по умолчанию (M17 §10.z.1). */
export const DEFAULT_API_TIMEOUT_MS = 30_000

/**
 * Таймаут мутаций deep chat: propose + MCP + 2 LLM-вызова на бэкенде.
 * Обычный {@link DEFAULT_API_TIMEOUT_MS} обрывает `POST .../chat/messages` до ответа.
 */
export const DEEP_CHAT_MUTATION_TIMEOUT_MS = 120_000

const MAX_GET_RETRIES = 3
const RETRYABLE_STATUSES = new Set([502, 503, 504])

export interface ApiFetchOptions extends RequestInit {
  /** Таймаут запроса в мс; по умолчанию {@link DEFAULT_API_TIMEOUT_MS}. */
  timeoutMs?: number
  /** Повторять GET при 502/503/504 (max 3); по умолчанию `true` для GET. */
  retry?: boolean
  /** Не добавлять Bearer (login и публичные эндпоинты). */
  skipAuth?: boolean
}

/**
 * Режим fixtures: нет `VITE_ANOMALY_API_BASE_URL` и разрешена offline-сборка.
 *
 * В dev — всегда при пустом base URL. В prod — только при `VITE_USE_API_FIXTURES=true`.
 */
export function isFixtureMode(): boolean {
  if (import.meta.env.VITE_ANOMALY_API_BASE_URL) {
    return false
  }
  return (
    import.meta.env.DEV || import.meta.env.VITE_USE_API_FIXTURES === 'true'
  )
}

/**
 * Возвращает базовый URL REST API anomaly-api.
 *
 * В fixture-режиме возвращает `null` (см. {@link isFixtureMode}).
 * Иначе в prod бросает ошибку, если env не задан.
 *
 * @returns Base URL без trailing slash или `null` в fixture-режиме
 * @throws {Error} В prod-сборке без API URL и без `VITE_USE_API_FIXTURES`
 */
export function getApiBaseUrl(): string | null {
  const baseUrl = import.meta.env.VITE_ANOMALY_API_BASE_URL
  if (!baseUrl) {
    if (isFixtureMode()) {
      if (import.meta.env.DEV) {
        console.warn(
          'VITE_ANOMALY_API_BASE_URL is not configured; use fixtures or set .env',
        )
      }
      return null
    }
    throw new Error('VITE_ANOMALY_API_BASE_URL is not configured')
  }
  return baseUrl.replace(/\/$/, '')
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Выполняет HTTP-запрос к anomaly-api относительно {@link getApiBaseUrl}.
 *
 * Добавляет JSON headers, timeout и retry для GET/HEAD при 502/503/504 (до 3 попыток).
 * Сетевой вызов через `fetch`; при ошибке HTTP парсит error envelope.
 *
 * @param path - Путь относительно base URL (с `/` или без)
 * @param init - Опции fetch и политика timeout/retry
 * @returns Успешный `Response` (status 2xx)
 * @throws {ApiClientError} При HTTP-ошибке с распарсенным envelope, если есть
 * @throws {Error} Если base URL не задан или сработал timeout (`AbortError`)
 */
export async function apiFetch(
  path: string,
  init: ApiFetchOptions = {},
): Promise<Response> {
  const baseUrl = getApiBaseUrl()
  if (!baseUrl) {
    throw new Error('VITE_ANOMALY_API_BASE_URL is not configured')
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${baseUrl}${normalizedPath}`
  const method = (init.method ?? 'GET').toUpperCase()
  const timeoutMs = init.timeoutMs ?? DEFAULT_API_TIMEOUT_MS
  const shouldRetry = init.retry ?? (method === 'GET' || method === 'HEAD')

  const headers = new Headers(init.headers)
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json')
  }
  if (
    init.body !== undefined &&
    init.body !== null &&
    !headers.has('Content-Type')
  ) {
    headers.set('Content-Type', 'application/json')
  }

  if (!init.skipAuth) {
    const token = getSessionToken()
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`)
    }
  }

  const requestInit: RequestInit = {
    ...init,
    method,
    headers,
  }

  let attempt = 0
  let lastResponse: Response | undefined

  while (attempt < MAX_GET_RETRIES) {
    attempt += 1
    lastResponse = await fetchWithTimeout(url, requestInit, timeoutMs)

    const canRetry =
      shouldRetry &&
      RETRYABLE_STATUSES.has(lastResponse.status) &&
      attempt < MAX_GET_RETRIES

    if (!canRetry) {
      break
    }

    await sleep(250 * attempt)
  }

  const response = lastResponse!
  if (!response.ok) {
    const apiError = await parseApiError(response.clone())
    if (
      response.status === 401 &&
      apiError?.error_code === 'not_authenticated'
    ) {
      clearStoredSession()
      dispatchAuthChanged()
    }
    throw new ApiClientError(response.status, apiError)
  }

  return response
}

/**
 * Выполняет GET и парсит JSON-тело ответа.
 *
 * @param path - Путь относительно base URL
 * @param init - Опции {@link apiFetch}
 * @returns Распарсенное тело ответа
 * @throws {ApiClientError} При HTTP-ошибке
 */
export async function apiGetJson<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<T> {
  const response = await apiFetch(path, { ...init, method: 'GET' })
  return (await response.json()) as T
}
