import { describe, expect, it } from 'vitest'

import {
  parseSupportChatSnapshot,
  supportChatSnapshotFixture,
  supportChatSnapshotSchema,
} from '@/api/fixtures/supportChatSnapshot'

describe('supportChatSnapshot fixture', () => {
  it('parses valid snapshot', () => {
    expect(parseSupportChatSnapshot(supportChatSnapshotFixture)).toEqual(
      supportChatSnapshotFixture,
    )
    expect(supportChatSnapshotSchema.shape.state).toBeDefined()
  })
})
