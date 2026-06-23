import { act, renderHook } from '@testing-library/react'
import type { MouseEvent } from 'react'
import { describe, expect, it } from 'vitest'

import { useHiddenChartSeries } from '@/hooks/useHiddenChartSeries'

describe('useHiddenChartSeries', () => {
  it('toggles series visibility and resets on slide change', () => {
    const { result, rerender } = renderHook(
      ({ slideKey }) => useHiddenChartSeries(slideKey),
      { initialProps: { slideKey: 'errors_24h' } },
    )

    act(() => {
      result.current.legendProps.onClick?.(
        { dataKey: '942405', value: '942405' },
        0,
        {} as MouseEvent<HTMLElement>,
      )
    })

    expect(result.current.hiddenSeries.has('942405')).toBe(true)

    act(() => {
      result.current.legendProps.onClick?.(
        { dataKey: '942405', value: '942405' },
        0,
        {} as MouseEvent<HTMLElement>,
      )
    })

    expect(result.current.hiddenSeries.has('942405')).toBe(false)

    rerender({ slideKey: 'success_rate_by_hour_country_24h' })

    expect(result.current.hiddenSeries.size).toBe(0)
  })
})
