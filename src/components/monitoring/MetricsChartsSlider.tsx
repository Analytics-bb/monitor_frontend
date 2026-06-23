import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Bar,
  BarChart,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import type { MetricsChartSlide } from '@/api/fixtures/metricsCharts'
import {
  ChartTooltipContent,
  type ChartTooltipProps,
} from '@/components/monitoring/ChartTooltip'
import {
  CHART_LINE_PROPS,
  CHART_MARGIN,
  CHART_NAV_BUTTON_CLASS,
  CHART_TOOLTIP_CURSOR,
  CHART_Y_AXIS_CATEGORY_PROPS,
  getChartXAxisTimeProps,
  getChartXAxisValueProps,
  getChartYAxisProps,
  getChartYAxisRightProps,
} from '@/components/monitoring/chartTheme'
import { Button } from '@/components/ui/button'
import { useHiddenChartSeries } from '@/hooks/useHiddenChartSeries'
import { cn } from '@/lib/utils'

export interface MetricsChartsSliderProps {
  metricsCharts: MetricsChartSlide[] | null | undefined
  className?: string
}

export type { MetricsChartSlide }

function getLeftYAxisOptions(slide: MetricsChartSlide) {
  return {
    domain: slide.yAxisDomain,
    tickFormatter: slide.yAxisTickFormatter,
    tickCount: slide.yAxisTickCount,
    allowDecimals: slide.yAxisAllowDecimals,
    ticks: slide.yAxisTicks,
  }
}

function getRightYAxisOptions(slide: MetricsChartSlide) {
  return {
    domain: slide.yAxisDomainRight,
    tickFormatter: slide.yAxisTickFormatterRight,
  }
}

function getChartTooltipRenderer(slide: MetricsChartSlide) {
  return (props: {
    active?: boolean
    payload?: unknown
    label?: string | number
  }) => (
    <ChartTooltipContent
      active={props.active}
      payload={props.payload as ChartTooltipProps['payload']}
      label={props.label}
      series={slide.series}
      tooltipFields={slide.tooltipFields}
      tooltipFieldsOnly={slide.tooltipFieldsOnly}
    />
  )
}

function ChartLines({
  slide,
  hiddenSeries,
}: {
  slide: MetricsChartSlide
  hiddenSeries: Set<string>
}) {
  return (
    <>
      {slide.series.map((series) => (
        <Line
          key={series.key}
          dataKey={series.key}
          name={series.label}
          stroke={series.color}
          yAxisId={series.yAxisId ?? 'left'}
          hide={hiddenSeries.has(series.key)}
          {...CHART_LINE_PROPS}
        />
      ))}
    </>
  )
}

function LegendLineChart({
  slide,
  dualAxis = false,
}: {
  slide: MetricsChartSlide
  dualAxis?: boolean
}) {
  const { hiddenSeries, legendProps } = useHiddenChartSeries()

  return (
    <LineChart data={slide.data} margin={{ ...CHART_MARGIN, right: 8 }}>
      <XAxis dataKey={slide.xKey} {...getChartXAxisTimeProps()} />
      <YAxis
        yAxisId="left"
        {...getChartYAxisProps(getLeftYAxisOptions(slide))}
      />
      {dualAxis ? (
        <YAxis
          yAxisId="right"
          {...getChartYAxisRightProps(getRightYAxisOptions(slide))}
        />
      ) : null}
      <Tooltip
        content={getChartTooltipRenderer(slide)}
        cursor={CHART_TOOLTIP_CURSOR}
      />
      <Legend {...legendProps} />
      <ChartLines slide={slide} hiddenSeries={hiddenSeries} />
    </LineChart>
  )
}

function MetricsChartView({ slide }: { slide: MetricsChartSlide }) {
  if (slide.type === 'bar') {
    const series = slide.series[0]
    if (!series) {
      return null
    }

    const isHorizontal = slide.key === 'top_ips_tx_details_3h'

    if (isHorizontal) {
      return (
        <BarChart
          data={slide.data}
          layout="vertical"
          margin={{ ...CHART_MARGIN, left: 4 }}
        >
          <XAxis type="number" {...getChartXAxisValueProps()} />
          <YAxis
            type="category"
            dataKey={slide.xKey}
            width={120}
            {...CHART_Y_AXIS_CATEGORY_PROPS}
          />
          <Tooltip
            content={getChartTooltipRenderer(slide)}
            cursor={{ fillOpacity: 0.06 }}
          />
          <Bar
            dataKey={series.key}
            name={series.label}
            fill={series.color}
            radius={[0, 6, 6, 0]}
            maxBarSize={18}
          />
        </BarChart>
      )
    }

    return (
      <BarChart data={slide.data} margin={CHART_MARGIN}>
        <XAxis dataKey={slide.xKey} {...getChartXAxisTimeProps()} />
        <YAxis {...getChartYAxisProps(getLeftYAxisOptions(slide))} />
        <Tooltip
          content={getChartTooltipRenderer(slide)}
          cursor={{ fillOpacity: 0.06 }}
        />
        <Bar
          dataKey={series.key}
          name={series.label}
          fill={series.color}
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    )
  }

  if (slide.type === 'dualAxis') {
    return <LegendLineChart key={slide.key} slide={slide} dualAxis />
  }

  if (slide.type === 'multiLine') {
    return <LegendLineChart key={slide.key} slide={slide} />
  }

  const series = slide.series[0]
  if (!series) {
    return null
  }

  return (
    <LineChart data={slide.data} margin={CHART_MARGIN}>
      <XAxis dataKey={slide.xKey} {...getChartXAxisTimeProps()} />
      <YAxis {...getChartYAxisProps(getLeftYAxisOptions(slide))} />
      <Tooltip
        content={getChartTooltipRenderer(slide)}
        cursor={CHART_TOOLTIP_CURSOR}
      />
      <Line
        dataKey={series.key}
        name={series.label}
        stroke={series.color}
        {...CHART_LINE_PROPS}
      />
    </LineChart>
  )
}

/**
 * Carousel графиков метрик на Recharts (стилизация под Plotly/GitHub dark).
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

  const safeIndex = Math.min(index, slides.length - 1)
  const active = slides[safeIndex]!
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
            variant="ghost"
            size="icon-sm"
            className={CHART_NAV_BUTTON_CLASS}
            aria-label="Предыдущий график"
            onClick={goPrev}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span
            className="text-muted-foreground text-xs tabular-nums"
            data-testid="chart-slide-indicator"
          >
            {safeIndex + 1}/{total}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={CHART_NAV_BUTTON_CLASS}
            aria-label="Следующий график"
            onClick={goNext}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        className="bg-elevated/40 h-80 rounded-lg p-3 motion-safe:transition-opacity motion-safe:duration-200"
        data-testid="chart-active-slide"
        data-chart-key={active.key}
      >
        <ResponsiveContainer width="100%" height="100%">
          <MetricsChartView slide={active} />
        </ResponsiveContainer>
      </div>
    </div>
  )
}
