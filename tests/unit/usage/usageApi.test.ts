import { describe, expect, it } from 'vitest'

import {
  agentUsageRunFixture,
  agentUsageRunHypothesisFixture,
  agentUsageRunSchema,
  parseAgentUsageRun,
} from '@/api/fixtures/agentUsageRun'
import { getUsageRun, listUsageRuns } from '@/api/usage'
import { ApiClientError } from '@/api/errors'

describe('usage API fixtures', () => {
  it('parses deep and hypothesis runs with OpenAPI M14 fields', () => {
    expect(parseAgentUsageRun(agentUsageRunFixture)).toEqual(agentUsageRunFixture)
    expect(parseAgentUsageRun(agentUsageRunHypothesisFixture)).toEqual(
      agentUsageRunHypothesisFixture,
    )
    expect(agentUsageRunFixture.step_breakdown).toHaveLength(2)
    expect(agentUsageRunHypothesisFixture.audit_id).toBeNull()
    expect(agentUsageRunSchema.shape.prompt_tokens).toBeDefined()
  })

  it('listUsageRuns returns paginated envelope from fixture', async () => {
    const result = await listUsageRuns({ page: 1, page_size: 2 })

    expect(result.total).toBe(3)
    expect(result.page).toBe(1)
    expect(result.page_size).toBe(2)
    expect(result.items).toHaveLength(2)
    expect(result.items[0]?.run_id).toBe(agentUsageRunFixture.run_id)
  })

  it('listUsageRuns filters by audit_id', async () => {
    const result = await listUsageRuns({
      audit_id: agentUsageRunFixture.audit_id!,
    })

    expect(result.total).toBe(1)
    expect(result.items[0]?.run_id).toBe(agentUsageRunFixture.run_id)
  })

  it('getUsageRun returns deep fixture by id', async () => {
    const run = await getUsageRun(agentUsageRunFixture.run_id)
    expect(run.agent_kind).toBe('deep')
    expect(run.step_breakdown[0]?.tool_name).toBe('mysql_query')
  })

  it('getUsageRun throws 404 for unknown run_id', async () => {
    await expect(
      getUsageRun('00000000-0000-4000-8000-000000000000'),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(ApiClientError)
      expect((error as ApiClientError).status).toBe(404)
      expect((error as ApiClientError).apiError?.error_code).toBe(
        'usage_run_not_found',
      )
      return true
    })
  })
})
