import { Link } from '@tanstack/react-router'
import { ArrowRight, MapPin, Star, UtensilsCrossed } from 'lucide-react'
import { formatCoords } from '@drones/shared/api/format'
import { useRestaurants } from '@drones/shared/integrations/orval/queries'
import { PortalCard } from './ui/PortalCard'

const FEATURED_COUNT = 6

export function GuestHomePage() {
  const restaurantsQuery = useRestaurants()
  const restaurants = (restaurantsQuery.data ?? []).slice(0, FEATURED_COUNT)

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-600 p-6 text-white shadow-md sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
          Drone delivery
        </p>
        <h1 className="mt-2 text-2xl font-semibold sm:text-4xl">
          Order by drone from local restaurants
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
          Browse partner kitchens, preview menus, and sign in when you are ready to place an
          order and track your delivery in real time.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/restaurants"
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
          >
            Browse restaurants
            <UtensilsCrossed size={14} />
          </Link>
          <Link
            to="/login"
            search={{ next: '/restaurants' }}
            className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
          >
            Sign in to order
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      <PortalCard
        title="Featured restaurants"
        description="A preview of kitchens available for drone delivery."
        action={
          <Link
            to="/restaurants"
            className="text-sm font-semibold text-sky-700 hover:underline"
          >
            View all
          </Link>
        }
      >
        {restaurantsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading restaurants…</p>
        ) : restaurants.length === 0 ? (
          <p className="text-sm text-slate-500">
            No restaurants are available yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant, index) => (
              <article
                key={restaurant.id ?? `featured-${index}`}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-white"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">
                    {restaurant.name ?? 'Unnamed restaurant'}
                  </h3>
                  {restaurant.averageRating != null ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                      <Star size={12} className="fill-amber-400 text-amber-400" />
                      {restaurant.averageRating.toFixed(1)}
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {restaurant.description ?? restaurant.address ?? 'No description yet.'}
                </p>
                <div className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} />
                  {restaurant.address ?? formatCoords(restaurant.latitude, restaurant.longitude)}
                </div>
                {restaurant.id ? (
                  <Link
                    to="/restaurants/$restaurantId"
                    params={{ restaurantId: restaurant.id }}
                    className="mt-3 inline-flex text-xs font-semibold text-sky-700 hover:underline"
                  >
                    View menu
                  </Link>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </PortalCard>
    </div>
  )
}
