import { assertOk, withAuth } from './withAuth'

export type CheckoutSessionResponse = {
  orderId?: string
  sessionId?: string
  checkoutUrl?: string
}

export type PaymentStatusResponse = {
  orderId?: string
  orderStatus?: string | null
  paymentStatus?: string | null
  amount?: number
  currency?: string | null
}

export async function postApiPaymentsOrderOrderIdCheckout(orderId: string) {
  const res = await fetch(`/api/payments/order/${orderId}/checkout`, {
    method: 'POST',
    ...withAuth(),
  })
  const body = await res.text()
  const data = body ? (JSON.parse(body) as CheckoutSessionResponse) : {}
  assertOk(res.status, data, 'Failed to start payment')
  return { data, status: res.status, headers: res.headers }
}

export async function postApiPaymentsConfirm(sessionId: string) {
  const auth = withAuth()
  const res = await fetch('/api/payments/confirm', {
    method: 'POST',
    ...auth,
    headers: {
      'Content-Type': 'application/json',
      ...(auth.headers as Record<string, string>),
    },
    body: JSON.stringify({ sessionId }),
  })
  const body = await res.text()
  const data = body ? (JSON.parse(body) as PaymentStatusResponse) : {}
  assertOk(res.status, data, 'Failed to confirm payment')
  return { data, status: res.status, headers: res.headers }
}
