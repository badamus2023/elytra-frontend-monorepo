import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import {
  useCategories,
  useDrones,
  useOrders,
  useProducts,
  useRestaurants,
} from '@drones/shared/integrations/orval/queries'
import { KpiCard } from '@drones/shared/ui/KpiCard'
import {
  FleetStatusChart,
  OrderStatusChart,
  OrdersTrendChart,
  TopRestaurantsChart,
} from './analytics/AnalyticsCharts'
import {
  buildFleetStatusData,
  buildOrderStatusData,
  buildOrdersTrendData,
  buildTopRestaurantsData,
} from './analytics/buildChartData'

export function AnalyticsDashboardPage() {
  const [isExporting, setIsExporting] = useState(false)
  const ordersQuery = useOrders()
  const dronesQuery = useDrones()
  const restaurantsQuery = useRestaurants()
  const categoriesQuery = useCategories()
  const productsQuery = useProducts()

  const orders = ordersQuery.data ?? []
  const drones = dronesQuery.data ?? []
  const restaurants = restaurantsQuery.data ?? []
  const categories = categoriesQuery.data ?? []
  const products = productsQuery.data ?? []

  const completedOrders = orders.filter(
    (o) => ['delivered', 'completed'].includes(o.status?.toLowerCase() ?? ''),
  ).length
  const inFlight = orders.filter((o) =>
    ['inflight', 'dispatched'].includes(o.status?.toLowerCase() ?? ''),
  ).length
  const openRestaurants = restaurants.filter((r) => r.isOpen !== false).length

  const orderStatusData = useMemo(() => buildOrderStatusData(orders), [orders])
  const ordersTrendData = useMemo(() => buildOrdersTrendData(orders), [orders])
  const fleetStatusData = useMemo(() => buildFleetStatusData(drones), [drones])
  const topRestaurantsData = useMemo(
    () => buildTopRestaurantsData(orders, restaurants),
    [orders, restaurants],
  )

  const isLoading =
    ordersQuery.isLoading ||
    dronesQuery.isLoading ||
    restaurantsQuery.isLoading

  async function handleDownloadPdf() {
    setIsExporting(true)
    try {
      const { exportAnalyticsPdf } = await import('./analytics/exportAnalyticsPdf')
      exportAnalyticsPdf({
        generatedAt: new Date(),
        kpis: {
          orders: orders.length,
          delivered: completedOrders,
          fleetSize: drones.length,
          inFlight,
          restaurants: restaurants.length,
          openRestaurants,
          categories: categories.length,
          products: products.length,
        },
        orderStatus: orderStatusData.map(({ label, value }) => ({ label, value })),
        ordersTrend: ordersTrendData.map(({ label, orders, revenue }) => ({
          label,
          orders,
          revenue,
        })),
        fleetStatus: fleetStatusData.map(({ label, value }) => ({ label, value })),
        topRestaurants: topRestaurantsData.map(({ name, orders }) => ({ name, orders })),
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Analytics</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Fleet, orders, and catalog metrics from live API data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isLoading || isExporting}
          className="inline-flex items-center gap-2 rounded-md border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-violet-100 disabled:opacity-50"
        >
          <Download size={14} />
          {isExporting ? 'Generating PDF…' : 'Download PDF'}
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KpiCard label="Orders" value={orders.length} />
        <KpiCard label="Delivered" value={completedOrders} />
        <KpiCard label="Fleet size" value={drones.length} hint={`${inFlight} in air`} />
        <KpiCard label="Restaurants" value={restaurants.length} hint={`${openRestaurants} open`} />
        <KpiCard label="Categories" value={categories.length} />
        <KpiCard label="Products" value={products.length} />
      </div>

      {isLoading ? (
        <article className="rounded-xl border border-white/10 bg-zinc-900/70 p-8 text-center text-sm text-zinc-400">
          Loading analytics…
        </article>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-2">
            <OrdersTrendChart data={ordersTrendData} />
            <OrderStatusChart data={orderStatusData} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            <FleetStatusChart data={fleetStatusData} />
            <TopRestaurantsChart data={topRestaurantsData} />
          </div>
        </>
      )}
    </section>
  )
}
