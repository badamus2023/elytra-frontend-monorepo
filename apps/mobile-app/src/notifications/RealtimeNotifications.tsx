import { useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { useQueryClient } from '@tanstack/react-query';
import Config from 'react-native-config';
import { useAuth } from '../auth/AuthContext';
import { getToken } from '../auth/storage/token';
import { getApiBaseUrl } from '../config/env';
import { useToast } from './ToastProvider';

type NotificationMessage = {
  severity?: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
  orderId?: string;
};

export function RealtimeNotifications() {
  const { isLoggedIn } = useAuth();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoggedIn) return;
    const url =
      Config.NOTIFICATION_HUB_URL ??
      `${getApiBaseUrl()}/hubs/notifications`;
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, { accessTokenFactory: async () => (await getToken()) ?? '' })
      .withAutomaticReconnect()
      .build();

    connection.on('NotificationReceived', (notification: NotificationMessage) => {
      showToast({
        title: notification.title,
        message: notification.message,
        severity: notification.severity ?? 'info',
      });
      void queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    });
    void connection.start().catch(() => undefined);
    return () => {
      void connection.stop();
    };
  }, [isLoggedIn, queryClient, showToast]);

  return null;
}
