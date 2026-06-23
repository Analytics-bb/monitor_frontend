import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as deepChatApi from '@/api/deepChat'
import {
  resetDeepChatFixtureStore,
  setFixtureChatSnapshot,
} from '@/api/deepChat'
import { chatSnapshotFixture } from '@/api/fixtures/chatSnapshot'
import { useDeepChat } from '@/hooks/useDeepChat'

const AUDIT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

describe('useDeepChat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetDeepChatFixtureStore()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('stops polling in terminal state', async () => {
    setFixtureChatSnapshot(AUDIT_ID, {
      ...chatSnapshotFixture,
      state: 'completed',
    })

    const getChatSpy = vi.spyOn(deepChatApi, 'getChat')

    const { result } = renderHook(() => useDeepChat(AUDIT_ID))

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(result.current.snapshot?.state).toBe('completed')

    const callsAfterTerminal = getChatSpy.mock.calls.length

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })

    expect(getChatSpy.mock.calls.length).toBe(callsAfterTerminal)
    expect(result.current.isPolling).toBe(false)
  })

  it('stops polling after unmount', async () => {
    setFixtureChatSnapshot(AUDIT_ID, chatSnapshotFixture)

    const getChatSpy = vi.spyOn(deepChatApi, 'getChat')

    const { unmount } = renderHook(() => useDeepChat(AUDIT_ID))

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    const callsAfterMount = getChatSpy.mock.calls.length
    expect(callsAfterMount).toBeGreaterThanOrEqual(1)

    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })

    expect(getChatSpy.mock.calls.length).toBe(callsAfterMount)
  })
})
