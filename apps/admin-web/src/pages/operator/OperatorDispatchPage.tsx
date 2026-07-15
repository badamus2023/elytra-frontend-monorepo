import { useMemo, useState, type FormEvent } from 'react'
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
  useOrders,
  useRestaurantNameMap,
} from '@drones/shared/integrations/orval/queries'
import { shortId } from '@drones/shared/api/format'
import { DeliveryMap } from '@drones/shared/components/DeliveryMap'
import { StatusBadge } from '@drones/shared/ui/StatusBadge'

const DISPATCH_STATUSES = [
  'Assigned',
  'InFlight',
  'Delivered',
  'Failed',
] as const

export function OperatorDispatchPage() {
  const { data: ordersData } = useOrders()
  const restaurantNames = useRestaurantNameMap()
  const orders = ordersData ?? []
  const { data: allDrones } = useDrones()
  const { data: assignable } = useAvailableDrones()

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [pickedDroneId, setPickedDroneId] = useState('')

  const orderQuery = useOrder(selectedOrderId ?? '')
  const dispatchQuery = useDispatchForOrder(selectedOrderId ?? '')

  const createDispatch = useCreateDispatch()
  const updateStatus = useUpdateDispatchStatus()
  const simulate = useSimulateDispatch()

  const order = orderQuery.data
  const dispatch = dispatchQuery.data ?? null

  const pickedDrone = useMemo(() => {
    if (!pickedDroneId) return null
    return (
      (assignable ?? []).find((d) => d.id === pickedDroneId) ??
      (allDrones ?? []).find((d) => d.id === pickedDroneId) ??
      null
    )
  }, [pickedDroneId, assignable, allDrones])

  const markers = useMemo(() => {
    if (!order) return []

    const deliveryMarker = {
      id: 'delivery',
      label: `Package drop-off: ${order.deliveryAddress ?? 'Drop-off'}`,
      latitude: order.deliveryLatitude ?? 0,
      longitude: order.deliveryLongitude ?? 0,
    }

    if (dispatch) {
      const list = (allDrones ?? [])
        .filter((d) => d.id)
        .map((d) => ({
          id: `drone-${d.id}`,
          label: `${d.name ?? 'Drone'} (${d.status ?? 'unknown'})`,
          latitude: d.currentLatitude ?? 0,
          longitude: d.currentLongitude ?? 0,
        }))
      list.push(deliveryMarker)
      return list
    }

    if (pickedDrone) {
      return [
        deliveryMarker,
        {
          id: `picked-${pickedDrone.id ?? 'preview'}`,
          label: `Selected drone: ${pickedDrone.name ?? 'Drone'}`,
          latitude: pickedDrone.currentLatitude ?? 0,
          longitude: pickedDrone.currentLongitude ?? 0,
        },
      ]
    }

    const list = (allDrones ?? [])
      .filter((d) => d.id)
      .map((d) => ({
        id: `drone-${d.id}`,
        label: `${d.name ?? 'Drone'} (${d.status ?? 'unknown'})`,
        latitude: d.currentLatitude ?? 0,
        longitude: d.currentLongitude ?? 0,
      }))
    list.push(deliveryMarker)
    return list
  }, [allDrones, order, dispatch, pickedDrone])

  const segments = useMemo(() => {
    if (!order) return []

    if (dispatch) {
      return [
        {
          id: 'route',
          from: {
            latitude: dispatch.droneLatitude ?? 0,
            longitude: dispatch.droneLongitude ?? 0,
          },
          to: {
            latitude: order.deliveryLatitude ?? 0,
            longitude: order.deliveryLongitude ?? 0,
          },
          color: '#22d3ee',
        },
      ]
    }

    if (pickedDrone) {
      return [
        {
          id: 'preview-route',
          from: {
            latitude: pickedDrone.currentLatitude ?? 0,
            longitude: pickedDrone.currentLongitude ?? 0,
          },
          to: {
            latitude: order.deliveryLatitude ?? 0,
            longitude: order.deliveryLongitude ?? 0,
          },
          color: '#f59e0b',
        },
      ]
    }

    return []
  }, [order, dispatch, pickedDrone])

  const onCreateDispatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedOrderId) return
    const fd = new FormData(event.currentTarget)
    const droneRaw = String(fd.get('droneId') ?? '').trim()
    await createDispatch.mutateAsync({
      orderId: selectedOrderId,
      droneId: droneRaw.length ? droneRaw : null,
    })
    setPickedDroneId('')
    await Promise.all([dispatchQuery.refetch(), orderQuery.refetch()])
  }

  const onPatchStatus = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!dispatch) return
    const fd = new FormData(event.currentTarget)
    const status = String(fd.get('status') ?? '')
    if (!dispatch.id) return
    await updateStatus.mutateAsync({
      dispatchId: dispatch.id,
      status,
    })
    await Promise.all([dispatchQuery.refetch(), orderQuery.refetch()])
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
      <div className="flex flex-col gap-4">
        <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">Your orders</h2>
          <p className="mt-1 text-xs text-zinc-400">
            Select an order to plan or monitor dispatch (same account as API).
          </p>
          <ul className="mt-3 max-h-64 space-y-1 overflow-y-auto text-sm">
            {orders.length === 0 ? (
              <li className="text-zinc-500">No orders.</li>
            ) : (
              orders.map((o, index) => (
                <li key={o.id ?? `order-${index}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setPickedDroneId('')
                      setSelectedOrderId(o.id ?? null)
                    }}
                    className={`w-full rounded-md border px-2 py-2 text-left transition ${
                      selectedOrderId === o.id
                        ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-50'
                        : 'border-white/10 bg-zinc-950/50 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <span className="block truncate font-medium">
                      {orderLabel(o, restaurantNames)}
                    </span>
                    <span className="mt-1 inline-block text-xs">
                      <StatusBadge value={o.status} />
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </section>

        {order ? (
          <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4 text-sm">
            <h3 className="font-semibold text-zinc-100">Selected order</h3>
            <p className="mt-2 text-xs text-zinc-500 break-all">{order.id ?? '—'}</p>
            {order.restaurantId ? (
              <p className="mt-1 text-zinc-300">
                Restaurant:{' '}
                {restaurantNames.get(order.restaurantId) ?? shortId(order.restaurantId)}
              </p>
            ) : null}
            <p className="mt-1 text-zinc-300">{order.deliveryAddress ?? '—'}</p>
            {order.items && order.items.length > 0 ? (
              <ul className="mt-2 space-y-1 text-xs text-zinc-400">
                {order.items.map((item, index) => (
                  <li key={item.id ?? `item-${index}`}>
                    {item.productName ?? 'Item'} × {item.quantity ?? 0} @{' '}
                    {Number(item.unitPrice ?? 0).toFixed(2)}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="mt-2 text-xs text-zinc-500">
              Total: {Number(order.totalAmount ?? 0).toFixed(2)}
            </p>
            <div className="mt-2">
              <StatusBadge value={order.status} />
            </div>
            {dispatch ? (
              <>
                <p className="mt-3 text-xs text-zinc-500">Dispatch</p>
                <p className="font-mono text-xs text-zinc-400">{dispatch.id}</p>
                <div className="mt-1">
                  <StatusBadge value={dispatch.status} />
                </div>
              </>
            ) : (
              <p className="mt-3 text-zinc-400">No dispatch yet.</p>
            )}
          </section>
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
              Drone (optional)
              <select
                name="droneId"
                value={pickedDroneId}
                onChange={(e) => setPickedDroneId(e.target.value)}
                className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-2 py-2 text-sm text-zinc-100"
              >
                <option value="">Available only</option>
                {(assignable ?? [])
                  .filter((d) => d.id)
                  .map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name ?? 'Drone'} · {d.status ?? 'unknown'}
                    </option>
                  ))}
              </select>
            </label>
            <p className="mt-2 text-[11px] text-zinc-500">
              Pick a drone to preview the package pin, drone pin, and route on
              the map.
            </p>
            <button
              type="submit"
              disabled={createDispatch.isPending}
              className="mt-3 w-full rounded-md border border-cyan-300/40 bg-cyan-500/20 py-2 text-xs font-semibold text-cyan-100 disabled:opacity-50"
            >
              {createDispatch.isPending ? 'Creating…' : 'Assign drone'}
            </button>
          </form>
        ) : null}

        {dispatch ? (
          <div className="space-y-3">
            <form
              onSubmit={onPatchStatus}
              className="rounded-xl border border-white/10 bg-zinc-900/70 p-4"
            >
              <h3 className="text-sm font-semibold text-zinc-100">Status</h3>
              <select
                name="status"
                defaultValue={dispatch.status ?? undefined}
                className="mt-2 w-full rounded-md border border-white/15 bg-zinc-950 px-2 py-2 text-sm"
              >
                {DISPATCH_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={updateStatus.isPending}
                className="mt-2 w-full rounded-md border border-white/20 bg-white/10 py-2 text-xs font-semibold disabled:opacity-50"
              >
                {updateStatus.isPending ? 'Saving…' : 'Update'}
              </button>
            </form>
            <button
              type="button"
              disabled={simulate.isPending}
              onClick={async () => {
                if (!dispatch.id) return
                await simulate.mutateAsync(dispatch.id)
                await Promise.all([
                  dispatchQuery.refetch(),
                  orderQuery.refetch(),
                ])
              }}
              className="w-full rounded-md border border-amber-300/40 bg-amber-500/20 py-2 text-xs font-semibold text-amber-100 disabled:opacity-50"
            >
              {simulate.isPending ? 'Simulating…' : 'Simulate flight'}
            </button>
          </div>
        ) : null}
      </div>

      <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
        <h2 className="text-lg font-semibold text-zinc-100">Live map</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Choose a drone to see the package drop-off, that drone, and a preview
          route. After dispatch exists, the cyan line follows live dispatch
          telemetry; the full fleet is shown.
        </p>
        <div className="mt-4">
          <DeliveryMap
            height="420px"
            markers={markers}
            segments={segments}
          />
        </div>
      </section>
    </div>
  )
}

function orderLabel(
  order: { id?: string; restaurantId?: string; deliveryAddress?: string | null },
  restaurantNames: Map<string, string>,
) {
  if (order.restaurantId) {
    return restaurantNames.get(order.restaurantId) ?? shortId(order.restaurantId)
  }
  return order.deliveryAddress || shortId(order.id)
}
