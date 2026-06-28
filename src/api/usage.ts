import { z } from 'zod'

import { apiGetJson } from './client'
import { ApiClientError } from './errors'
import {
  agentUsageDailyRollupFixture,
  agentUsageRunsListFixture,
  parseAgentUsageDailyRollup,
  parseAgentUsageRun,
  type AgentUsageDailyRollup,
  type AgentUsageRun,
} from './fixtures/agentUsageRun'

export const usageRunListEnvelopeSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
})

export type UsageRunListResponse = {
  items: AgentUsageRun[]
  total: number
  page: number
  page_size: number
}

export interface ListUsageRunsParams {
  gate_id?: string
  agent_kind?: AgentUsageRun['agent_kind']
  audit_id?: string
  from?: string
  to?: string
  page?: number
  page_size?: number
}

export interface ListUsageDailyParams {
  gate_id?: string
  date_from?: string
  date_to?: string
}

function filterFixtureRuns(params: ListUsageRunsParams): AgentUsageRun[] {
  let items = [...agentUsageRunsListFixture]

  if (params.gate_id) {
    items = items.filter((item) => item.gate_id === params.gate_id)
  }

  if (params.agent_kind) {
    items = items.filter((item) => item.agent_kind === params.agent_kind)
  }

  if (params.audit_id) {
    items = items.filter((item) => item.audit_id === params.audit_id)
  }

  if (params.from) {
    items = items.filter((item) => item.created_at >= params.from!)
  }

  if (params.to) {
    items = items.filter((item) => item.created_at <= `${params.to} 23:59:59`)
  }

  return items
}

function paginateFixtureRuns(
  items: AgentUsageRun[],
  page: number,
  pageSize: number,
): UsageRunListResponse {
  const total = items.length
  const start = (page - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return {
    items: slice,
    total,
    page,
    page_size: pageSize,
  }
}

function filterFixtureDailyRollups(
  params: ListUsageDailyParams,
): AgentUsageDailyRollup[] {
  let items = [...agentUsageDailyRollupFixture]

  if (params.gate_id) {
    items = items.filter((item) => item.gate_id === params.gate_id)
  }

  if (params.date_from) {
    items = items.filter((item) => item.date >= params.date_from!)
  }

  if (params.date_to) {
    items = items.filter((item) => item.date <= params.date_to!)
  }

  return items
}

function buildUsageRunsSearch(params: ListUsageRunsParams): URLSearchParams {
  const search = new URLSearchParams()
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 50

  if (params.gate_id) {
    search.set('gate_id', params.gate_id)
  }
  if (params.agent_kind) {
    search.set('agent_kind', params.agent_kind)
  }
  if (params.audit_id) {
    search.set('audit_id', params.audit_id)
  }
  if (params.from) {
    search.set('from', params.from)
  }
  if (params.to) {
    search.set('to', params.to)
  }
  search.set('page', String(page))
  search.set('page_size', String(pageSize))

  return search
}

function buildUsageDailySearch(params: ListUsageDailyParams): URLSearchParams {
  const search = new URLSearchParams()

  if (params.gate_id) {
    search.set('gate_id', params.gate_id)
  }
  if (params.date_from) {
    search.set('date_from', params.date_from)
  }
  if (params.date_to) {
    search.set('date_to', params.date_to)
  }

  return search
}

/**
 * Загружает список agent usage runs (`GET /api/agent/usage/runs`).
 *
 * Без `VITE_ANOMALY_API_BASE_URL` возвращает fixture с client-side filter и pagination.
 *
 * @param params - Query-параметры списка (gate, agent_kind, audit, период, page)
 * @returns Envelope с `items`, `total`, `page`, `page_size`
 * @throws Пробрасывает ошибки `apiGetJson` и Zod parse при невалидном ответе API
 */
export async function listUsageRuns(
  params: ListUsageRunsParams = {},
): Promise<UsageRunListResponse> {
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 50

  if (!import.meta.env.VITE_ANOMALY_API_BASE_URL) {
    const filtered = filterFixtureRuns(params)
    return paginateFixtureRuns(filtered, page, pageSize)
  }

  const search = buildUsageRunsSearch({ ...params, page, page_size: pageSize })
  const path = `/api/agent/usage/runs?${search.toString()}`
  const json = await apiGetJson<unknown>(path)
  const envelope = usageRunListEnvelopeSchema.parse(json)

  return {
    items: envelope.items.map((item) => parseAgentUsageRun(item)),
    total: envelope.total,
    page: envelope.page,
    page_size: envelope.page_size,
  }
}

/**
 * Загружает один usage run (`GET /api/agent/usage/runs/{run_id}`).
 *
 * @param runId - UUID run
 * @returns AgentUsageRun
 * @throws {ApiClientError} 404 `usage_run_not_found`
 */
export async function getUsageRun(runId: string): Promise<AgentUsageRun> {
  if (!import.meta.env.VITE_ANOMALY_API_BASE_URL) {
    const run = agentUsageRunsListFixture.find((item) => item.run_id === runId)
    if (!run) {
      throw new ApiClientError(404, {
        error_code: 'usage_run_not_found',
        message: 'Usage run not found',
      })
    }
    return run
  }

  const json = await apiGetJson<unknown>(
    `/api/agent/usage/runs/${encodeURIComponent(runId)}`,
  )
  return parseAgentUsageRun(json)
}

/**
 * Загружает дневные агрегаты deep usage (`GET /api/agent/usage/daily`).
 *
 * @param params - Optional gate_id и диапазон дат
 * @returns Массив AgentUsageDailyRollup
 */
export async function listUsageDaily(
  params: ListUsageDailyParams = {},
): Promise<AgentUsageDailyRollup[]> {
  if (!import.meta.env.VITE_ANOMALY_API_BASE_URL) {
    return filterFixtureDailyRollups(params)
  }

  const search = buildUsageDailySearch(params)
  const query = search.toString()
  const path = query
    ? `/api/agent/usage/daily?${query}`
    : '/api/agent/usage/daily'
  const json = await apiGetJson<unknown>(path)
  const rollups = z.array(z.unknown()).parse(json)

  return rollups.map((item) => parseAgentUsageDailyRollup(item))
}

export type { AgentUsageDailyRollup, AgentUsageRun }
