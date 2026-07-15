import type { DroneResponse } from '@drones/shared/api/model/droneResponse'
import type { OrderResponse } from '@drones/shared/api/model/orderResponse'
import type { RestaurantResponse } from '@drones/shared/api/model/restaurantResponse'
import { CHART_PALETTE, FLEET_STATUS_COLORS, ORDER_STATUS_COLORS } from './chartColors'

function normalizeStatus(status?: string | null) {
  return (status ?? 'unknown').toLowerCase().replace(/\s+/g, '')
}

function formatShortDate(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
}

function formatStatusLabel(status: string) {
  if (status === 'unknown') return 'Unknown'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function buildOrderStatusData(orders: OrderResponse[]) {
  const counts = new Map<string, number>()

  for (const order of orders) {
    const status = normalizeStatus(order.status)
    counts.set(status, (counts.get(status) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([status, value]) => ({
      status,
      label: formatStatusLabel(status),
      value,
      fill: ORDER_STATUS_COLORS[status] ?? CHART_PALETTE[0],
    }))
    .sort((a, b) => b.value - a.value)
}

export function buildOrdersTrendData(orders: OrderResponse[], days = 7) {
  const buckets = new Map<string, { count: number; revenue: number }>()
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    buckets.set(key, { count: 0, revenue: 0 })
  }

  for (const order of orders) {
    if (!order.createdAt) continue
    const key = order.createdAt.slice(0, 10)
    const bucket = buckets.get(key)
    if (!bucket) continue
    bucket.count += 1
    bucket.revenue += order.totalAmount ?? 0
  }

  return Array.from(buckets.entries()).map(([date, { count, revenue }]) => ({
    date,
    label: formatShortDate(date),
    orders: count,
    revenue: Math.round(revenue * 100) / 100,
  }))
}

export function buildFleetStatusData(drones: DroneResponse[]) {
  const counts = new Map<string, number>()

  for (const drone of drones) {
    const status = normalizeStatus(drone.status)
    counts.set(status, (counts.get(status) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([status, value]) => ({
      status,
      label: formatStatusLabel(status),
      value,
      fill: FLEET_STATUS_COLORS[status] ?? FLEET_STATUS_COLORS.unknown,
    }))
    .sort((a, b) => b.value - a.value)
}

export function buildTopRestaurantsData(
  orders: OrderResponse[],
  restaurants: RestaurantResponse[],
  limit = 5,
) {
  const counts = new Map<string, number>()
  const names = new Map(
    restaurants.filter((r) => r.id).map((r) => [r.id!, r.name ?? 'Unnamed']),
  )

  for (const order of orders) {
    if (!order.restaurantId) continue
    counts.set(order.restaurantId, (counts.get(order.restaurantId) ?? 0) + 1)
  }

  return Array.from(counts.entries())
    .map(([restaurantId, ordersCount]) => ({
      restaurantId,
      name: names.get(restaurantId) ?? 'Unknown restaurant',
      orders: ordersCount,
    }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, limit)
}

export function buildBatteryData(drones: DroneResponse[]) {
  return drones
    .map((drone) => ({
      name: drone.name ?? 'Drone',
      battery: drone.batteryLevel ?? 0,
    }))
    .sort((a, b) => b.battery - a.battery)
}
