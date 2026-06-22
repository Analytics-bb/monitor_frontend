import { apiGetJson, getApiBaseUrl } from './client'
import {
  parseStatusResponse,
  statusResponseFixture,
  type StatusResponse,
} from './fixtures/statusResponse'

/**
 * Загружает снимок scheduler (`GET /api/status`).
 *
 * В dev без `VITE_ANOMALY_API_BASE_URL` возвращает fixture.
 *
 * @returns Распарсенный `StatusResponse`
 * @throws {ApiClientError} При HTTP-ошибке API
 */
export async function getStatus(): Promise<StatusResponse> {
  if (!getApiBaseUrl()) {
    return statusResponseFixture
  }

  const json = await apiGetJson<unknown>('/api/status')
  return parseStatusResponse(json)
}

export type { StatusResponse }
