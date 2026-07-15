import { Link } from '@tanstack/react-router'
import { formatCoords } from '@drones/shared/api/format'
import { useDrones } from '@drones/shared/integrations/orval/queries'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'

export function DronesListPage() {
  const { data, isLoading } = useDrones()
  const drones = data ?? []

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">Fleet</h2>
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading drones…</p>
      ) : (
        <div className="space-y-2">
          {drones.map((drone, index) => (
            <article
              key={drone.id ?? `drone-${index}`}
              className="grid items-center gap-3 rounded-md border border-white/10 p-3 md:grid-cols-[1fr_1fr_auto_auto]"
            >
              <p className="font-medium text-zinc-100">{drone.name ?? '—'}</p>
              <p className="text-sm text-zinc-400">
                {formatCoords(drone.currentLatitude, drone.currentLongitude)}
              </p>
              <StatusBadge value={drone.status} />
              {drone.id ? (
                <Link
                  to="/operations/drones/$droneId"
                  params={{ droneId: drone.id }}
                  className="rounded-md border border-white/15 px-3 py-1.5 text-xs text-zinc-200 hover:bg-white/10"
                >
                  View details
                </Link>
              ) : (
                <span className="text-xs text-zinc-500">—</span>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
