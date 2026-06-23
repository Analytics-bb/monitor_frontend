import { CHART_TOOLTIP_STYLE } from '@/components/monitoring/chartTheme'

interface ChartTooltipPayload {
  color?: string
  dataKey?: string | number
  name?: string
  value?: number | string
}

interface ChartTooltipProps {
  active?: boolean
  payload?: readonly ChartTooltipPayload[]
  label?: string | number
}

/**
 * Кастомный tooltip Recharts: компактные отступы между label и сериями.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
}: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div style={CHART_TOOLTIP_STYLE}>
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
        {payload.map((entry) => (
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
        ))}
      </ul>
    </div>
  )
}
