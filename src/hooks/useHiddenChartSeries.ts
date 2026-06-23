import { useCallback, useMemo, useState, type ComponentProps } from 'react'
import { Legend, type LegendPayload } from 'recharts'

import { CHART_LEGEND_PROPS } from '@/components/monitoring/chartTheme'

type ChartLegendProps = Omit<
  ComponentProps<typeof Legend>,
  'ref' | 'payload' | 'verticalAlign'
>

function getLegendSeriesKey(dataKey: LegendPayload['dataKey']): string | null {
  if (typeof dataKey === 'string' || typeof dataKey === 'number') {
    return String(dataKey)
  }

  return null
}

/**
 * Управляет скрытием серий line-графика по клику на легенду.
 * Сброс состояния — remount родителя с `key={slide.key}`.
 */
export function useHiddenChartSeries() {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(() => new Set())

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
    const onClick: NonNullable<ChartLegendProps['onClick']> = (data) => {
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
