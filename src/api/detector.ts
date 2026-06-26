import { ApiClientError } from './errors'
import { apiFetch, apiGetJson, getApiBaseUrl } from './client'
import {
  detectorConfigGlobalFixture,
  detectorConfigsListFixture,
  parseDetectorConfig,
  parseDetectorConfigList,
  type DetectorConfig,
  type DetectorConfigPatch,
} from './fixtures/detectorConfig'

let detectorFixtureStore: DetectorConfig[] = detectorConfigsListFixture.map(
  (item) => ({ ...item }),
)

function resetDetectorFixtureStore(): void {
  detectorFixtureStore = detectorConfigsListFixture.map((item) => ({ ...item }))
}

/**
 * Сбрасывает in-memory fixture store (Vitest).
 */
export function __resetDetectorFixtureForTests(): void {
  resetDetectorFixtureStore()
}

function findGlobalConfig(): DetectorConfig {
  const global = detectorFixtureStore.find((item) => item.gate_id === null)
  if (!global) {
    throw new ApiClientError(404, {
      error_code: 'config_not_found',
      message: 'Global config not found',
    })
  }
  return { ...global }
}

/**
 * Список конфигов (`GET /api/settings/detector`).
 */
export async function listDetectorConfigs(): Promise<DetectorConfig[]> {
  if (!getApiBaseUrl()) {
    return detectorFixtureStore.map((item) => ({ ...item }))
  }

  const json = await apiGetJson<unknown>('/api/settings/detector')
  return parseDetectorConfigList(json)
}

/**
 * Effective global config (`GET /api/settings/detector/effective` без gate_id).
 */
export async function getGlobalDetectorConfig(): Promise<DetectorConfig> {
  if (!getApiBaseUrl()) {
    return findGlobalConfig()
  }

  const json = await apiGetJson<unknown>('/api/settings/detector/effective')
  return parseDetectorConfig(json)
}

/**
 * PATCH global config (`PATCH /api/settings/detector`).
 */
export async function patchGlobalDetectorConfig(
  patch: DetectorConfigPatch,
): Promise<DetectorConfig> {
  if (!getApiBaseUrl()) {
    const index = detectorFixtureStore.findIndex((item) => item.gate_id === null)
    if (index === -1) {
      throw new ApiClientError(404, {
        error_code: 'config_not_found',
        message: 'Global config not found',
      })
    }

    const current = detectorFixtureStore[index]
    const updated: DetectorConfig = {
      ...current,
      slice_minutes: patch.slice_minutes ?? current.slice_minutes,
      window_slices: patch.window_slices ?? current.window_slices,
      quantile_low: patch.quantile_low ?? current.quantile_low,
      quantile_high: patch.quantile_high ?? current.quantile_high,
      persistence: patch.persistence ?? current.persistence,
      mode: patch.mode ?? current.mode,
      updated_at: '2025-07-14 12:00:00',
    }
    detectorFixtureStore[index] = updated
    return { ...updated }
  }

  const response = await apiFetch('/api/settings/detector', {
    method: 'PATCH',
    body: JSON.stringify(patch),
  })
  const json = (await response.json()) as unknown
  return parseDetectorConfig(json)
}

/**
 * Сброс global config (`POST /api/settings/detector/reset`).
 */
export async function resetGlobalDetectorConfig(): Promise<void> {
  if (!getApiBaseUrl()) {
    const index = detectorFixtureStore.findIndex((item) => item.gate_id === null)
    if (index === -1) {
      throw new ApiClientError(404, {
        error_code: 'config_not_found',
        message: 'Global config not found',
      })
    }
    detectorFixtureStore[index] = { ...detectorConfigGlobalFixture }
    return
  }

  await apiFetch('/api/settings/detector/reset', { method: 'POST' })
}

export type { DetectorConfig, DetectorConfigPatch }
