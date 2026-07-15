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

enableScreens(true);

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <CartProvider>
              <RootNavigator />
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
