import { useOrders, useRestaurants } from '@drones/shared/integrations/orval/queries'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'
import { shortId } from '@drones/shared/api/format'

export function OwnerOrdersPage() {
  const { data: restaurants } = useRestaurants()
  const restaurantId = restaurants?.[0]?.id
  const { data: orders, isLoading } = useOrders()
  const restaurantOrders = (orders ?? []).filter(
    (o) => !restaurantId || o.restaurantId === restaurantId,
  )

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading orders…</p>
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        Incoming orders for your restaurant.
      </p>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {restaurantOrders.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  No orders yet.
                </td>
              </tr>
            ) : (
              restaurantOrders.map((order) => (
                <tr key={order.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-mono text-zinc-200">
                    {shortId(order.id)}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge value={order.status ?? 'Unknown'} />
                  </td>
                  <td className="px-4 py-3 text-amber-200">
                    ${order.totalAmount?.toFixed(2) ?? '0.00'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
