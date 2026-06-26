import { ApiClientError } from './errors'
import { instructionConflict409 } from './fixtures/conflictEnvelope'
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

function assertUniqueInstructionName(
  name: string,
  excludeInstructionId?: string,
): void {
  const duplicate = instructionsFixtureStore.find(
    (item) =>
      item.name === name && item.instruction_id !== excludeInstructionId,
  )
  if (duplicate) {
    throw instructionConflict409
  }
}

function resetInstructionsFixtureStore(): void {
  instructionsFixtureStore = agentInstructionsListFixture.map((item) => ({
    ...item,
  }))
}

/**
 * Сбрасывает in-memory fixture store (Vitest).
 */
export function __resetInstructionsFixtureForTests(): void {
  resetInstructionsFixtureStore()
}

/**
 * Загружает список agent instructions (`GET /api/settings/instructions`).
 */
export async function listInstructions(
  enabledOnly = false,
): Promise<AgentInstruction[]> {
  if (!getApiBaseUrl()) {
    const items = instructionsFixtureStore.map((item) => ({ ...item }))
    return enabledOnly ? items.filter((item) => item.enabled) : items
  }

  const query = enabledOnly ? '?enabled_only=true' : ''
  const json = await apiGetJson<unknown>(`/api/settings/instructions${query}`)
  return parseAgentInstructionList(json)
}

/**
 * Загружает instruction по ID (`GET /api/settings/instructions/{id}`).
 */
export async function getInstruction(
  instructionId: string,
): Promise<AgentInstruction> {
  if (!getApiBaseUrl()) {
    const item = instructionsFixtureStore.find(
      (entry) => entry.instruction_id === instructionId,
    )
    if (!item) {
      throw new ApiClientError(404, {
        error_code: 'instruction_not_found',
        message: 'Instruction not found',
      })
    }
    return { ...item }
  }

  const json = await apiGetJson<unknown>(
    `/api/settings/instructions/${encodeURIComponent(instructionId)}`,
  )
  return parseAgentInstruction(json)
}

/**
 * Частично обновляет instruction (`PATCH /api/settings/instructions/{id}`).
 */
export async function patchInstruction(
  instructionId: string,
  patch: AgentInstructionPatch,
): Promise<AgentInstruction> {
  if (!getApiBaseUrl()) {
    const index = instructionsFixtureStore.findIndex(
      (item) => item.instruction_id === instructionId,
    )
    if (index === -1) {
      throw new ApiClientError(404, {
        error_code: 'instruction_not_found',
        message: 'Instruction not found',
      })
    }

    const current = instructionsFixtureStore[index]
    assertUniqueInstructionName(patch.name ?? current.name, instructionId)

    const updated: AgentInstruction = {
      ...current,
      ...patch,
      match: patch.match ? { ...current.match, ...patch.match } : current.match,
      action: patch.action
        ? { ...current.action, ...patch.action }
        : current.action,
      updated_at: '2025-07-14 12:00:00',
    }
    instructionsFixtureStore[index] = updated
    return { ...updated }
  }

  const response = await apiFetch(
    `/api/settings/instructions/${encodeURIComponent(instructionId)}`,
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
 */
export async function createInstruction(
  body: AgentInstructionCreate,
): Promise<AgentInstruction> {
  if (!getApiBaseUrl()) {
    assertUniqueInstructionName(body.name)

    const created: AgentInstruction = {
      instruction_id: crypto.randomUUID(),
      name: body.name,
      enabled: body.enabled ?? true,
      match: body.match,
      action: body.action,
      prompt_template: body.prompt_template,
      created_at: '2025-07-14 12:00:00',
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
 * Обновляет instruction (`PATCH`).
 */
export async function updateInstruction(
  instructionId: string,
  patch: AgentInstructionPatch,
): Promise<AgentInstruction> {
  return patchInstruction(instructionId, patch)
}

/**
 * Удаляет instruction (`DELETE /api/settings/instructions/{id}`).
 */
export async function deleteInstruction(instructionId: string): Promise<void> {
  if (!getApiBaseUrl()) {
    const index = instructionsFixtureStore.findIndex(
      (item) => item.instruction_id === instructionId,
    )
    if (index === -1) {
      throw new ApiClientError(404, {
        error_code: 'instruction_not_found',
        message: 'Instruction not found',
      })
    }

    instructionsFixtureStore = instructionsFixtureStore.filter(
      (item) => item.instruction_id !== instructionId,
    )
    return
  }

  await apiFetch(
    `/api/settings/instructions/${encodeURIComponent(instructionId)}`,
    {
      method: 'DELETE',
    },
  )
}

export type { AgentInstruction, AgentInstructionCreate, AgentInstructionPatch }
