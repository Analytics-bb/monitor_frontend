import { ApiClientError } from './errors'
import { apiFetch, apiGetJson, getApiBaseUrl } from './client'
import {
  agentContextSchema,
  agentContextsListFixture,
  parseAgentContextList,
  type AgentContext,
  type AgentContextUpsert,
  type AgentKind,
} from './fixtures/agentContext'

export interface ListContextsParams {
  agent_kind: AgentKind
  gate_id?: string | null
}

let contextsFixtureStore: AgentContext[] = agentContextsListFixture.map(
  (item) => ({ ...item }),
)

function resetContextsFixtureStore(): void {
  contextsFixtureStore = agentContextsListFixture.map((item) => ({ ...item }))
}

/**
 * Сбрасывает in-memory fixture store (Vitest).
 */
export function __resetContextsFixtureForTests(): void {
  resetContextsFixtureStore()
}

function filterFixtureContexts(params: ListContextsParams): AgentContext[] {
  return contextsFixtureStore.filter((item) => {
    if (item.agent_kind !== params.agent_kind) {
      return false
    }

    if (params.gate_id === null) {
      return item.gate_id === null
    }

    if (params.gate_id) {
      return item.gate_id === params.gate_id
    }

    return true
  })
}

function buildContextsQuery(params: ListContextsParams): string {
  const search = new URLSearchParams()
  search.set('agent_kind', params.agent_kind)

  if (params.gate_id === null) {
    search.set('gate_id', '')
  } else if (params.gate_id) {
    search.set('gate_id', params.gate_id)
  }

  return search.toString()
}

function upsertFixtureContext(body: AgentContextUpsert): AgentContext {
  const index = contextsFixtureStore.findIndex(
    (item) =>
      item.agent_kind === body.agent_kind &&
      item.gate_id === body.gate_id &&
      item.key === body.key,
  )

  if (index >= 0) {
    const updated: AgentContext = {
      ...contextsFixtureStore[index],
      content: body.content,
      updated_at: '2025-07-14 12:00:00',
    }
    contextsFixtureStore[index] = updated
    return { ...updated }
  }

  const created: AgentContext = {
    context_id: crypto.randomUUID(),
    agent_kind: body.agent_kind,
    gate_id: body.gate_id,
    key: body.key,
    content: body.content,
    updated_at: '2025-07-14 12:00:00',
  }
  contextsFixtureStore = [...contextsFixtureStore, created]
  return { ...created }
}

/**
 * Загружает agent contexts (`GET /api/agent/contexts`).
 */
export async function listContexts(
  params: ListContextsParams,
): Promise<AgentContext[]> {
  if (!getApiBaseUrl()) {
    return filterFixtureContexts(params)
  }

  const query = buildContextsQuery(params)
  const json = await apiGetJson<unknown>(`/api/agent/contexts?${query}`)
  return parseAgentContextList(json)
}

/**
 * Upsert agent context (`PUT /api/agent/contexts`).
 *
 * @throws {ApiClientError} При HTTP-ошибке
 */
export async function upsertContext(
  body: AgentContextUpsert,
): Promise<AgentContext> {
  if (!getApiBaseUrl()) {
    return upsertFixtureContext(body)
  }

  const response = await apiFetch('/api/agent/contexts', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  const json = (await response.json()) as unknown
  return agentContextSchema.parse(json)
}

/**
 * Удаляет agent context (`DELETE /api/agent/contexts/{context_id}`).
 *
 * @throws {ApiClientError} При HTTP-ошибке
 */
export async function deleteContext(contextId: string): Promise<void> {
  if (!getApiBaseUrl()) {
    const index = contextsFixtureStore.findIndex(
      (item) => item.context_id === contextId,
    )
    if (index === -1) {
      throw new ApiClientError(404, {
        error_code: 'context_not_found',
        message: 'Context not found',
      })
    }

    contextsFixtureStore = contextsFixtureStore.filter(
      (item) => item.context_id !== contextId,
    )
    return
  }

  await apiFetch(`/api/agent/contexts/${encodeURIComponent(contextId)}`, {
    method: 'DELETE',
  })
}

export type { AgentContext, AgentContextUpsert, AgentKind }
