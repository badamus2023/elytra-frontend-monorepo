import type { DroneResponse, OrderResponse } from '../api/model'
import { shortId } from '../api/format'
import type { AppNotification } from '../layouts/AppShell'

const ACTIVE_CUSTOMER_STATUSES = new Set(['Paid', 'Dispatched', 'InFlight'])
const RESTAURANT_INCOMING = new Set(['Paid', 'Pending'])
const HOURS_24_MS = 24 * 60 * 60 * 1000

export type OperationalApp = 'admin' | 'customer' | 'restaurant'

function orderStatus(status: string | null | undefined): string {
  return status ?? ''
}

export function buildAdminNotifications(
  orders: OrderResponse[],
  drones: DroneResponse[],
): AppNotification[] {
  const notifications: AppNotification[] = []

  const paidAwaitingDispatch = orders.filter(
    (order) => orderStatus(order.status) === 'Paid',
  )
  if (paidAwaitingDispatch.length > 0) {
    notifications.push({
      id: 'admin-paid-awaiting-dispatch',
      title: `${paidAwaitingDispatch.length} paid order(s) awaiting dispatch`,
      description: 'Assign drones from the dispatch console.',
      severity: paidAwaitingDispatch.length >= 3 ? 'critical' : 'warning',
    })
  }

  for (const order of orders.filter(
    (item) => orderStatus(item.status) === 'InFlight',
  )) {
    notifications.push({
      id: `admin-inflight-${order.id}`,
      title: `Order ${shortId(order.id)} in flight`,
      description: 'Monitor progress on the flights board.',
      severity: 'info',
    })
  }

  for (const drone of drones) {
    const battery = drone.batteryLevel ?? 100
    if (battery < 20) {
      notifications.push({
        id: `admin-low-battery-${drone.id}`,
        title: `${drone.name ?? 'Drone'} low battery`,
        description: `Battery at ${battery}% — schedule charging or swap.`,
        severity: battery < 10 ? 'critical' : 'warning',
      })
    }
  }

  return notifications
}

export function buildCustomerNotifications(
  orders: OrderResponse[],
): AppNotification[] {
  const notifications: AppNotification[] = []
  const now = Date.now()

  for (const order of orders) {
    const status = orderStatus(order.status)

    if (ACTIVE_CUSTOMER_STATUSES.has(status)) {
      const description =
        status === 'InFlight'
          ? 'Your drone delivery is on the way.'
          : status === 'Dispatched'
            ? 'Your order has been dispatched.'
            : 'Payment received — preparing your order.'

      notifications.push({
        id: `customer-active-${order.id}`,
        title: `Order ${shortId(order.id)} — ${status}`,
        description,
        severity: 'info',
      })
    }

    if (status === 'Delivered' && order.updatedAt) {
      const deliveredAt = new Date(order.updatedAt).getTime()
      if (!Number.isNaN(deliveredAt) && now - deliveredAt <= HOURS_24_MS) {
        notifications.push({
          id: `customer-delivered-${order.id}`,
          title: `Order ${shortId(order.id)} delivered`,
          description: 'Your delivery arrived in the last 24 hours.',
          severity: 'info',
        })
      }
    }
  }

  return notifications
}

export function buildRestaurantNotifications(
  orders: OrderResponse[],
  restaurantId?: string,
): AppNotification[] {
  const restaurantOrders = restaurantId
    ? orders.filter((order) => order.restaurantId === restaurantId)
    : orders

  return restaurantOrders
    .filter((order) => RESTAURANT_INCOMING.has(orderStatus(order.status)))
    .map((order) => {
      const status = orderStatus(order.status)
      return {
        id: `restaurant-order-${order.id}`,
        title: `New order ${shortId(order.id)}`,
        description:
          status === 'Paid'
            ? 'Paid and ready to prepare.'
            : 'Pending payment — may complete soon.',
        severity: status === 'Paid' ? ('warning' as const) : ('info' as const),
      }
    })
}

export function buildOperationalNotifications(
  app: OperationalApp,
  orders: OrderResponse[],
  drones: DroneResponse[],
  restaurantId?: string,
): AppNotification[] {
  switch (app) {
    case 'admin':
      return buildAdminNotifications(orders, drones)
    case 'customer':
      return buildCustomerNotifications(orders)
    case 'restaurant':
      return buildRestaurantNotifications(orders, restaurantId)
  }
}
