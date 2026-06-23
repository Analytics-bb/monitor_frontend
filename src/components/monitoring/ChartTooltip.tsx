import type { MetricsChartTooltipField } from '@/api/fixtures/metricsCharts'
import { CHART_TOOLTIP_STYLE } from '@/components/monitoring/chartTheme'

interface ChartTooltipPayload {
  color?: string
  dataKey?: string | number
  name?: string
  value?: number | string
  payload?: Record<string, string | number>
}

export interface ChartTooltipProps {
  active?: boolean
  payload?: readonly ChartTooltipPayload[]
  label?: string | number
  tooltipFields?: readonly MetricsChartTooltipField[]
  /** Скрыть IP/время и строки серий — только tooltipFields. */
  tooltipFieldsOnly?: boolean
}

const detailLabelStyle = {
  color: 'var(--muted-foreground)',
} as const

const detailValueStyle = {
  color: 'var(--foreground)',
} as const

/**
 * Кастомный tooltip Recharts: компактные отступы между label и сериями.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  tooltipFields,
  tooltipFieldsOnly = false,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const row = payload[0]?.payload
  const showHeader = !tooltipFieldsOnly && label != null && label !== ''
  const showSeries = !tooltipFieldsOnly

  return (
    <div style={CHART_TOOLTIP_STYLE}>
      {showHeader ? (
        <p
          style={{
            margin: 0,
            marginBottom: 3,
            fontSize: 11,
            color: 'var(--muted-foreground)',
            lineHeight: 1.2,
          }}
        >
          {label}
        </p>
      ) : null}
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {showSeries
          ? payload.map((entry) => (
              <li
                key={String(entry.dataKey)}
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: entry.color,
                  lineHeight: 1.3,
                }}
              >
                {entry.name} : {entry.value}
              </li>
            ))
          : null}
        {tooltipFields?.map((field) => (
          <li
            key={field.key}
            style={{
              margin: 0,
              fontSize: 12,
              lineHeight: 1.3,
            }}
          >
            <span style={detailLabelStyle}>{field.label}: </span>
            <span style={detailValueStyle}>
              {row?.[field.key] != null && row[field.key] !== ''
                ? String(row[field.key])
                : '—'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
