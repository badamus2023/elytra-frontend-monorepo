import { useEffect, type ReactNode } from 'react'
import * as signalR from '@microsoft/signalr'
import { useQueryClient } from '@tanstack/react-query'
import { getAccessToken } from '../auth/session'
import { useToast, type ToastSeverity } from './ToastProvider'

export type NotificationMessage = {
  id: string
  category: string
  severity: ToastSeverity
  presentation: 'toast' | 'confirmReceipt'
  title: string
  message: string
  occurredAt: string
  orderId?: string | null
  status?: string | null
}

export function RealtimeNotifications({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const token = getAccessToken()

  useEffect(() => {
    const hubUrl = import.meta.env.VITE_NOTIFICATION_HUB_URL
    if (!token || !hubUrl) return

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => getAccessToken() ?? '' })
      .withAutomaticReconnect()
      .build()

    connection.on('NotificationReceived', (notification: NotificationMessage) => {
      showToast({
        title: notification.title,
        message: notification.message,
        severity: notification.severity ?? 'info',
      })
      void queryClient.invalidateQueries({ queryKey: ['orders'] })
      if (notification.orderId) {
        void queryClient.invalidateQueries({
          queryKey: ['order', notification.orderId],
        })
        void queryClient.invalidateQueries({ queryKey: ['dispatch'] })
      }
    })

    void connection.start().catch(() => {
      // Automatic reconnect handles transient startup failures after a connection succeeds.
    })

    return () => {
      void connection.stop()
    }
  }, [queryClient, showToast, token])

  return children
}
