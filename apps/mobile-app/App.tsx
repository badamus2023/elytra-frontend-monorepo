import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { enableScreens } from 'react-native-screens';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';
import { queryClient } from './src/api/queryClient';
import { AuthProvider } from './src/auth/AuthContext';
import { CartProvider } from './src/cart/CartContext';
import RootNavigator from './src/navigation/RootNavigator';
import { theme } from './src/theme';
import { ToastProvider } from './src/notifications/ToastProvider';
import { RealtimeNotifications } from './src/notifications/RealtimeNotifications';
import { CustomerReceiptGate } from './src/notifications/CustomerReceiptGate';
import { useAuth } from './src/auth/AuthContext';

enableScreens(true);

function AuthenticatedNotificationLayer() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return null;
  return (
    <>
      <RealtimeNotifications />
      <CustomerReceiptGate />
    </>
  );
}

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <RootNavigator />
                <AuthenticatedNotificationLayer />
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
