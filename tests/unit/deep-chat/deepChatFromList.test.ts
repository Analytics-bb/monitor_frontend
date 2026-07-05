import { describe, expect, it } from 'vitest'

import { deepCasesListFixture } from '@/api/fixtures/deepCaseSummary'
import { buildFixtureSnapshotFromList } from '@/api/fixtures/deepChatFromList'

describe('buildFixtureSnapshotFromList', () => {
  it('maps deep list state to chat snapshot for known audit', () => {
    const activeItem = deepCasesListFixture[1]!
    expect(activeItem.deep_chat_state).toBe('active')

    const snapshot = buildFixtureSnapshotFromList(activeItem.audit_id)

    expect(snapshot.state).toBe('active')
    expect(snapshot.gate_id).toBe(activeItem.gate_id)
    expect(snapshot.messages.length).toBeGreaterThan(0)
  })

  it('maps legacy awaiting_approval list row to active snapshot without pending', () => {
    const item = deepCasesListFixture[2]!
    expect(item.deep_chat_state).toBe('awaiting_approval')

    const snapshot = buildFixtureSnapshotFromList(item.audit_id)

    expect(snapshot.state).toBe('active')
    expect(snapshot.pending_action).toBeNull()
  })

  it('returns error snapshot for error list row', () => {
    const item = deepCasesListFixture[5]!
    expect(item.deep_chat_state).toBe('error')

    const snapshot = buildFixtureSnapshotFromList(item.audit_id)

    expect(snapshot.state).toBe('error')
    expect(snapshot.last_error?.error_code).toBe('budget_exceeded')
  })

  it('falls back to not_started for unknown audit', () => {
    const snapshot = buildFixtureSnapshotFromList(
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
    )

    expect(snapshot.state).toBe('not_started')
    expect(snapshot.messages).toHaveLength(0)
  })
})
