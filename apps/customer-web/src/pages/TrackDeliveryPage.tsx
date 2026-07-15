import { useMemo, useState } from 'react'
import { useSearch } from '@tanstack/react-router'
import { MapPin, Package as PackageIcon, Plane, Search } from 'lucide-react'
import { formatCoords, shortId } from '@drones/shared/api/format'
import {
  useCancelOrder,
  useSimulateDispatch,
} from '@drones/shared/integrations/orval/mutations'
import { useDispatchForOrder, useOrder } from '@drones/shared/integrations/orval/queries'
import { DeliveryMap } from '@drones/shared/components/DeliveryMap'
import { PortalCard, PortalStatusPill } from './ui/PortalCard'

export function TrackDeliveryPage() {
  const search = useSearch({ strict: false }) as { id?: string }
  const [query, setQuery] = useState(search.id ?? '')
  const trimmed = query.trim()

  const orderQuery = useOrder(trimmed)
  const dispatchQuery = useDispatchForOrder(trimmed)
  const cancelOrder = useCancelOrder()
  const simulateDispatch = useSimulateDispatch()

  const order = orderQuery.data
  const dispatch = dispatchQuery.data

  const mapMarkers = useMemo(() => {
    if (!order) return []
    const markers = [
      {
        id: 'delivery',
        label: `Delivery: ${order.deliveryAddress ?? 'Drop-off'}`,
        latitude: order.deliveryLatitude ?? 0,
        longitude: order.deliveryLongitude ?? 0,
      },
    ]
    if (dispatch) {
      markers.push({
        id: 'drone',
        label: `Drone (${dispatch.status ?? 'unknown'})`,
        latitude: dispatch.droneLatitude ?? 0,
        longitude: dispatch.droneLongitude ?? 0,
      })
    }
    return markers
  }, [order, dispatch])

  const mapSegments = useMemo(() => {
    if (!order || !dispatch) return []
    return [
      {
        id: 'to-customer',
        from: {
          latitude: dispatch.droneLatitude ?? 0,
          longitude: dispatch.droneLongitude ?? 0,
        },
        to: {
          latitude: order.deliveryLatitude ?? 0,
          longitude: order.deliveryLongitude ?? 0,
        },
        color: '#6366f1',
      },
    ]
  }, [order, dispatch])

  const status = (dispatch?.status ?? order?.status ?? 'Pending').toLowerCase()
  const stages = [
    { key: 'received', label: 'Order received' },
    { key: 'preparing', label: 'Preparing' },
    { key: 'delivery', label: 'Out for delivery' },
    { key: 'delivered', label: 'Delivered' },
  ]
  const activeIndex = (() => {
    if (status === 'delivered') return 3
    if (
      status.includes('flight') ||
      status.includes('dispatch') ||
      status.includes('assigned') ||
      status.includes('inflight')
    )
      return 2
    if (status === 'paid' || status.includes('prepare')) return 1
    return 0
  })()

  return (
    <div className="space-y-6">
      <PortalCard
        title="Track an order"
        description="Enter your order id (UUID) from the orders list."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. f47ac10b-58cc-4372-a567-0e02b2c3d479"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </div>
          <button
            type="button"
            className="rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700"
            onClick={() => setQuery((value) => value.trim())}
          >
            Load order
          </button>
        </div>
      </PortalCard>

      {trimmed && orderQuery.isError ? (
        <PortalCard>
          <p className="text-sm text-slate-600">
            We could not load order{' '}
            <span className="font-mono">{trimmed}</span>. Check that you are
            signed in as the owning user.
          </p>
        </PortalCard>
      ) : null}

      {order ? (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <PortalCard
            title={order.deliveryAddress || `Order ${shortId(order.id)}`}
            description={`Order id: ${order.id ?? '—'}`}
            action={<PortalStatusPill value={dispatch?.status ?? order.status} />}
          >
            <DeliveryMap
              markers={mapMarkers}
              segments={mapSegments}
              height="320px"
            />
            <ol className="relative mt-6 space-y-6 border-l-2 border-slate-200 pl-6">
              {stages.map((stage, index) => {
                const isDone = index <= activeIndex
                const isCurrent = index === activeIndex
                return (
                  <li key={stage.key} className="relative">
                    <span
                      className={`absolute -left-[33px] flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isDone
                          ? 'bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? 'text-sky-700' : 'text-slate-900'
                      }`}
                    >
                      {stage.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {isCurrent
                        ? 'Current stage'
                        : isDone
                          ? 'Completed'
                          : 'Upcoming'}
                    </p>
                  </li>
                )
              })}
            </ol>
          </PortalCard>

          <div className="space-y-4">
            <PortalCard>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                  <PackageIcon size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Items
                  </p>
                  <ul className="mt-1 text-sm text-slate-800">
                    {order.items?.map((item, index) => (
                      <li key={item.id ?? `item-${index}`}>
                        {item.productName ?? 'Item'} × {item.quantity ?? 0} @{' '}
                        {Number(item.unitPrice ?? 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-slate-500">
                    Total: {Number(order.totalAmount ?? 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </PortalCard>

            <PortalCard>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                  <Plane size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Dispatch
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {dispatch
                      ? `Drone ${shortId(dispatch.droneId)}`
                      : 'No dispatch yet'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {dispatch
                      ? `Last update ${dispatch.updatedAt ?? dispatch.createdAt}`
                      : 'Assign a drone from the admin console.'}
                  </p>
                </div>
              </div>
              {dispatch &&
              order.status?.toLowerCase() !== 'cancelled' &&
              order.status?.toLowerCase() !== 'delivered' ? (
                <button
                  type="button"
                  disabled={simulateDispatch.isPending}
                  onClick={async () => {
                    try {
                      if (!dispatch.id) return
                      await simulateDispatch.mutateAsync(dispatch.id)
                      await Promise.all([
                        orderQuery.refetch(),
                        dispatchQuery.refetch(),
                      ])
                    } catch {
                      return
                    }
                  }}
                  className="mt-4 w-full rounded-md border border-amber-200 bg-amber-50 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
                >
                  {simulateDispatch.isPending
                    ? 'Starting simulation…'
                    : 'Simulate flight (demo)'}
                </button>
              ) : null}
            </PortalCard>

            <PortalCard>
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Destination
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {order.deliveryAddress}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatCoords(order.deliveryLatitude, order.deliveryLongitude)}
                  </p>
                </div>
              </div>
            </PortalCard>

            {order.status?.toLowerCase() !== 'cancelled' &&
            order.status?.toLowerCase() !== 'delivered' ? (
              <button
                type="button"
                disabled={cancelOrder.isPending}
                onClick={async () => {
                  if (!confirm('Cancel this order?')) return
                  try {
                    if (!order.id) return
                    await cancelOrder.mutateAsync(order.id)
                    await Promise.all([
                      orderQuery.refetch(),
                      dispatchQuery.refetch(),
                    ])
                  } catch {
                    return
                  }
                }}
                className="w-full rounded-md border border-rose-200 bg-rose-50 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50"
              >
                {cancelOrder.isPending ? 'Cancelling…' : 'Cancel order'}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  )
}
