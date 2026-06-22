import { ApiClientError, parseApiError } from './errors'

/** Таймаут HTTP-запроса по умолчанию (M17 §10.z.1). */
export const DEFAULT_API_TIMEOUT_MS = 30_000

const MAX_GET_RETRIES = 3
const RETRYABLE_STATUSES = new Set([502, 503, 504])

export interface ApiFetchOptions extends RequestInit {
  /** Таймаут запроса в мс; по умолчанию {@link DEFAULT_API_TIMEOUT_MS}. */
  timeoutMs?: number
  /** Повторять GET при 502/503/504 (max 3); по умолчанию `true` для GET. */
  retry?: boolean
}

/**
 * Базовый URL REST API anomaly-api (включая `/api`, без trailing slash).
 * В dev без `VITE_ANOMALY_API_BASE_URL` — `console.warn` и `null` (fixtures).
 */
export function getApiBaseUrl(): string | null {
  const baseUrl = import.meta.env.VITE_ANOMALY_API_BASE_URL
  if (!baseUrl) {
    if (import.meta.env.DEV) {
      console.warn(
        'VITE_ANOMALY_API_BASE_URL is not configured; use fixtures or set .env',
      )
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
 * Выполняет fetch к anomaly-api относительно `getApiBaseUrl()`.
 * JSON headers, timeout, GET-retry при 502/503/504.
 *
 * @throws {ApiClientError} при HTTP-ошибке с распарсенным envelope, если есть
 * @throws {Error} если base URL не задан
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
  const shouldRetry =
    init.retry ?? (method === 'GET' || method === 'HEAD')

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
    throw new ApiClientError(response.status, apiError)
  }

  return response
}

/**
 * GET + parse JSON body; бросает {@link ApiClientError} при ошибке HTTP.
 */
export async function apiGetJson<T>(
  path: string,
  init?: ApiFetchOptions,
): Promise<T> {
  const response = await apiFetch(path, { ...init, method: 'GET' })
  return (await response.json()) as T
}
