import { ApiClientError } from './errors'
import { apiFetch, apiGetJson, getApiBaseUrl } from './client'
import {
  agentInstructionsListFixture,
  parseAgentInstruction,
  parseAgentInstructionList,
  type AgentInstruction,
  type AgentInstructionCreate,
  type AgentInstructionPatch,
} from './fixtures/agentInstruction'

let instructionsFixtureStore: AgentInstruction[] = agentInstructionsListFixture.map(
  (item) => ({ ...item }),
)

function resetInstructionsFixtureStore(): void {
  instructionsFixtureStore = agentInstructionsListFixture.map((item) => ({ ...item }))
}

/**
 * Сбрасывает in-memory fixture store (Vitest).
 */
export function __resetInstructionsFixtureForTests(): void {
  resetInstructionsFixtureStore()
}

/**
 * Загружает список agent instructions (`GET /api/settings/instructions`).
 *
 * Без `VITE_ANOMALY_API_BASE_URL` возвращает fixture store.
 */
export async function listInstructions(): Promise<AgentInstruction[]> {
  if (!getApiBaseUrl()) {
    return instructionsFixtureStore.map((item) => ({ ...item }))
  }

  const json = await apiGetJson<unknown>('/api/settings/instructions')
  return parseAgentInstructionList(json)
}

/**
 * Частично обновляет instruction (`PATCH /api/settings/instructions/{id}`).
 *
 * @throws {ApiClientError} При HTTP-ошибке
 */
export async function patchInstruction(
  id: string,
  patch: AgentInstructionPatch,
): Promise<AgentInstruction> {
  if (!getApiBaseUrl()) {
    const index = instructionsFixtureStore.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiClientError(404, {
        error_code: 'instruction_not_found',
        message: 'Instruction not found',
      })
    }

    const updated: AgentInstruction = {
      ...instructionsFixtureStore[index],
      ...patch,
      updated_at: '2025-07-14 12:00:00',
    }
    instructionsFixtureStore[index] = updated
    return { ...updated }
  }

  const response = await apiFetch(
    `/api/settings/instructions/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(patch),
    },
  )
  const json = (await response.json()) as unknown
  return parseAgentInstruction(json)
}

/**
 * Создаёт instruction (`POST /api/settings/instructions`).
 *
 * @throws {ApiClientError} При HTTP-ошибке
 */
export async function createInstruction(
  body: AgentInstructionCreate,
): Promise<AgentInstruction> {
  if (!getApiBaseUrl()) {
    const created: AgentInstruction = {
      id: crypto.randomUUID(),
      name: body.name,
      prompt_template: body.prompt_template,
      enabled: body.enabled ?? true,
      agent_kind: body.agent_kind,
      updated_at: '2025-07-14 12:00:00',
    }
    instructionsFixtureStore = [...instructionsFixtureStore, created]
    return { ...created }
  }

  const response = await apiFetch('/api/settings/instructions', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  const json = (await response.json()) as unknown
  return parseAgentInstruction(json)
}

/**
 * Обновляет instruction (`PATCH /api/settings/instructions/{id}`).
 *
 * @throws {ApiClientError} При HTTP-ошибке
 */
export async function updateInstruction(
  id: string,
  patch: AgentInstructionPatch,
): Promise<AgentInstruction> {
  return patchInstruction(id, patch)
}

/**
 * Удаляет instruction (`DELETE /api/settings/instructions/{id}`).
 *
 * @throws {ApiClientError} При HTTP-ошибке
 */
export async function deleteInstruction(id: string): Promise<void> {
  if (!getApiBaseUrl()) {
    const index = instructionsFixtureStore.findIndex((item) => item.id === id)
    if (index === -1) {
      throw new ApiClientError(404, {
        error_code: 'instruction_not_found',
        message: 'Instruction not found',
      })
    }

    instructionsFixtureStore = instructionsFixtureStore.filter(
      (item) => item.id !== id,
    )
    return
  }

  await apiFetch(`/api/settings/instructions/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
}

export type { AgentInstruction, AgentInstructionCreate, AgentInstructionPatch }
