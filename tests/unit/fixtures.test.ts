import { describe, expect, it } from 'vitest'
import {
  agentUsageRunFixture,
  agentUsageRunSchema,
  auditEntryFixture,
  auditEntrySchema,
  chatSnapshotFixture,
  chatSnapshotSchema,
  deepCaseSummaryFixture,
  deepCaseSummarySchema,
  statusResponseFixture,
  statusResponseSchema,
} from '@/api/fixtures'

describe('fixtures', () => {
  it('parses all fixture samples with Zod', () => {
    expect(auditEntrySchema.parse(auditEntryFixture)).toEqual(auditEntryFixture)
    expect(chatSnapshotSchema.parse(chatSnapshotFixture)).toEqual(
      chatSnapshotFixture,
    )
    expect(agentUsageRunSchema.parse(agentUsageRunFixture)).toEqual(
      agentUsageRunFixture,
    )
    expect(statusResponseSchema.parse(statusResponseFixture)).toEqual(
      statusResponseFixture,
    )
    expect(deepCaseSummarySchema.parse(deepCaseSummaryFixture)).toEqual(
      deepCaseSummaryFixture,
    )
  })
})
