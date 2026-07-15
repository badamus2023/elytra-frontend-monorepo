import { useEffect, useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { CreditCard, Loader2 } from 'lucide-react'
import {
  useCreateCheckoutSession,
  useCreateOrder,
} from '@drones/shared/integrations/orval/mutations'
import { useDeliveryPoints } from '@drones/shared/integrations/orval/queries'
import { formatCoords } from '@drones/shared/api/format'
import { useCart } from '../cart/CartContext'
import { PortalCard } from './ui/PortalCard'

export function CheckoutPage() {
  const search = useSearch({ strict: false }) as {
    restaurantId?: string
    payment?: string
  }
  const cart = useCart()
  const createOrder = useCreateOrder()
  const createCheckout = useCreateCheckoutSession()
  const { data: deliveryPoints, isLoading: pointsLoading } = useDeliveryPoints()

  const restaurantId = search.restaurantId ?? cart.restaurantId ?? ''
  const [deliveryPointId, setDeliveryPointId] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!deliveryPointId && deliveryPoints?.length) {
      const first = deliveryPoints.find((p) => p.id)
      if (first?.id) setDeliveryPointId(first.id)
    }
  }, [deliveryPoints, deliveryPointId])

  if (!restaurantId || cart.lines.length === 0) {
    return (
      <PortalCard title="Cart is empty">
        <Link
          to="/restaurants"
          className="text-sm font-semibold text-sky-700 hover:underline"
        >
          Browse restaurants
        </Link>
      </PortalCard>
    )
  }

  const isSubmitting = createOrder.isPending || createCheckout.isPending

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!deliveryPointId) {
      setError('Select a pickup point for your delivery.')
      return
    }

    try {
      const order = await createOrder.mutateAsync({
        restaurantId,
        deliveryPointId,
        ...(deliveryNotes.trim()
          ? { deliveryAddress: deliveryNotes.trim() }
          : {}),
        items: cart.lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      })

      if (!order?.id) {
        setError('Order was created but no order id was returned.')
        return
      }

      const checkout = await createCheckout.mutateAsync(order.id)
      if (!checkout.checkoutUrl) {
        setError('Could not start Stripe checkout.')
        return
      }

      cart.clearCart()
      window.location.href = checkout.checkoutUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place your order.')
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {search.payment === 'cancelled' ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          Payment was cancelled. Your order was saved as pending — you can try again
          from My orders after completing checkout.
        </p>
      ) : null}

      <PortalCard
        title="Checkout"
        description={`Order from ${cart.restaurantName ?? 'restaurant'}`}
      >
        <ul className="divide-y divide-slate-100 text-sm">
          {cart.lines.map((line) => (
            <li
              key={line.productId}
              className="flex items-center justify-between gap-3 py-3"
            >
              <span className="text-slate-700">
                {line.quantity}× {line.name}
              </span>
              <span className="font-semibold text-slate-900">
                {(line.price * line.quantity).toFixed(2)}
              </span>
            </li>
          ))}
          <li className="flex items-center justify-between gap-3 py-3 font-semibold text-slate-900">
            <span>Total</span>
            <span>{cart.subtotal.toFixed(2)} PLN</span>
          </li>
        </ul>
      </PortalCard>

      <PortalCard title="Delivery details">
        <form onSubmit={onSubmit} className="space-y-4">
          {pointsLoading ? (
            <p className="text-sm text-slate-500">Loading pickup points…</p>
          ) : (deliveryPoints ?? []).length === 0 ? (
            <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              No pickup points are available yet. Please try again later.
            </p>
          ) : (
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">
                Pickup point
              </legend>
              {(deliveryPoints ?? []).map((point) => {
                if (!point.id) return null
                const selected = deliveryPointId === point.id
                return (
                  <label
                    key={point.id}
                    className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition ${
                      selected
                        ? 'border-sky-400 bg-sky-50 ring-1 ring-sky-200'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryPoint"
                      value={point.id}
                      checked={selected}
                      onChange={() => setDeliveryPointId(point.id!)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-medium text-slate-900">
                        {point.name}
                      </span>
                      <span className="block text-slate-600">{point.address}</span>
                      <span className="mt-1 block font-mono text-xs text-slate-500">
                        {formatCoords(point.latitude, point.longitude)}
                      </span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
          )}
          <label className="block text-sm">
            <span className="font-medium text-slate-700">
              Delivery notes (optional)
            </span>
            <input
              value={deliveryNotes}
              onChange={(event) => setDeliveryNotes(event.target.value)}
              placeholder="Gate code, landmark, etc."
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <p className="text-xs text-slate-500">
            After placing the order you will be redirected to Stripe test checkout to
            pay securely.
          </p>
          {error ? (
            <p className="rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={
              isSubmitting ||
              pointsLoading ||
              (deliveryPoints ?? []).length === 0 ||
              !deliveryPointId
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Preparing payment…
              </>
            ) : (
              <>
                <CreditCard size={14} /> Pay with Stripe
              </>
            )}
          </button>
        </form>
      </PortalCard>
    </div>
  )
}
