import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartCard } from '@drones/shared/ui/ChartCard'
import {
  CHART_AREA_CURSOR,
  CHART_AXIS,
  CHART_COLORS,
  CHART_GRID,
  CHART_TOOLTIP,
} from './chartColors'

type NamedValue = {
  label: string
  value: number
  fill: string
}

type TrendPoint = {
  label: string
  orders: number
  revenue: number
}

type RestaurantOrders = {
  name: string
  orders: number
}

type BatteryPoint = {
  name: string
  battery: number
}

function EmptyChart({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-white/10 bg-zinc-950/40 text-sm text-zinc-500">
      {message}
    </div>
  )
}

export function OrderStatusChart({ data }: { data: NamedValue[] }) {
  return (
    <ChartCard
      title="Orders by status"
      description="Current distribution across the order pipeline."
    >
      {data.length === 0 ? (
        <EmptyChart message="No orders yet." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={95}
              paddingAngle={2}
            >
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip {...CHART_TOOLTIP} cursor={false} />
            <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function OrdersTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartCard
      title="Orders & revenue (7 days)"
      description="Daily order volume and total revenue from order totals."
    >
      {data.every((point) => point.orders === 0 && point.revenue === 0) ? (
        <EmptyChart message="No orders in the last 7 days." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="label" {...CHART_AXIS} />
            <YAxis yAxisId="orders" allowDecimals={false} {...CHART_AXIS} />
            <YAxis
              yAxisId="revenue"
              orientation="right"
              {...CHART_AXIS}
              tickFormatter={(value: number) => `$${value}`}
            />
            <Tooltip
              {...CHART_TOOLTIP}
              cursor={CHART_AREA_CURSOR}
              formatter={(value, name) => {
                const numeric = typeof value === 'number' ? value : Number(value ?? 0)
                return name === 'Revenue'
                  ? [`$${numeric.toFixed(2)}`, name]
                  : [numeric, name]
              }}
            />
            <Legend wrapperStyle={{ color: '#a1a1aa', fontSize: 12 }} />
            <Area
              yAxisId="orders"
              type="monotone"
              dataKey="orders"
              name="Orders"
              stroke={CHART_COLORS.cyan}
              fill={CHART_COLORS.cyan}
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke={CHART_COLORS.violet}
              fill={CHART_COLORS.violet}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function FleetStatusChart({ data }: { data: NamedValue[] }) {
  return (
    <ChartCard
      title="Fleet status"
      description="How drones are distributed across operational states."
    >
      {data.length === 0 ? (
        <EmptyChart message="No drones registered." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis type="number" allowDecimals={false} {...CHART_AXIS} />
            <YAxis type="category" dataKey="label" width={90} {...CHART_AXIS} />
            <Tooltip {...CHART_TOOLTIP} />
            <Bar dataKey="value" name="Drones" radius={[0, 4, 4, 0]} activeBar={false}>
              {data.map((entry) => (
                <Cell key={entry.label} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function TopRestaurantsChart({ data }: { data: RestaurantOrders[] }) {
  return (
    <ChartCard
      title="Top restaurants by orders"
      description="Restaurants with the most orders in the system."
    >
      {data.length === 0 ? (
        <EmptyChart message="No restaurant orders yet." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 8, right: 16 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis dataKey="name" {...CHART_AXIS} interval={0} angle={-15} textAnchor="end" height={70} />
            <YAxis allowDecimals={false} {...CHART_AXIS} />
            <Tooltip {...CHART_TOOLTIP} />
            <Bar
              dataKey="orders"
              name="Orders"
              fill={CHART_COLORS.violet}
              radius={[4, 4, 0, 0]}
              activeBar={false}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

export function BatteryLevelsChart({ data }: { data: BatteryPoint[] }) {
  return (
    <ChartCard
      title="Battery levels"
      description="Current battery percentage per drone."
    >
      {data.length === 0 ? (
        <EmptyChart message="No drones to display." />
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid {...CHART_GRID} />
            <XAxis type="number" domain={[0, 100]} {...CHART_AXIS} />
            <YAxis type="category" dataKey="name" width={90} {...CHART_AXIS} />
            <Tooltip
              {...CHART_TOOLTIP}
              formatter={(value) => {
                const numeric = typeof value === 'number' ? value : Number(value ?? 0)
                return [`${numeric}%`, 'Battery']
              }}
            />
            <Bar dataKey="battery" name="Battery" radius={[0, 4, 4, 0]} activeBar={false}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={
                    entry.battery >= 60
                      ? CHART_COLORS.emerald
                      : entry.battery >= 30
                        ? CHART_COLORS.amber
                        : CHART_COLORS.rose
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}
