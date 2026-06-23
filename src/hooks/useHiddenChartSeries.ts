import { useCallback, useEffect, useMemo, useState, type ComponentProps } from 'react'
import { Legend, type LegendPayload } from 'recharts'

import { CHART_LEGEND_PROPS } from '@/components/monitoring/chartTheme'

type ChartLegendProps = Omit<ComponentProps<typeof Legend>, 'ref' | 'payload' | 'verticalAlign'>

function getLegendSeriesKey(dataKey: LegendPayload['dataKey']): string | null {
  if (typeof dataKey === 'string' || typeof dataKey === 'number') {
    return String(dataKey)
  }

  return null
}

/**
 * Управляет скрытием серий line-графика по клику на легенду.
 * Состояние сбрасывается при смене слайда (`slideKey`).
 */
export function useHiddenChartSeries(slideKey: string) {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() => new Set())

  useEffect(() => {
    setHiddenSeries(new Set())
  }, [slideKey])

  const toggleSeries = useCallback((dataKey: string) => {
    setHiddenSeries((current) => {
      const next = new Set(current)
      if (next.has(dataKey)) {
        next.delete(dataKey)
      } else {
        next.add(dataKey)
      }
      return next
    })
  }, [])

  const legendProps = useMemo((): ChartLegendProps => {
    const onClick: NonNullable<ChartLegendProps['onClick']> = (
      data,
      _index,
      _event,
    ) => {
      const key = getLegendSeriesKey(data.dataKey)
      if (key) {
        toggleSeries(key)
      }
    }

    return {
      ...CHART_LEGEND_PROPS,
      onClick,
    }
  }, [toggleSeries])

  return { hiddenSeries, legendProps }
}
