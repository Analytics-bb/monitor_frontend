/**
 * Базовый URL REST API anomaly-api (включая `/api`, без trailing slash).
 * Задаётся через `VITE_ANOMALY_API_BASE_URL` в `.env`.
 */
export function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_ANOMALY_API_BASE_URL
  if (!baseUrl) {
    throw new Error('VITE_ANOMALY_API_BASE_URL is not configured')
  }
  return baseUrl.replace(/\/$/, '')
}

/**
 * Выполняет fetch к anomaly-api относительно `getApiBaseUrl()`.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return fetch(`${getApiBaseUrl()}${normalizedPath}`, init)
}
