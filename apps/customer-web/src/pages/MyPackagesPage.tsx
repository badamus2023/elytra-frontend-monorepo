import { useMemo, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { shortId } from '@drones/shared/api/format'
import { useOrders, useRestaurants } from '@drones/shared/integrations/orval/queries'
import { useCart } from '../cart/CartContext'
import { PortalCard, PortalStatusPill } from './ui/PortalCard'

type Filter = 'all' | 'active' | 'done'

export function MyPackagesPage() {
  const navigate = useNavigate()
  const cart = useCart()
  const ordersQuery = useOrders()
  const restaurantsQuery = useRestaurants()
  const orders = useMemo(() => ordersQuery.data ?? [], [ordersQuery.data])
  const restaurantNames = useMemo(() => {
    const map = new Map<string, string>()
    for (const restaurant of restaurantsQuery.data ?? []) {
      if (restaurant.id) {
        map.set(restaurant.id, restaurant.name ?? 'Restaurant')
      }
    }
    return map
  }, [restaurantsQuery.data])

  const [filter, setFilter] = useState<Filter>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return orders
      .filter((order) => {
        const s = order.status?.toLowerCase() ?? ''
        if (filter === 'active')
          return ['pending', 'paid', 'dispatched', 'inflight'].includes(s)
        if (filter === 'done')
          return s === 'delivered' || s === 'cancelled'
        return true
      })
      .filter((order) => {
        if (!search) return true
        const t = search.toLowerCase()
        return (
          (order.id ?? '').toLowerCase().includes(t) ||
          (order.deliveryAddress ?? '').toLowerCase().includes(t)
        )
      })
  }, [orders, filter, search])

  const onReorder = (order: (typeof orders)[number]) => {
    if (!order.restaurantId || !order.items?.length) return
    const lines = order.items
      .filter((item) => item.productId)
      .map((item) => ({
        productId: item.productId!,
        name: item.productName ?? 'Item',
        price: Number(item.unitPrice ?? 0),
        quantity: item.quantity ?? 1,
      }))
    if (lines.length === 0) return
    cart.loadCart(
      order.restaurantId,
      restaurantNames.get(order.restaurantId) ?? 'Restaurant',
      lines,
    )
    void navigate({
      to: '/checkout',
      search: { restaurantId: order.restaurantId },
    })
  }

  return (
    <PortalCard
      title="My orders"
      description="Delivery orders for your signed-in account."
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-0.5 text-xs">
          {(['all', 'active', 'done'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setFilter(option)}
              className={`rounded px-3 py-1.5 font-medium capitalize transition ${
                filter === option
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search
            size={14}
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by id or address..."
            className="w-full rounded-md border border-slate-300 bg-white py-1.5 pl-8 pr-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 sm:w-72"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <th className="px-2 py-2">Order</th>
              <th className="px-2 py-2">Destination</th>
              <th className="px-2 py-2">Total</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2 py-8 text-center text-slate-500">
                  {orders.length === 0 ? (
                    <>
                      You have no orders yet.{' '}
                      <Link
                        to="/restaurants"
                        className="font-medium text-sky-700 hover:underline"
                      >
                        Browse restaurants
                      </Link>{' '}
                      to place your first order.
                    </>
                  ) : (
                    'No orders match your filter.'
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((order, index) => (
                <tr
                  key={order.id ?? `order-${index}`}
                  className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                >
                  <td className="px-2 py-3 font-mono text-xs text-slate-500">
                    {shortId(order.id)}
                  </td>
                  <td className="px-2 py-3 font-medium text-slate-900">
                    {order.deliveryAddress || '—'}
                  </td>
                  <td className="px-2 py-3 text-slate-700">
                    {Number(order.totalAmount ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 py-3">
                    <PortalStatusPill value={order.status} />
                  </td>
                  <td className="px-2 py-3 text-right">
                    <div className="flex flex-col items-end gap-1">
                      <Link
                        to="/track"
                        search={{ id: order.id ?? undefined }}
                        className="text-xs font-semibold text-sky-700 hover:underline"
                      >
                        Track
                      </Link>
                      {order.restaurantId && order.items?.some((item) => item.productId) ? (
                        <button
                          type="button"
                          onClick={() => onReorder(order)}
                          className="text-xs font-semibold text-slate-600 hover:underline"
                        >
                          Reorder
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </PortalCard>
  )
}
