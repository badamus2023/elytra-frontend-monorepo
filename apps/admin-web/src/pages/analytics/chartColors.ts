export const CHART_COLORS = {
  violet: '#a78bfa',
  cyan: '#22d3ee',
  emerald: '#34d399',
  amber: '#fbbf24',
  rose: '#fb7185',
  indigo: '#818cf8',
  zinc: '#71717a',
} as const

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: CHART_COLORS.zinc,
  paid: CHART_COLORS.cyan,
  dispatched: CHART_COLORS.violet,
  inflight: CHART_COLORS.indigo,
  delivered: CHART_COLORS.emerald,
  cancelled: CHART_COLORS.rose,
}

export const FLEET_STATUS_COLORS: Record<string, string> = {
  idle: CHART_COLORS.zinc,
  assigned: CHART_COLORS.cyan,
  inflight: CHART_COLORS.violet,
  maintenance: CHART_COLORS.amber,
  unknown: '#52525b',
}

export const CHART_PALETTE = [
  CHART_COLORS.violet,
  CHART_COLORS.cyan,
  CHART_COLORS.emerald,
  CHART_COLORS.amber,
  CHART_COLORS.indigo,
  CHART_COLORS.rose,
]

export const CHART_AXIS = {
  stroke: '#71717a',
  tick: { fill: '#a1a1aa', fontSize: 12 },
}

export const CHART_GRID = {
  stroke: '#3f3f46',
  strokeDasharray: '3 3',
}

export const CHART_CURSOR = {
  fill: 'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(255, 255, 255, 0.06)',
  strokeWidth: 1,
}

export const CHART_AREA_CURSOR = {
  stroke: 'rgba(255, 255, 255, 0.12)',
  strokeWidth: 1,
  strokeDasharray: '4 4',
}

export const CHART_TOOLTIP = {
  contentStyle: {
    backgroundColor: '#18181b',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.5rem',
    color: '#f4f4f5',
    boxShadow: 'none',
  },
  labelStyle: { color: '#a1a1aa' },
  itemStyle: { color: '#e4e4e7' },
  cursor: CHART_CURSOR,
}
