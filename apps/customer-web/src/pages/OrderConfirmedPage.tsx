import { useEffect, useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { shortId } from '@drones/shared/api/format'
import { useConfirmPayment } from '@drones/shared/integrations/orval/mutations'
import { PortalCard } from './ui/PortalCard'

export function OrderConfirmedPage() {
  const search = useSearch({ strict: false }) as {
    orderId?: string
    session_id?: string
  }
  const orderId = search.orderId
  const sessionId = search.session_id
  const confirmPayment = useConfirmPayment()
  const [paymentMessage, setPaymentMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) return

    confirmPayment
      .mutateAsync(sessionId)
      .then((result) => {
        if (result.paymentStatus?.toLowerCase() === 'completed') {
          setPaymentMessage('Payment confirmed. Your order is now paid.')
        }
      })
      .catch((err: unknown) => {
        setPaymentMessage(
          err instanceof Error
            ? err.message
            : 'Payment confirmation is still processing.',
        )
      })
  }, [sessionId])

  const isConfirming = Boolean(sessionId) && confirmPayment.isPending

  return (
    <div className="mx-auto max-w-lg">
      <PortalCard
        title="Order placed!"
        description="Your order has been submitted to the restaurant."
      >
        <div className="flex items-start gap-3">
          {isConfirming ? (
            <Loader2 size={20} className="mt-0.5 shrink-0 animate-spin text-sky-600" />
          ) : (
            <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-emerald-600" />
          )}
          <div className="space-y-2 text-sm text-slate-600">
            {orderId ? (
              <p>
                Order reference:{' '}
                <span className="font-mono font-medium text-slate-900">
                  {shortId(orderId)}
                </span>
              </p>
            ) : (
              <p>Check My orders for your latest delivery request.</p>
            )}
            {isConfirming ? (
              <p>Confirming your Stripe payment…</p>
            ) : paymentMessage ? (
              <p className="rounded-md border border-emerald-200 bg-emerald-50 p-2 text-emerald-800">
                {paymentMessage}
              </p>
            ) : sessionId ? null : (
              <p className="text-slate-500">
                Complete payment at checkout to mark the order as paid.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {orderId ? (
            <Link
              to="/track"
              search={{ id: orderId }}
              className="inline-flex rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700"
            >
              Track delivery
            </Link>
          ) : null}
          <Link
            to="/restaurants"
            className="inline-flex rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Browse restaurants
          </Link>
        </div>
      </PortalCard>
    </div>
  )
}
