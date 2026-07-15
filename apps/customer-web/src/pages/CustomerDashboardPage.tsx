import { Link } from '@tanstack/react-router'
import { Box, Plane, Search, Star, Truck, UtensilsCrossed } from 'lucide-react'
import { shortId } from '@drones/shared/api/format'
import { useOrders, useRestaurants } from '@drones/shared/integrations/orval/queries'
import { getUserName } from '../auth/workspace'
import { PortalCard, PortalStatusPill } from './ui/PortalCard'
import { PortalKpi } from './ui/PortalKpi'

function orderInAir(status: string | null | undefined) {
  const s = status?.toLowerCase() ?? ''
  return s === 'inflight' || s === 'dispatched'
}

function orderDelivered(status: string | null | undefined) {
  return status?.toLowerCase() === 'delivered'
}

export function CustomerDashboardPage() {
  const userName = getUserName()
  const ordersQuery = useOrders()
  const restaurantsQuery = useRestaurants()
  const orders = ordersQuery.data ?? []
  const restaurants = restaurantsQuery.data ?? []

  const inTransit = orders.filter((o) => orderInAir(o.status)).length
  const delivered = orders.filter((o) => orderDelivered(o.status)).length

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 p-6 text-white shadow-md sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          Welcome back
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">
          Hello, {userName}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/80 sm:text-base">
          Browse restaurants, order by drone, track dispatches, and leave reviews.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            Browse restaurants
            <UtensilsCrossed size={14} />
          </Link>
          <Link
            to="/track"
            search={{ id: undefined }}
            className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            <Search size={14} /> Track order
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <PortalKpi
          label="Total orders"
          value={orders.length}
          hint="All time"
          icon={<Box size={20} />}
          tone="sky"
        />
        <PortalKpi
          label="In the air"
          value={inTransit}
          hint="Dispatched or flying"
          icon={<Plane size={20} />}
          tone="violet"
        />
        <PortalKpi
          label="Delivered"
          value={delivered}
          hint="Completed"
          icon={<Truck size={20} />}
          tone="emerald"
        />
        <PortalKpi
          label="Restaurants"
          value={restaurants.length}
          hint="Available to order from"
          icon={<UtensilsCrossed size={20} />}
          tone="amber"
        />
      </section>

      <PortalCard
        title="Featured restaurants"
        description="Order from partner kitchens near you."
        action={
          <Link
            to="/restaurants"
            className="text-xs font-semibold text-sky-700 hover:underline"
          >
            View all
          </Link>
        }
      >
        {restaurants.length === 0 ? (
          <p className="text-sm text-slate-500">No restaurants listed yet.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {restaurants.slice(0, 4).map((restaurant, index) => (
              <article
                key={restaurant.id ?? `restaurant-${index}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-slate-900">
                    {restaurant.name ?? 'Unnamed restaurant'}
                  </p>
                  {restaurant.averageRating != null ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {restaurant.averageRating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                  {restaurant.address ?? restaurant.description ?? 'No details'}
                </p>
                {restaurant.id ? (
                  <Link
                    to="/restaurants/$restaurantId"
                    params={{ restaurantId: restaurant.id }}
                    className="mt-2 inline-block text-xs font-semibold text-sky-700 hover:underline"
                  >
                    View menu
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <PortalCard
          className="lg:col-span-2"
          title="Recent orders"
          description="Latest delivery requests for your account."
          action={
            <Link
              to="/packages"
              className="text-xs font-semibold text-sky-700 hover:underline"
            >
              View all
            </Link>
          }
        >
          {orders.length === 0 ? (
            <p className="text-sm text-slate-500">
              You have no orders yet.{' '}
              <Link to="/restaurants" className="font-medium text-sky-700 hover:underline">
                Browse restaurants
              </Link>{' '}
              to place your first order.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order, index) => (
                <li
                  key={order.id ?? `order-${index}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {order.deliveryAddress || `Order ${shortId(order.id)}`}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.items?.length ?? 0} line item(s) ·{' '}
                      {Number(order.totalAmount ?? 0).toFixed(2)} total
                    </p>
                  </div>
                  <PortalStatusPill value={order.status} />
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard title="Need help?" description="We are here for you.">
          <ul className="space-y-3 text-sm">
            <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">Live chat</p>
              <p className="text-xs text-slate-500">
                Average response under 2 minutes.
              </p>
            </li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="font-medium text-slate-900">Phone</p>
              <p className="text-xs text-slate-500">+48 22 555 01 02</p>
            </li>
          </ul>
        </PortalCard>
      </div>
    </div>
  )
}
