import { formatCoords } from '@drones/shared/api/format'
import { shortId } from '@drones/shared/api/format'
import { useDrones, useOrders, useRestaurants } from '@drones/shared/integrations/orval/queries'
import { KpiCard } from '@drones/shared/ui/KpiCard'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'

export function OperatorDashboardPage() {
  const dronesQuery = useDrones();
  const ordersQuery = useOrders();
  const restaurantsQuery = useRestaurants();

  const drones = dronesQuery.data ?? [];
  const orders = ordersQuery.data ?? [];
  const restaurants = restaurantsQuery.data ?? [];
  const idle = drones.filter(
    (d) => d.status?.toLowerCase() === "idle",
  ).length;
  const inFlight = orders.filter((o) =>
    ["inflight", "dispatched"].includes(o.status?.toLowerCase() ?? ""),
  ).length;

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Fleet"
          value={drones.length}
          hint={`${idle} idle`}
        />
        <KpiCard
          label="Orders"
          value={orders.length}
          hint={`${inFlight} in progress`}
        />
        <KpiCard
          label="Restaurants"
          value={restaurants.length}
          hint="Active catalog partners"
        />
        <KpiCard
          label="Maintenance"
          value={drones.filter((d) => d.status === "Maintenance").length}
          hint="From telemetry"
        />
      </section>

      <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Recent orders
        </h2>
        <div className="mb-6 space-y-2">
          {orders.length === 0 ? (
            <p className="text-sm text-zinc-500">No orders on this account.</p>
          ) : (
            orders.slice(0, 5).map((order, index) => (
              <article
                key={order.id ?? `order-${index}`}
                className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-100">
                    {order.deliveryAddress || `Order ${shortId(order.id)}`}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {order.items?.length ?? 0} item(s) ·{" "}
                    {Number(order.totalAmount ?? 0).toFixed(2)}
                  </p>
                </div>
                <StatusBadge value={order.status} />
              </article>
            ))
          )}
        </div>
        <h2 className="mb-4 text-lg font-semibold text-zinc-100">
          Live drone status
        </h2>
        <div className="space-y-2">
          {drones.slice(0, 12).map((drone, index) => (
            <article
              key={drone.id ?? `drone-${index}`}
              className="flex items-center justify-between rounded-md border border-white/10 px-3 py-2"
            >
              <div>
                <p className="font-medium text-zinc-100">{drone.name ?? "—"}</p>
                <p className="text-xs text-zinc-400">
                  {formatCoords(drone.currentLatitude, drone.currentLongitude)} · battery{" "}
                  {drone.batteryLevel ?? 0}%
                </p>
              </div>
              <StatusBadge value={drone.status} />
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
