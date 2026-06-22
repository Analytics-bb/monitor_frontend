import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { usePolling } from '@/hooks/usePolling'

describe('usePolling', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('stops fetcher after unmount', async () => {
    const fetcher = vi.fn().mockResolvedValue('ok')

    const { unmount } = renderHook(() =>
      usePolling({ fetcher, intervalMs: 1000 }),
    )

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    const callsAfterMount = fetcher.mock.calls.length
    expect(callsAfterMount).toBeGreaterThanOrEqual(1)

    unmount()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(fetcher.mock.calls.length).toBe(callsAfterMount)
  })

  it('restarts timer when intervalMs changes', async () => {
    const fetcher = vi.fn().mockResolvedValue('ok')

    const { rerender } = renderHook(
      ({ intervalMs }) => usePolling({ fetcher, intervalMs }),
      { initialProps: { intervalMs: 1000 } },
    )

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    rerender({ intervalMs: 2000 })

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    const callsAfterRerender = fetcher.mock.calls.length

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    expect(fetcher.mock.calls.length).toBe(callsAfterRerender)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(fetcher.mock.calls.length).toBeGreaterThan(callsAfterRerender)
  })

  it('doubles interval when document is hidden', async () => {
    const fetcher = vi.fn().mockResolvedValue('ok')

    renderHook(() => usePolling({ fetcher, intervalMs: 1000 }))

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    const callsVisible = fetcher.mock.calls.length

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    })

    document.dispatchEvent(new Event('visibilitychange'))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })

    expect(fetcher.mock.calls.length).toBe(callsVisible)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(600)
    })

    expect(fetcher.mock.calls.length).toBeGreaterThan(callsVisible)
  })
})
