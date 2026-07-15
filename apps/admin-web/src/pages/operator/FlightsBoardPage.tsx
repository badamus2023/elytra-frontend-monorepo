import { useMemo } from 'react'
import { shortId } from '@drones/shared/api/format'
import { useDrones, useOrders, useRestaurantNameMap } from '@drones/shared/integrations/orval/queries'
import { DeliveryMap } from '@drones/shared/components/DeliveryMap'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'

export function FlightsBoardPage() {
  const dronesQuery = useDrones()
  const ordersQuery = useOrders()
  const orders = ordersQuery.data ?? []
  const restaurantNames = useRestaurantNameMap()

  const markers = useMemo(() => {
    const drones = dronesQuery.data ?? []
    return drones
      .filter((d) => d.id && (d.currentLatitude || d.currentLongitude))
      .map((d) => ({
        id: d.id!,
        label: `${d.name ?? 'Drone'} (${d.status ?? 'unknown'})`,
        latitude: d.currentLatitude ?? 0,
        longitude: d.currentLongitude ?? 0,
      }))
  }, [dronesQuery.data])

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Live map</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Drone positions from <span className="text-zinc-200">GET /api/drones</span>
          .
        </p>
        <div className="mt-4">
          <DeliveryMap markers={markers} height="360px" />
        </div>
      </div>
      <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Orders board</h2>
        <div className="mt-4 space-y-2">
          {orders.map((order, index) => (
            <article
              key={order.id ?? `order-${index}`}
              className="grid items-center gap-3 rounded-md border border-white/10 p-3 md:grid-cols-[1fr_1fr_auto]"
            >
              <div>
                <p className="font-medium text-zinc-100">
                  {order.restaurantId
                    ? (restaurantNames.get(order.restaurantId) ?? shortId(order.restaurantId))
                    : (order.deliveryAddress || shortId(order.id))}
                </p>
                <p className="text-xs text-zinc-400">
                  {order.deliveryAddress ?? order.id ?? '—'}
                  {order.items?.length
                    ? ` · ${order.items.length} item(s)`
                    : ''}
                </p>
              </div>
              <p className="text-sm text-zinc-300">
                {Number(order.totalAmount ?? 0).toFixed(2)} pln
              </p>
              <StatusBadge value={order.status} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
