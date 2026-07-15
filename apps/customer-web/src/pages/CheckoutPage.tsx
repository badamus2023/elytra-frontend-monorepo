import { useState } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { CreditCard, Loader2 } from 'lucide-react'
import {
  useCreateCheckoutSession,
  useCreateOrder,
} from '@drones/shared/integrations/orval/mutations'
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

  const restaurantId = search.restaurantId ?? cart.restaurantId ?? ''
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLatitude, setDeliveryLatitude] = useState('52.2297')
  const [deliveryLongitude, setDeliveryLongitude] = useState('21.0122')
  const [error, setError] = useState('')

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

    const lat = Number(deliveryLatitude)
    const lng = Number(deliveryLongitude)

    if (!deliveryAddress.trim()) {
      setError('Delivery address is required.')
      return
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Enter valid delivery coordinates.')
      return
    }

    try {
      const order = await createOrder.mutateAsync({
        restaurantId,
        deliveryAddress: deliveryAddress.trim(),
        deliveryLatitude: lat,
        deliveryLongitude: lng,
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
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Delivery address</span>
            <input
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              placeholder="Street, building, notes for the drone"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Latitude</span>
              <input
                value={deliveryLatitude}
                onChange={(event) => setDeliveryLatitude(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Longitude</span>
              <input
                value={deliveryLongitude}
                onChange={(event) => setDeliveryLongitude(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </label>
          </div>
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
            disabled={isSubmitting}
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
