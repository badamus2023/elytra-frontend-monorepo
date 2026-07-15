import { useMemo } from "react";
import { useDrones } from '@drones/shared/integrations/orval/queries'
import {
  BatteryLevelsChart,
  FleetStatusChart,
} from './analytics/AnalyticsCharts'
import {
  buildBatteryData,
  buildFleetStatusData,
} from './analytics/buildChartData'
import { DeliveryMap } from '@drones/shared/components/DeliveryMap'
import { KpiCard } from '@drones/shared/ui/KpiCard'

export function FleetOverviewPage() {
  const { data, isLoading } = useDrones();
  const drones = data ?? [];
  const idle = drones.filter(
    (d) => d.status?.toLowerCase() === "idle",
  ).length;
  const inUse = drones.filter((d) =>
    ["assigned", "inflight"].includes(d.status?.toLowerCase() ?? ""),
  ).length;

  const fleetStatusData = useMemo(() => buildFleetStatusData(drones), [drones]);
  const batteryData = useMemo(() => buildBatteryData(drones), [drones]);

  const markers = drones
    .filter((d) => d.id)
    .map((d) => ({
      id: d.id!,
      label: `${d.name ?? "Drone"} (${d.status ?? "unknown"})`,
      latitude: d.currentLatitude ?? 0,
      longitude: d.currentLongitude ?? 0,
    }));

  return (
    <section className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <KpiCard label="Fleet size" value={drones.length} />
        <KpiCard label="Idle" value={idle} />
        <KpiCard label="Active / in flight" value={inUse} />
      </div>

      {isLoading ? (
        <article className="rounded-xl border border-white/10 bg-zinc-900/70 p-8 text-center text-sm text-zinc-400">
          Loading fleet data…
        </article>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          <FleetStatusChart data={fleetStatusData} />
          <BatteryLevelsChart data={batteryData} />
        </div>
      )}

      <article className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Fleet map</h2>
        <p className="mt-2 text-sm text-zinc-400">
          Live positions from <code className="text-zinc-300">GET /api/drones</code>.
        </p>
        <div className="mt-4">
          <DeliveryMap height="380px" markers={markers} />
        </div>
      </article>
    </section>
  );
}
