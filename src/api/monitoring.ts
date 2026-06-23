import { apiFetch, apiGetJson, getApiBaseUrl } from './client'
import {
  parseStatusResponse,
  statusResponseFixture,
  type StatusResponse,
} from './fixtures/statusResponse'

/**
 * Загружает снимок scheduler (`GET /api/status`).
 *
 * В dev без `VITE_ANOMALY_API_BASE_URL` возвращает fixture.
 */
export async function getStatus(): Promise<StatusResponse> {
  if (!getApiBaseUrl()) {
    return statusResponseFixture
  }

  const json = await apiGetJson<unknown>('/api/status')
  return parseStatusResponse(json)
}

/**
 * Активирует gate (`POST /api/gates/{gate_id}/activate`).
 *
 * @throws {ApiClientError} При HTTP-ошибке (в т.ч. 404 `gate_not_found`)
 */
export async function activateGate(gateId: string): Promise<void> {
  if (!getApiBaseUrl()) {
    return
  }

  await apiFetch(`/api/gates/${encodeURIComponent(gateId)}/activate`, {
    method: 'POST',
  })
}

export type { StatusResponse }
