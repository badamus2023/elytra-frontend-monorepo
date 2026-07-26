import type { ReactElement } from 'react';
import Config from 'react-native-config';
import { StripeProvider } from '@stripe/stripe-react-native';

type StripeAppProviderProps = {
  children: ReactElement;
};

export function StripeAppProvider({ children }: StripeAppProviderProps) {
  const publishableKey = Config.STRIPE_PUBLISHABLE_KEY?.trim();

  if (!publishableKey) {
    return children;
  }

  return (
    <StripeProvider publishableKey={publishableKey} urlScheme="drones">
      {children}
    </StripeProvider>
  );
}
