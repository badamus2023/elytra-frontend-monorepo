import { useMemo, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { MapPin, Search, Star, UtensilsCrossed } from 'lucide-react'
import { formatCoords } from '@drones/shared/api/format'
import { useRestaurants } from '@drones/shared/integrations/orval/queries'
import { PortalCard } from './ui/PortalCard'

export function RestaurantsPage() {
  const restaurantsQuery = useRestaurants()
  const [search, setSearch] = useState('')
  const restaurants = useMemo(() => {
    const list = restaurantsQuery.data ?? []
    const term = search.trim().toLowerCase()
    if (!term) return list
    return list.filter(
      (restaurant) =>
        (restaurant.name ?? '').toLowerCase().includes(term) ||
        (restaurant.description ?? '').toLowerCase().includes(term) ||
        (restaurant.address ?? '').toLowerCase().includes(term),
    )
  }, [restaurantsQuery.data, search])

  return (
    <PortalCard
      title="Restaurants"
      description="Browse partner kitchens and order for drone delivery."
    >
      <div className="relative mb-4">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search restaurants..."
          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </div>
      {restaurantsQuery.isLoading ? (
        <p className="text-sm text-slate-500">Loading restaurants…</p>
      ) : restaurants.length === 0 ? (
        <p className="text-sm text-slate-500">
          {search.trim()
            ? 'No restaurants match your search.'
            : 'No restaurants are available yet. Check back soon.'}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {restaurants.map((restaurant, index) => (
            <article
              key={restaurant.id ?? `restaurant-${index}`}
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-sky-200 hover:bg-white"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                    <UtensilsCrossed size={16} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {restaurant.name ?? 'Unnamed restaurant'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {restaurant.isOpen === false ? 'Closed' : 'Open now'}
                    </p>
                  </div>
                </div>
                {restaurant.averageRating != null ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    {restaurant.averageRating.toFixed(1)}
                  </span>
                ) : null}
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-slate-600">
                {restaurant.description ?? restaurant.address ?? 'No description yet.'}
              </p>

              <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={12} />
                {restaurant.address ?? formatCoords(restaurant.latitude, restaurant.longitude)}
              </div>

              {restaurant.id ? (
                <Link
                  to="/restaurants/$restaurantId"
                  params={{ restaurantId: restaurant.id }}
                  className="mt-4 inline-flex rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700"
                >
                  View menu & reviews
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </PortalCard>
  )
}
