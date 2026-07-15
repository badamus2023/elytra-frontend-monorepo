import { useOrders, useRestaurants } from '@drones/shared/integrations/orval/queries'
import { KpiCard } from '@drones/shared/ui/KpiCard'

export function OwnerDashboardPage() {
  const { data: restaurants } = useRestaurants()
  const restaurantId = restaurants?.[0]?.id
  const { data: orders } = useOrders()
  const restaurantOrders = (orders ?? []).filter(
    (o) => !restaurantId || o.restaurantId === restaurantId,
  )
  const pending = restaurantOrders.filter((o) => o.status === 'Pending').length

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        Overview for {restaurants?.[0]?.name ?? 'your restaurant'}.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total orders" value={String(restaurantOrders.length)} />
        <KpiCard label="Pending" value={String(pending)} />
        <KpiCard
          label="Revenue (est.)"
          value={`$${restaurantOrders.reduce((sum, o) => sum + (o.totalAmount ?? 0), 0).toFixed(2)}`}
        />
      </div>
    </div>
  )
}
