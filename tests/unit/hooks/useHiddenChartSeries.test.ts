import { act, renderHook } from '@testing-library/react'
import type { MouseEvent } from 'react'
import { describe, expect, it } from 'vitest'

import { useHiddenChartSeries } from '@/hooks/useHiddenChartSeries'

describe('useHiddenChartSeries', () => {
  it('toggles series visibility on legend click', () => {
    const { result } = renderHook(() => useHiddenChartSeries())

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
  })
})
