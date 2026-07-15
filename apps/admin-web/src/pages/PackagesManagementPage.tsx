import { shortId } from '@drones/shared/api/format'
import { useOrders } from '@drones/shared/integrations/orval/queries'
import { DataTable } from '@drones/shared/components/Table/DataTable'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'

export function PackagesManagementPage() {
  const { data, isLoading } = useOrders();
  const rows = data ?? [];

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Orders</h2>
      <p className="mt-2 text-sm text-zinc-400">
        The API lists orders for the signed-in account only. Sign in as a
        customer to manage deliveries, or use dispatch tools with a known order
        id.
      </p>
      {isLoading ? (
        <p className="mt-4 text-sm text-zinc-400">Loading orders…</p>
      ) : (
        <div className="mt-4">
          <DataTable
            data={rows}
            emptyLabel="No orders for this account."
            columns={[
              {
                key: "id",
                header: "Id",
                render: (o) => (
                  <span className="font-mono text-xs">{shortId(o.id)}</span>
                ),
              },
              {
                key: "address",
                header: "Destination",
                render: (o) => o.deliveryAddress ?? "—",
              },
              {
                key: "total",
                header: "Total",
                render: (o) => Number(o.totalAmount ?? 0).toFixed(2),
              },
              {
                key: "status",
                header: "Status",
                render: (o) => <StatusBadge value={o.status} />,
              },
            ]}
          />
        </div>
      )}
    </section>
  );
}
