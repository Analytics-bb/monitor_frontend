import { apiGetJson, getApiBaseUrl } from './client'
import {
  agentContextsListFixture,
  parseAgentContextList,
  type AgentContext,
  type AgentKind,
} from './fixtures/agentContext'

export interface ListContextsParams {
  agent_kind: AgentKind
  gate_id?: string | null
}

function filterFixtureContexts(params: ListContextsParams): AgentContext[] {
  return agentContextsListFixture.filter((item) => {
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

/**
 * Загружает agent contexts (`GET /api/agent/contexts`).
 *
 * Без `VITE_ANOMALY_API_BASE_URL` возвращает отфильтрованный fixture.
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

export type { AgentContext, AgentKind }
