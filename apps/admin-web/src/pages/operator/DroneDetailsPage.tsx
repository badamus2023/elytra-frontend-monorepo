import { useParams } from "@tanstack/react-router";
import { formatCoords } from '@drones/shared/api/format'
import { useDrone } from '@drones/shared/integrations/orval/queries'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'
import { useEffect, useState } from 'react'
import { droneHub, type DroneTelemetry } from '@drones/shared/services/droneHub'

export function DroneDetailsPage() {
  const { droneId } = useParams({ strict: false }) as { droneId: string };
  const { data, isLoading } = useDrone(droneId);
  const [telemetry, setTelemetry] = useState<DroneTelemetry | null>(null);

  useEffect(() => {
    const start = async () => {
      try {
        await droneHub.connect();

        await droneHub.subscribeToDrone("1");

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
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
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
  );
}
