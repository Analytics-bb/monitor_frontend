import { z } from 'zod'

import { apiGetJson } from './client'
import {
  deepCaseSummaryFixture,
  parseDeepCaseSummary,
  type DeepCaseSummary,
} from './fixtures/deepCaseSummary'

export const deepCasesListEnvelopeSchema = z.object({
  items: z.array(z.unknown()),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  page_size: z.number().int().positive(),
})

export type DeepCasesListResponse = {
  items: DeepCaseSummary[]
  total: number
  page: number
  page_size: number
}

export interface ListDeepCasesParams {
  gate_id?: string
  state?: DeepCaseSummary['deep_chat_state']
  from?: string
  to?: string
  page?: number
  page_size?: number
}

const deepCasesListFixture: DeepCaseSummary[] = [
  deepCaseSummaryFixture,
  {
    audit_id: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    gate_id: '43',
    event_summary: 'Unusual traffic pattern on gate 43',
    conclusion: 'Требуется ручная проверка.',
    deep_chat_state: 'active',
    created_at: '2025-07-15 09:15:00',
  },
  {
    audit_id: 'c3d4e5f6-a7b8-9012-cdef-123456789012',
    gate_id: '42',
    event_summary: 'Secondary event on gate 42',
    conclusion: 'Повторное срабатывание.',
    deep_chat_state: 'completed',
    created_at: '2025-07-13 18:00:00',
  },
]

function filterFixtureItems(params: ListDeepCasesParams): DeepCaseSummary[] {
  let items = [...deepCasesListFixture]

  if (params.gate_id) {
    items = items.filter((item) => item.gate_id === params.gate_id)
  }

  if (params.state) {
    items = items.filter((item) => item.deep_chat_state === params.state)
  }

  if (params.from) {
    items = items.filter((item) => item.created_at >= params.from!)
  }

  if (params.to) {
    items = items.filter((item) => item.created_at <= `${params.to} 23:59:59`)
  }

  return items
}

function paginateFixture(
  items: DeepCaseSummary[],
  page: number,
  pageSize: number,
): DeepCasesListResponse {
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

/**
 * Загружает список deep cases (`GET /api/deep/cases`).
 *
 * В dev без `VITE_ANOMALY_API_BASE_URL` возвращает fixture с client-side filter/pagination.
 */
export async function listDeepCases(
  params: ListDeepCasesParams = {},
): Promise<DeepCasesListResponse> {
  const page = params.page ?? 1
  const pageSize = params.page_size ?? 20

  if (!import.meta.env.VITE_ANOMALY_API_BASE_URL) {
    const filtered = filterFixtureItems(params)
    return paginateFixture(filtered, page, pageSize)
  }

  const search = new URLSearchParams()
  if (params.gate_id) {
    search.set('gate_id', params.gate_id)
  }
  if (params.state) {
    search.set('state', params.state)
  }
  if (params.from) {
    search.set('from', params.from)
  }
  if (params.to) {
    search.set('to', params.to)
  }
  search.set('page', String(page))
  search.set('page_size', String(pageSize))

  const query = search.toString()
  const path = query ? `/api/deep/cases?${query}` : '/api/deep/cases'
  const json = await apiGetJson<unknown>(path)
  const envelope = deepCasesListEnvelopeSchema.parse(json)

  return {
    items: envelope.items.map((item) => parseDeepCaseSummary(item)),
    total: envelope.total,
    page: envelope.page,
    page_size: envelope.page_size,
  }
}

export type { DeepCaseSummary }
