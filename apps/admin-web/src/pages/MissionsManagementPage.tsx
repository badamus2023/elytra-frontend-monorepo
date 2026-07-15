import { useMemo, useState, type FormEvent } from "react";
import {
  useCreateDispatch,
  useSimulateDispatch,
  useUpdateDispatchStatus,
} from '@drones/shared/integrations/orval/mutations'
import {
  useAvailableDrones,
  useDispatchForOrder,
  useDrones,
  useOrder,
} from '@drones/shared/integrations/orval/queries'
import { DeliveryMap } from '@drones/shared/components/DeliveryMap'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'

const DISPATCH_STATUSES = ["Assigned", "InFlight", "Delivered", "Failed"] as const;

export function MissionsManagementPage() {
  const { data: assignable } = useAvailableDrones();
  const { data: allDrones } = useDrones();

  const [orderIdInput, setOrderIdInput] = useState("");
  const [activeOrderId, setActiveOrderId] = useState("");
  const [pickedDroneId, setPickedDroneId] = useState("");

  const orderQuery = useOrder(activeOrderId);
  const dispatchQuery = useDispatchForOrder(activeOrderId);

  const createDispatch = useCreateDispatch();
  const updateStatus = useUpdateDispatchStatus();
  const simulate = useSimulateDispatch();

  const order = orderQuery.data;
  const dispatch = dispatchQuery.data ?? null;

  const loadOrder = () => {
    setPickedDroneId("");
    setActiveOrderId(orderIdInput.trim());
  };

  const pickedDrone = useMemo(() => {
    if (!pickedDroneId) return null;
    return (
      (assignable ?? []).find((d) => d.id === pickedDroneId) ??
      (allDrones ?? []).find((d) => d.id === pickedDroneId) ??
      null
    );
  }, [pickedDroneId, assignable, allDrones]);

  const markers = useMemo(() => {
    if (!order) return [];

    const deliveryMarker = {
      id: "delivery",
      label: `Package drop-off: ${order.deliveryAddress ?? "Drop-off"}`,
      latitude: order.deliveryLatitude ?? 0,
      longitude: order.deliveryLongitude ?? 0,
    };

    if (dispatch) {
      return [
        deliveryMarker,
        {
          id: "drone",
          label: `Drone (${dispatch.status ?? "unknown"})`,
          latitude: dispatch.droneLatitude ?? 0,
          longitude: dispatch.droneLongitude ?? 0,
        },
      ];
    }

    if (pickedDrone) {
      return [
        deliveryMarker,
        {
          id: `picked-${pickedDrone.id ?? "preview"}`,
          label: `Selected drone: ${pickedDrone.name ?? "Drone"}`,
          latitude: pickedDrone.currentLatitude ?? 0,
          longitude: pickedDrone.currentLongitude ?? 0,
        },
      ];
    }

    return [deliveryMarker];
  }, [order, dispatch, pickedDrone]);

  const segments = useMemo(() => {
    if (!order) return [];

    if (dispatch) {
      return [
        {
          id: "route",
          from: {
            latitude: dispatch.droneLatitude ?? 0,
            longitude: dispatch.droneLongitude ?? 0,
          },
          to: {
            latitude: order.deliveryLatitude ?? 0,
            longitude: order.deliveryLongitude ?? 0,
          },
          color: "#a78bfa",
        },
      ];
    }

    if (pickedDrone) {
      return [
        {
          id: "preview-route",
          from: {
            latitude: pickedDrone.currentLatitude ?? 0,
            longitude: pickedDrone.currentLongitude ?? 0,
          },
          to: {
            latitude: order.deliveryLatitude ?? 0,
            longitude: order.deliveryLongitude ?? 0,
          },
          color: "#f59e0b",
        },
      ];
    }

    return [];
  }, [order, dispatch, pickedDrone]);

  const onCreateDispatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const droneRaw = String(fd.get("droneId") ?? "").trim();
    await createDispatch.mutateAsync({
      orderId: activeOrderId,
      droneId: droneRaw.length ? droneRaw : null,
    });
    setPickedDroneId("");
    await Promise.all([dispatchQuery.refetch(), orderQuery.refetch()]);
  };

  const onPatchStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!dispatch) return;
    const fd = new FormData(event.currentTarget);
    const status = String(fd.get("status") ?? "");
    if (!dispatch.id) return;
    await updateStatus.mutateAsync({
      dispatchId: dispatch.id,
      status,
    });
    await Promise.all([dispatchQuery.refetch(), orderQuery.refetch()]);
  };

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">
          Dispatch control
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Load an order, pick a drone to preview package + drone pins and route,
          then create dispatch. Orange = preview; violet = active dispatch.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="Order UUID"
            className="flex-1 rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
          />
          <button
            type="button"
            onClick={loadOrder}
            className="rounded-md border border-cyan-300/40 bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-100"
          >
            Load
          </button>
        </div>
        {orderQuery.isError ? (
          <p className="mt-2 text-xs text-red-300">Order not found or inaccessible.</p>
        ) : null}
      </div>

      {order ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <h3 className="text-sm font-semibold text-zinc-100">Order</h3>
            <p className="mt-2 text-xs text-zinc-500">{order.id ?? "—"}</p>
            <p className="mt-1 text-sm text-zinc-300">{order.deliveryAddress}</p>
            <div className="mt-2">
              <StatusBadge value={order.status} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <h3 className="text-sm font-semibold text-zinc-100">Dispatch</h3>
            {dispatch ? (
              <>
                <p className="mt-2 text-xs text-zinc-500">{dispatch.id}</p>
                <div className="mt-2">
                  <StatusBadge value={dispatch.status} />
                </div>
                <p className="mt-2 text-xs text-zinc-400">
                  Drone: {dispatch.droneId}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">No dispatch yet.</p>
            )}
          </div>
        </div>
      ) : null}

      {order ? (
        <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
          <h3 className="text-sm font-semibold text-zinc-100">Map</h3>
          <div className="mt-3">
            <DeliveryMap
              markers={markers}
              segments={segments}
              height="360px"
            />
          </div>
        </div>
      ) : null}

      {order && !dispatch ? (
        <form
          onSubmit={onCreateDispatch}
          className="rounded-xl border border-white/10 bg-zinc-900/70 p-4"
        >
          <h3 className="text-sm font-semibold text-zinc-100">
            Create dispatch
          </h3>
          <label className="mt-3 block text-xs text-zinc-400">
            Drone (optional — leave empty if API auto-assigns)
            <select
              name="droneId"
              value={pickedDroneId}
              onChange={(e) => setPickedDroneId(e.target.value)}
              className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">—</option>
              {(assignable ?? [])
                .filter((d) => d.id)
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name ?? "Drone"} · {d.status ?? "unknown"}
                  </option>
                ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={createDispatch.isPending}
            className="mt-3 rounded-md border border-violet-300/40 bg-violet-500/20 px-4 py-2 text-xs font-semibold text-violet-100 disabled:opacity-50"
          >
            {createDispatch.isPending ? "Creating…" : "Create dispatch"}
          </button>
        </form>
      ) : null}

      {dispatch ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <form
            onSubmit={onPatchStatus}
            className="rounded-xl border border-white/10 bg-zinc-900/70 p-4"
          >
            <h3 className="text-sm font-semibold text-zinc-100">
              Update status
            </h3>
            <select
              name="status"
              key={`${dispatch.status ?? ""}-${dispatch.updatedAt ?? ""}`}
              defaultValue={dispatch.status ?? undefined}
              className="mt-3 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              {DISPATCH_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={updateStatus.isPending}
                className="rounded-md border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-zinc-100 disabled:opacity-50"
              >
                {updateStatus.isPending ? "Saving…" : "Patch status"}
              </button>
              <button
                type="button"
                onClick={async () => {
                  await Promise.all([
                    dispatchQuery.refetch(),
                    orderQuery.refetch(),
                  ])
                }}
                className="rounded-md border border-zinc-500/40 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-white/5"
              >
                Refresh
              </button>
            </div>
          </form>
          <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
            <h3 className="text-sm font-semibold text-zinc-100">Simulation</h3>
            <p className="mt-2 text-xs text-zinc-400">
              Runs server-side flight simulation for this dispatch.
            </p>
            <button
              type="button"
              disabled={simulate.isPending}
              onClick={async () => {
                if (!dispatch.id) return;
                await simulate.mutateAsync(dispatch.id);
                await Promise.all([
                  dispatchQuery.refetch(),
                  orderQuery.refetch(),
                ]);
              }}
              className="mt-3 rounded-md border border-amber-300/40 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-100 disabled:opacity-50"
            >
              {simulate.isPending ? "Starting…" : "Simulate flight"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
