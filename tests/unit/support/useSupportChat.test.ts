import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as supportApi from '@/api/support'
import {
  resetSupportChatFixtureStore,
  setFixtureSupportChatSnapshot,
} from '@/api/support'
import { supportChatSnapshotFixture } from '@/api/fixtures/supportChatSnapshot'
import { useSupportChat } from '@/hooks/useSupportChat'

describe('useSupportChat', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    resetSupportChatFixtureStore()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('calls GET on mount', async () => {
    const getSpy = vi.spyOn(supportApi, 'getSupportChat')

    renderHook(() => useSupportChat())

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(getSpy.mock.calls.length).toBeGreaterThanOrEqual(1)
  })

  it('polls only when state is processing', async () => {
    setFixtureSupportChatSnapshot({
      ...supportChatSnapshotFixture,
      state: 'active',
    })

    const getSpy = vi.spyOn(supportApi, 'getSupportChat')

    const { result } = renderHook(() => useSupportChat())

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(result.current.snapshot?.state).toBe('active')
    const callsAfterActive = getSpy.mock.calls.length

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })

    expect(getSpy.mock.calls.length).toBe(callsAfterActive)
    expect(result.current.isPolling).toBe(false)
  })

  it('stops polling after unmount', async () => {
    setFixtureSupportChatSnapshot({
      ...supportChatSnapshotFixture,
      state: 'processing',
    })

    const getSpy = vi.spyOn(supportApi, 'getSupportChat')

    const { unmount } = renderHook(() => useSupportChat())

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    const callsAfterMount = getSpy.mock.calls.length
    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(10_000)
    })

    expect(getSpy.mock.calls.length).toBe(callsAfterMount)
  })
})
