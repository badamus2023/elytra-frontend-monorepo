import { useMemo } from 'react'
import {
  useDrones,
  useOrders,
  useRestaurants,
} from '../integrations/orval/queries'
import {
  buildOperationalNotifications,
  type OperationalApp,
} from './buildNotifications'
import type { AppNotification } from '../layouts/AppShell'

const POLL_INTERVAL_MS = 45_000

type QueryPollOptions = {
  refetchInterval?: number
  enabled?: boolean
}

export function useOperationalNotifications(
  app: OperationalApp,
  options?: { enabled?: boolean },
): {
  notifications: AppNotification[]
  isLoading: boolean
} {
  const enabled = options?.enabled ?? true
  const poll: QueryPollOptions = {
    refetchInterval: enabled ? POLL_INTERVAL_MS : undefined,
    enabled,
  }

  const ordersQuery = useOrders(poll)
  const dronesQuery = useDrones({
    ...poll,
    enabled: enabled && app === 'admin',
  })
  const restaurantsQuery = useRestaurants({
    ...poll,
    enabled: enabled && app === 'restaurant',
  })

  const restaurantId =
    app === 'restaurant' ? restaurantsQuery.data?.[0]?.id : undefined

  const notifications = useMemo(
    () =>
      buildOperationalNotifications(
        app,
        ordersQuery.data ?? [],
        dronesQuery.data ?? [],
        restaurantId,
      ),
    [app, ordersQuery.data, dronesQuery.data, restaurantId],
  )

  const isLoading =
    enabled &&
    (ordersQuery.isLoading ||
      (app === 'admin' && dronesQuery.isLoading) ||
      (app === 'restaurant' && restaurantsQuery.isLoading))

  return { notifications, isLoading }
}
