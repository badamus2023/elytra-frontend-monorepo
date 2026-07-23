export interface DroneRoutePointResponse {
  latitude?: number
  longitude?: number
  batteryLevel?: number
  recordedAt?: string
}

export interface DroneFlightHistoryResponse {
  dispatchId?: string
  orderId?: string
  droneId?: string
  status?: string
  deliveryAddress?: string
  createdAt?: string
  estimatedDeliveryAt?: string | null
  deliveredAt?: string | null
  routePoints?: DroneRoutePointResponse[]
}
