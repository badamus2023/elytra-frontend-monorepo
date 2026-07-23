import { useParams } from "@tanstack/react-router";
import { formatCoords } from '@drones/shared/api/format'
import { useDrone, useDroneFlightHistory } from '@drones/shared/integrations/orval/queries'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'
import { useEffect, useState } from 'react'
import { droneHub, type DroneTelemetry } from '@drones/shared/services/droneHub'

export function DroneDetailsPage() {
  const { droneId } = useParams({ strict: false }) as { droneId: string };
  const { data, isLoading } = useDrone(droneId);
  const [telemetry, setTelemetry] = useState<DroneTelemetry | null>(null);
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const fromIso = from ? new Date(`${from}T00:00:00`).toISOString() : undefined
  const toIso = to ? new Date(`${to}T23:59:59.999`).toISOString() : undefined
  const history = useDroneFlightHistory(droneId, fromIso, toIso)

  useEffect(() => {
    const start = async () => {
      try {
        await droneHub.connect();

        await droneHub.subscribeToDrone(droneId);

        droneHub.onLocationUpdated((data) => {
          setTelemetry(data);
        });
      } catch (err) {}
    };

    start();

    return () => {
      droneHub.unsubscribeFromDrone(droneId);
      droneHub.offLocationUpdated();
      droneHub.disconnect();
    };
  }, [droneId]);

  return (
    <div className="space-y-6"><section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <h2 className="mb-4 text-lg font-semibold text-zinc-100">
        Drone telemetry
      </h2>
      {isLoading ? (
        <p className="text-sm text-zinc-400">Loading telemetry…</p>
      ) : data ? (
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div className="rounded-md border border-white/10 p-3">
            <p className="text-zinc-500">Drone ID</p>
            <p className="font-medium text-zinc-100">{data.id}</p>
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <p className="text-zinc-500">Name</p>
            <p className="font-medium text-zinc-100">{data.name ?? "N/A"}</p>
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <p className="text-zinc-500">Status</p>
            <StatusBadge value={data.status} />
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <p className="text-zinc-500">Battery</p>
            <p className="font-medium text-zinc-100">
              {telemetry?.batteryLevel ?? data.batteryLevel ?? 0}%
            </p>
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <p className="text-zinc-500">Max payload</p>
            <p className="font-medium text-zinc-100">{data.maxPayloadKg} kg</p>
          </div>
          <div className="rounded-md border border-white/10 p-3">
            <p className="text-zinc-500">Position</p>
            <p className="font-medium text-zinc-100">
              {telemetry
                ? `${telemetry.latitude.toFixed(5)}, ${telemetry.longitude.toFixed(5)}`
                : formatCoords(data.currentLatitude, data.currentLongitude, 5)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm text-zinc-400">Drone not found.</p>
      )}
    </section>
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h2 className="text-lg font-semibold text-zinc-100">Flight history</h2><p className="text-sm text-zinc-400">Recorded routes are available for new flights only.</p></div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-zinc-400">From<input type="date" value={from} onChange={e => setFrom(e.target.value)} className="mt-1 block rounded border border-white/15 bg-zinc-950 p-2" /></label>
          <label className="text-xs text-zinc-400">To<input type="date" value={to} onChange={e => setTo(e.target.value)} className="mt-1 block rounded border border-white/15 bg-zinc-950 p-2" /></label>
          <button disabled={!data || history.isLoading} onClick={async () => { if (!data) return; const { exportDroneFlightHistoryPdf } = await import('./exportDroneFlightHistoryPdf'); exportDroneFlightHistoryPdf(data, history.data ?? [], from, to) }} className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Download PDF</button>
        </div>
      </div>
      <div className="mt-4 overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="text-zinc-400"><tr><th className="p-2">Created</th><th>Status</th><th>Destination</th><th>Route points</th></tr></thead><tbody>{(history.data ?? []).map(f => <tr key={f.dispatchId} className="border-t border-white/5"><td className="p-2">{f.createdAt ? new Date(f.createdAt).toLocaleString() : '—'}</td><td>{f.status}</td><td>{f.deliveryAddress}</td><td>{f.routePoints?.length ?? 0}</td></tr>)}</tbody></table></div>
    </section></div>
  );
}
