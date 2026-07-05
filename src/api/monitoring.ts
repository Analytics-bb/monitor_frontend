import { apiFetch, apiGetJson, getApiBaseUrl } from './client'
import {
  activeGateFixture,
  parseGateInfo,
  type GateInfo,
} from './fixtures/gateInfo'
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

  const json = await apiGetJson<unknown>('/status')
  return parseStatusResponse(json)
}

/**
 * Возвращает активный gate из Mongo (`GET /api/gates/active`).
 *
 * @throws {ApiClientError} При HTTP-ошибке (в т.ч. 404 `no_active_gate`)
 */
export async function getActiveGate(): Promise<GateInfo> {
  if (!getApiBaseUrl()) {
    return activeGateFixture
  }

  const json = await apiGetJson<unknown>('/gates/active')
  return parseGateInfo(json)
}

/**
 * Активирует gate (`POST /api/gates/{gate_id}/activate`).
 *
 * После успешного POST подтягивает `GET /api/gates/active` — имя гейта
 * резолвится на бэкенде (MySQL lookup), тело POST может быть без `gate_name`.
 *
 * @returns Активный `GateInfo`
 * @throws {ApiClientError} При HTTP-ошибке (в т.ч. 404 `gate_not_found`)
 */
export async function activateGate(gateId: string): Promise<GateInfo> {
  if (!getApiBaseUrl()) {
    return {
      gate_id: gateId,
      gate_name:
        gateId === activeGateFixture.gate_id
          ? activeGateFixture.gate_name
          : `Gate ${gateId}`,
    }
  }

  await apiFetch(`/gates/${encodeURIComponent(gateId)}/activate`, {
    method: 'POST',
  })

  return getActiveGate()
}

export type { GateInfo, StatusResponse }
