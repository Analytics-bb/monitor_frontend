import { deepCasesListFixture } from './deepCaseSummary'
import {
  chatSnapshotCancelledFixture,
  chatSnapshotCompletedFixture,
  chatSnapshotErrorFixture,
  chatSnapshotFixture,
  chatSnapshotNotStartedFixture,
  type ChatSnapshot,
} from './chatSnapshot'

function withListMeta(
  snapshot: ChatSnapshot,
  gateId: string,
  createdAt: string,
  auditId: string,
): ChatSnapshot {
  return {
    ...snapshot,
    gate_id: gateId,
    gate_name: `Gate ${gateId}`,
    created_at: createdAt,
    last_error: snapshot.last_error
      ? {
          ...snapshot.last_error,
          details: {
            ...(typeof snapshot.last_error.details === 'object' &&
            snapshot.last_error.details !== null
              ? snapshot.last_error.details
              : {}),
            audit_id: auditId,
            gate_id: gateId,
          },
        }
      : undefined,
  }
}

/**
 * Строит начальный ChatSnapshot для fixture-режима по строке deep list.
 *
 * Если audit не найден в `deepCasesListFixture` — `not_started`.
 */
export function buildFixtureSnapshotFromList(auditId: string): ChatSnapshot {
  const listItem = deepCasesListFixture.find((item) => item.audit_id === auditId)

  if (!listItem) {
    return { ...chatSnapshotNotStartedFixture }
  }

  const { gate_id, created_at, deep_chat_state } = listItem

  switch (deep_chat_state) {
    case 'active':
      return withListMeta(chatSnapshotFixture, gate_id, created_at, auditId)
    case 'awaiting_approval':
      return withListMeta(chatSnapshotFixture, gate_id, created_at, auditId)
    case 'completed':
      return withListMeta(
        chatSnapshotCompletedFixture,
        gate_id,
        created_at,
        auditId,
      )
    case 'cancelled':
      return withListMeta(
        chatSnapshotCancelledFixture,
        gate_id,
        created_at,
        auditId,
      )
    case 'error':
      return withListMeta(
        chatSnapshotErrorFixture,
        gate_id,
        created_at,
        auditId,
      )
    case 'not_started':
    default:
      return withListMeta(
        chatSnapshotNotStartedFixture,
        gate_id,
        created_at,
        auditId,
      )
  }
}
