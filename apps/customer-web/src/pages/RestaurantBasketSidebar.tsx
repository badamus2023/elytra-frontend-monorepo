import { Link } from '@tanstack/react-router'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import type { CartLine } from '../cart/CartContext'

type RestaurantBasketSidebarProps = {
  restaurantId: string
  restaurantName: string
  lines: CartLine[]
  itemCount: number
  subtotal: number
  isAuthenticated: boolean
  onUpdateQuantity: (productId: string, quantity: number) => void
  className?: string
}

export function RestaurantBasketSidebar({
  restaurantId,
  restaurantName,
  lines,
  itemCount,
  subtotal,
  isAuthenticated,
  onUpdateQuantity,
  className = '',
}: RestaurantBasketSidebarProps) {
  return (
    <aside
      className={`sticky top-24 rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} className="text-orange-500" />
          <h2 className="text-base font-semibold text-slate-900">Your order</h2>
        </div>
        <p className="mt-1 truncate text-sm text-slate-500">{restaurantName}</p>
      </div>

      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto px-5 py-4">
        {!isAuthenticated ? (
          <p className="text-sm text-slate-600">
            <Link
              to="/login"
              search={{ next: `/restaurants/${restaurantId}` }}
              className="font-semibold text-sky-700 hover:underline"
            >
              Sign in
            </Link>{' '}
            to add items to your basket.
          </p>
        ) : lines.length === 0 ? (
          <p className="text-sm text-slate-500">
            Your basket is empty. Tap <span className="font-semibold">+</span> on
            menu items to add them.
          </p>
        ) : (
          <ul className="space-y-3">
            {lines.map((line) => (
              <li
                key={line.productId}
                className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {line.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(line.price * line.quantity).toFixed(2)} PLN
                  </p>
                </div>
                <div className="inline-flex shrink-0 items-center rounded-full border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity(line.productId, line.quantity - 1)
                    }
                    className="rounded-l-full px-2 py-1 text-slate-600 hover:bg-slate-100"
                    aria-label={`Remove one ${line.name}`}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-[1.25rem] text-center text-sm font-semibold text-slate-900">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateQuantity(line.productId, line.quantity + 1)
                    }
                    className="rounded-r-full px-2 py-1 text-slate-600 hover:bg-slate-100"
                    aria-label={`Add one ${line.name}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
          <span className="text-lg font-bold text-slate-900">
            {subtotal.toFixed(2)} PLN
          </span>
        </div>
        {isAuthenticated && lines.length > 0 ? (
          <Link
            to="/checkout"
            search={{ restaurantId }}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-rose-600"
          >
            Go to checkout
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-500"
          >
            Go to checkout
          </button>
        )}
      </div>
    </aside>
  )
}

type ProductAddButtonProps = {
  name: string
  quantity: number
  isAuthenticated: boolean
  restaurantId: string
  onAdd: () => void
  onUpdateQuantity: (quantity: number) => void
}

export function ProductAddButton({
  name,
  quantity,
  isAuthenticated,
  restaurantId,
  onAdd,
  onUpdateQuantity,
}: ProductAddButtonProps) {
  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        search={{ next: `/restaurants/${restaurantId}` }}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-300 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        title="Sign in to order"
      >
        +
      </Link>
    )
  }

  if (quantity === 0) {
    return (
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white shadow-sm hover:bg-orange-600"
        aria-label={`Add ${name} to basket`}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>
    )
  }

  return (
    <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 shadow-sm">
      <button
        type="button"
        onClick={() => onUpdateQuantity(quantity - 1)}
        className="rounded-l-full px-2.5 py-1.5 text-orange-700 hover:bg-orange-100"
        aria-label={`Remove one ${name}`}
      >
        <Minus size={16} />
      </button>
      <span className="min-w-[1.5rem] text-center text-sm font-bold text-orange-900">
        {quantity}
      </span>
      <button
        type="button"
        onClick={() => onUpdateQuantity(quantity + 1)}
        className="rounded-r-full px-2.5 py-1.5 text-orange-700 hover:bg-orange-100"
        aria-label={`Add one ${name}`}
      >
        <Plus size={16} />
      </button>
    </div>
  )
}

type MenuProduct = {
  id?: string
  name?: string | null
  description?: string | null
  price?: number | null
}

export function MenuProductRow({
  product,
  isAuthenticated,
  restaurantId,
  quantity,
  onAdd,
  onUpdateQuantity,
}: {
  product: MenuProduct
  isAuthenticated: boolean
  restaurantId: string
  quantity: number
  onAdd: () => void
  onUpdateQuantity: (quantity: number) => void
}) {
  const name = product.name ?? 'Unnamed product'
  const price = Number(product.price ?? 0)

  return (
    <li
      className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
        quantity > 0
          ? 'border-orange-200 border-solid bg-orange-50/40 shadow-sm'
          : 'border-dashed border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900">{name}</p>
        {product.description ? (
          <p className="mt-0.5 line-clamp-2 text-sm text-slate-500">
            {product.description}
          </p>
        ) : null}
        <p className="mt-1.5 text-sm font-semibold text-slate-800">
          {price.toFixed(2)} PLN
        </p>
      </div>
      {product.id ? (
        <ProductAddButton
          name={name}
          quantity={quantity}
          isAuthenticated={isAuthenticated}
          restaurantId={restaurantId}
          onAdd={onAdd}
          onUpdateQuantity={onUpdateQuantity}
        />
      ) : null}
    </li>
  )
}
