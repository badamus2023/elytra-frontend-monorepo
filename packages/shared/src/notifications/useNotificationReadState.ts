import { useCallback, useMemo, useState } from 'react'
import type { AppNotification } from '../layouts/AppShell'

export function useNotificationReadState(notifications: AppNotification[]) {
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set())

  const unreadCount = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)).length,
    [notifications, readIds],
  )

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev)
      for (const notification of notifications) {
        next.add(notification.id)
      }
      return next
    })
  }, [notifications])

  return { unreadCount, markAllAsRead }
}
