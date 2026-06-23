/** Палитра графиков в стиле Plotly/GitHub dark (как в выводе агента). */
export const MONITORING_CHART_COLORS = {
  blue: '#58a6ff',
  lightBlue: '#79c0ff',
  green: '#56d364',
  orange: '#ffa657',
  red: '#f78166',
  purple: '#bc8cff',
  violet: '#d2a8ff',
  teal: '#7ee787',
  pink: '#ff7b72',
} as const

export const MONITORING_CHART_PALETTE = [
  MONITORING_CHART_COLORS.blue,
  MONITORING_CHART_COLORS.green,
  MONITORING_CHART_COLORS.orange,
  MONITORING_CHART_COLORS.purple,
  MONITORING_CHART_COLORS.teal,
  MONITORING_CHART_COLORS.red,
] as const

const GRID_STROKE = 'color-mix(in oklab, var(--foreground) 9%, transparent)'
const AXIS_TICK = 'var(--muted-foreground)'

/** Линии осей — тот же цвет, что и горизонтальная сетка (без акцента). */
export const CHART_AXIS_LINE = {
  stroke: GRID_STROKE,
  strokeWidth: 1,
}

/** Вертикальная линия курсора tooltip на line-графиках. */
export const CHART_TOOLTIP_CURSOR = {
  stroke: GRID_STROKE,
  strokeWidth: 1,
}

/** Цвета серий, читаемые в light и dark. */
export const CHART_SERIES_THEME_COLORS = {
  approved: 'var(--status-success)',
  declined: 'var(--accent-warn)',
} as const

export const CHART_MARGIN = { top: 12, right: 16, left: 4, bottom: 4 }

export const CHART_TOOLTIP_STYLE = {
  background: 'var(--elevated)',
  border: '1px solid color-mix(in oklab, var(--foreground) 14%, transparent)',
  borderRadius: 8,
  color: 'var(--foreground)',
  fontSize: 12,
  padding: '8px 10px',
}

export const CHART_AXIS_TICK = {
  fill: AXIS_TICK,
  fontSize: 11,
}

export const CHART_X_AXIS_TIME_PROPS = {
  axisLine: CHART_AXIS_LINE,
  tickLine: false,
  tick: CHART_AXIS_TICK,
  tickMargin: 8,
  angle: -35,
  textAnchor: 'end' as const,
  height: 52,
  minTickGap: 12,
}

export const CHART_X_AXIS_VALUE_PROPS = {
  axisLine: CHART_AXIS_LINE,
  tickLine: false,
  tick: CHART_AXIS_TICK,
  tickMargin: 8,
}

export const CHART_Y_AXIS_PROPS = {
  axisLine: CHART_AXIS_LINE,
  tickLine: false,
  tick: CHART_AXIS_TICK,
  width: 44,
}

export const CHART_Y_AXIS_CATEGORY_PROPS = {
  axisLine: CHART_AXIS_LINE,
  tickLine: false,
  tick: CHART_AXIS_TICK,
}

export interface ChartYAxisOptions {
  domain?: [number, number]
  tickFormatter?: (value: number) => string
  width?: number
}

/** Пропсы нижней оси X (время). */
export function getChartXAxisTimeProps() {
  return CHART_X_AXIS_TIME_PROPS
}

/** Пропсы нижней оси X (числовые значения). */
export function getChartXAxisValueProps() {
  return CHART_X_AXIS_VALUE_PROPS
}

/** Пропсы левой оси Y — только тики, без названия единицы. */
export function getChartYAxisProps(options?: ChartYAxisOptions) {
  return {
    ...CHART_Y_AXIS_PROPS,
    width: options?.width ?? CHART_Y_AXIS_PROPS.width,
    ...(options?.domain ? { domain: options.domain } : {}),
    ...(options?.tickFormatter ? { tickFormatter: options.tickFormatter } : {}),
  }
}

/** Правая ось dualAxis: без линии рамки, только тики. */
export function getChartYAxisRightProps(options?: ChartYAxisOptions) {
  return {
    ...CHART_Y_AXIS_PROPS,
    axisLine: false,
    orientation: 'right' as const,
    width: options?.width ?? CHART_Y_AXIS_PROPS.width,
    ...(options?.domain ? { domain: options.domain } : {}),
    ...(options?.tickFormatter ? { tickFormatter: options.tickFormatter } : {}),
  }
}

export const CHART_LEGEND_PROPS = {
  verticalAlign: 'bottom' as const,
  align: 'left' as const,
  iconType: 'circle' as const,
  iconSize: 8,
  wrapperStyle: {
    paddingTop: 12,
    fontSize: 12,
    color: AXIS_TICK,
  },
}

export const CHART_LINE_PROPS = {
  type: 'linear' as const,
  strokeWidth: 2,
  dot: { r: 3, strokeWidth: 0 },
  activeDot: { r: 5, strokeWidth: 0 },
}

/** Кнопки навигации слайдера — нейтральные на светлой теме. */
export const CHART_NAV_BUTTON_CLASS =
  'text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-1 focus-visible:ring-border/80'
