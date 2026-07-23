import { useMemo, useState, type FormEvent } from 'react'
import { formatCoords, fromApiTimeSpan, toApiTimeSpan } from '@drones/shared/api/format'
import { useUpdateRestaurant } from '@drones/shared/integrations/orval/mutations'
import { useMyRestaurant as useRestaurants } from '@drones/shared/integrations/orval/queries'

export function OwnerRestaurantPage() {
  const { data: restaurants, isLoading } = useRestaurants()
  const restaurant = useMemo(() => restaurants?.[0] ?? null, [restaurants])
  const updateRestaurant = useUpdateRestaurant()
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!restaurant?.id) return
    setError('')
    setMessage('')
    const formData = new FormData(event.currentTarget)
    try {
      await updateRestaurant.mutateAsync({
        restaurantId: restaurant.id,
        body: {
          name: String(formData.get('name') ?? '').trim(),
          address: String(formData.get('address') ?? '').trim(),
          description: String(formData.get('description') ?? '').trim(),
          openTime: toApiTimeSpan(String(formData.get('openTime') ?? '')),
          closeTime: toApiTimeSpan(String(formData.get('closeTime') ?? '')),
        },
      })
      setMessage('Restaurant profile updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed.')
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading…</p>
  }

  if (!restaurant) {
    return (
      <p className="text-sm text-amber-200">
        No restaurant linked to this account yet.
      </p>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <p className="text-sm text-zinc-400">
        Location: {formatCoords(restaurant.latitude, restaurant.longitude)}
      </p>
      <form onSubmit={onSubmit} className="space-y-4 rounded-xl border border-white/10 bg-zinc-900/50 p-6">
        <label className="block text-sm text-zinc-300">
          Name
          <input
            name="name"
            defaultValue={restaurant.name ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Address
          <input
            name="address"
            defaultValue={restaurant.address ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Description
          <textarea
            name="description"
            defaultValue={restaurant.description ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            rows={3}
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">
            Latitude
            <input
              name="latitude"
              type="number"
              step="any"
              defaultValue={restaurant.latitude ?? 0}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Longitude
            <input
              name="longitude"
              type="number"
              step="any"
              defaultValue={restaurant.longitude ?? 0}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            />
          </label>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">
            Opens
            <input
              name="openTime"
              type="time"
              defaultValue={fromApiTimeSpan(restaurant.openTime)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Closes
            <input
              name="closeTime"
              type="time"
              defaultValue={fromApiTimeSpan(restaurant.closeTime)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            />
          </label>
        </div>
        {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-950"
        >
          Save changes
        </button>
      </form>
    </div>
  )
}
