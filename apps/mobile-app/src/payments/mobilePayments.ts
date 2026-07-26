import { customInstance } from '../api/axios-instance';
import type { PaymentStatusResponse } from '../api/model/paymentStatusResponse';

export type MobilePaymentIntentResponse = {
  orderId: string;
  paymentIntentId: string;
  clientSecret: string;
};

export const createMobilePaymentIntent = (orderId: string) =>
  customInstance<MobilePaymentIntentResponse>({
    url: `/api/payments/order/${orderId}/mobile-intent`,
    method: 'POST',
  });

export const confirmMobilePaymentIntent = (paymentIntentId: string) =>
  customInstance<PaymentStatusResponse>({
    url: '/api/payments/confirm-mobile-intent',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: { paymentIntentId },
  });
