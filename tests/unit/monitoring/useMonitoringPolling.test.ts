import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as monitoringApi from '@/api/monitoring'
import { statusResponseFixture } from '@/api/fixtures/statusResponse'
import { useMonitoringPolling } from '@/hooks/useMonitoringPolling'

vi.mock('@/api/monitoring', () => ({
  getStatus: vi.fn(),
}))

const getStatusMock = vi.mocked(monitoringApi.getStatus)

describe('useMonitoringPolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    getStatusMock.mockResolvedValue(statusResponseFixture)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('uses faster interval when tick_in_progress is true', async () => {
    getStatusMock.mockResolvedValue({
      ...statusResponseFixture,
      scheduler: {
        ...statusResponseFixture.scheduler!,
        tick_in_progress: true,
      },
    })

    renderHook(() => useMonitoringPolling())

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    const callsAfterMount = getStatusMock.mock.calls.length
    expect(callsAfterMount).toBeGreaterThanOrEqual(1)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_500)
    })

    expect(getStatusMock.mock.calls.length).toBeGreaterThan(callsAfterMount)
  })

  it('stops polling after unmount', async () => {
    const { unmount } = renderHook(() => useMonitoringPolling())

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    const callsAfterMount = getStatusMock.mock.calls.length
    expect(callsAfterMount).toBeGreaterThanOrEqual(1)

    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_000)
    })

    expect(getStatusMock.mock.calls.length).toBe(callsAfterMount)
  })
})
