import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { StatusResponse } from '@/api/monitoring'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface MetricsChartsSliderProps {
  metricsCharts: StatusResponse['metrics_charts']
  className?: string
}

/**
 * Carousel графиков метрик на Recharts.
 */
export function MetricsChartsSlider({
  metricsCharts,
  className,
}: MetricsChartsSliderProps) {
  const slides = useMemo(
    () => metricsCharts?.filter((chart) => chart.data.length > 0) ?? [],
    [metricsCharts],
  )
  const [index, setIndex] = useState(0)

  if (slides.length === 0) {
    return (
      <p
        className="text-muted-foreground flex h-48 items-center justify-center text-sm"
        data-testid="charts-empty"
      >
        Нет данных для графиков
      </p>
    )
  }

  const active = slides[index]!
  const total = slides.length

  const goPrev = () => {
    setIndex((current) => (current - 1 + total) % total)
  }

  const goNext = () => {
    setIndex((current) => (current + 1 + total) % total)
  }

  return (
    <div className={cn('space-y-3', className)} data-testid="metrics-charts">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{active.title}</h2>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Предыдущий график"
            onClick={goPrev}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span
            className="text-muted-foreground text-xs tabular-nums"
            data-testid="chart-slide-indicator"
          >
            {index + 1}/{total}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            aria-label="Следующий график"
            onClick={goNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        className="border-border h-56 rounded-md border p-2 motion-safe:transition-opacity motion-safe:duration-200"
        data-testid="chart-active-slide"
        data-chart-key={active.key}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={active.data}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="label" tick={{ fill: 'var(--muted-foreground)' }} />
            <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
            <Tooltip
              contentStyle={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--card-foreground)',
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
