import { ApiClientError } from './errors'
import { apiFetch, apiGetJson, getApiBaseUrl } from './client'
import {
  agentContextSchema,
  agentContextsListFixture,
  parseAgentContextListPage,
  type AgentContext,
  type AgentContextListPage,
  type AgentContextUpsert,
  type AgentKind,
} from './fixtures/agentContext'

export interface ListContextsParams {
  agent_kind?: AgentKind
  gate_id?: string
  page?: number
  page_size?: number
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
    if (params.agent_kind && item.agent_kind !== params.agent_kind) {
      return false
    }
    if (params.gate_id !== undefined && item.gate_id !== params.gate_id) {
      return false
    }
    return true
  })
}

function paginateFixture(
  items: AgentContext[],
  page: number,
  pageSize: number,
): AgentContextListPage {
  const total = items.length
  const start = (page - 1) * pageSize
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    page_size: pageSize,
  }
}

function buildContextsQuery(params: ListContextsParams): string {
  const search = new URLSearchParams()
  if (params.agent_kind) {
    search.set('agent_kind', params.agent_kind)
  }
  if (params.gate_id) {
    search.set('gate_id', params.gate_id)
  }
  if (params.page) {
    search.set('page', String(params.page))
  }
  if (params.page_size) {
    search.set('page_size', String(params.page_size))
  }
  return search.toString()
}

/**
 * Загружает agent contexts (`GET /api/agent/contexts`).
 */
export async function listContexts(
  params: ListContextsParams = {},
): Promise<AgentContextListPage> {
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 50

  if (!getApiBaseUrl()) {
    const filtered = filterFixtureContexts(params)
    return paginateFixture(filtered, page, pageSize)
  }

  const query = buildContextsQuery({ ...params, page, page_size: pageSize })
  const json = await apiGetJson<unknown>(`/api/agent/contexts?${query}`)
  return parseAgentContextListPage(json)
}

/**
 * Upsert agent context (`PUT /api/agent/contexts`) по ключу (agent_kind, gate_id).
 */
export async function upsertContext(
  body: AgentContextUpsert,
): Promise<AgentContext> {
  if (!getApiBaseUrl()) {
    const index = contextsFixtureStore.findIndex(
      (item) =>
        item.agent_kind === body.agent_kind && item.gate_id === body.gate_id,
    )

    if (index >= 0) {
      const updated: AgentContext = {
        ...contextsFixtureStore[index],
        context_body: body.context_body,
        updated_at: '2025-07-14 12:00:00',
      }
      contextsFixtureStore[index] = updated
      return { ...updated }
    }

    throw new ApiClientError(404, {
      error_code: 'context_not_found',
      message: 'Context not found for upsert key',
    })
  }

  const response = await apiFetch('/api/agent/contexts', {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  const json = (await response.json()) as unknown
  return agentContextSchema.parse(json)
}

export type {
  AgentContext,
  AgentContextListPage,
  AgentContextUpsert,
  AgentKind,
}
