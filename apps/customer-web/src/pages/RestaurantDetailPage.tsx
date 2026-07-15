import { useMemo, useState, type FormEvent } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, Loader2, MapPin, Minus, Plus, ShoppingBag, Star, Trash2 } from 'lucide-react'
import { formatCoords } from '@drones/shared/api/format'
import { useCreateReview, useDeleteReview } from '@drones/shared/integrations/orval/mutations'
import {
  useCategoriesByRestaurant,
  useProductsByRestaurant,
  useRestaurant,
  useReviewsByRestaurant,
} from '@drones/shared/integrations/orval/queries'
import { getSessionUser } from '@drones/shared/auth/session'
import { isCustomerAuthenticated } from '../auth/workspace'
import { useCart } from '../cart/CartContext'
import { PortalCard } from './ui/PortalCard'

export function RestaurantDetailPage() {
  const { restaurantId } = useParams({ strict: false }) as { restaurantId: string }
  const isAuthenticated = isCustomerAuthenticated()
  const sessionUser = getSessionUser()
  const restaurantQuery = useRestaurant(restaurantId)
  const categoriesQuery = useCategoriesByRestaurant(restaurantId)
  const productsQuery = useProductsByRestaurant(restaurantId)
  const reviewsQuery = useReviewsByRestaurant(restaurantId)
  const createReview = useCreateReview()
  const deleteReview = useDeleteReview()
  const cart = useCart()

  const [reviewError, setReviewError] = useState('')
  const [deleteError, setDeleteError] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const restaurant = restaurantQuery.data
  const categories = categoriesQuery.data ?? []
  const products = (productsQuery.data ?? []).filter((p) => p.isAvailable !== false)
  const reviews = reviewsQuery.data ?? []
  const ownReview = useMemo(
    () => reviews.find((review) => review.userId === sessionUser?.id),
    [reviews, sessionUser?.id],
  )

  const productsByCategory = categories.map((category) => ({
    category,
    items: products.filter((p) => p.categoryId === category.id),
  }))

  const uncategorized = products.filter(
    (p) => !categories.some((c) => c.id === p.categoryId),
  )

  const cartForRestaurant =
    cart.restaurantId === restaurantId ? cart.lines : []

  const onAddToCart = (productId: string, name: string, price: number) => {
    cart.setRestaurant(restaurantId, restaurant?.name ?? 'Restaurant')
    cart.addItem({ productId, name, price })
  }

  const renderProductActions = (productId: string, name: string, price: number) => {
    const line = cartForRestaurant.find((item) => item.productId === productId)
    if (!isAuthenticated) {
      return (
        <Link
          to="/login"
          search={{ next: `/restaurants/${restaurantId}` }}
          className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
        >
          Sign in
        </Link>
      )
    }
    if (!line) {
      return (
        <button
          type="button"
          onClick={() => onAddToCart(productId, name, price)}
          className="inline-flex items-center gap-1 rounded-md bg-sky-600 px-2 py-1 text-xs font-semibold text-white hover:bg-sky-700"
        >
          <Plus size={12} /> Add
        </button>
      )
    }
    return (
      <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => cart.updateQuantity(productId, line.quantity - 1)}
          className="px-2 py-1 text-slate-600 hover:bg-slate-50"
          aria-label="Decrease quantity"
        >
          <Minus size={12} />
        </button>
        <span className="min-w-[1.5rem] text-center text-xs font-semibold text-slate-900">
          {line.quantity}
        </span>
        <button
          type="button"
          onClick={() => cart.updateQuantity(productId, line.quantity + 1)}
          className="px-2 py-1 text-slate-600 hover:bg-slate-50"
          aria-label="Increase quantity"
        >
          <Plus size={12} />
        </button>
      </div>
    )
  }

  const onSubmitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setReviewError('')

    const formData = new FormData(form)
    const rating = Number(formData.get('rating') ?? 0)
    const comment = String(formData.get('comment') ?? '').trim()

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      setReviewError('Rating must be between 1 and 5.')
      return
    }

    try {
      await createReview.mutateAsync({
        restaurantId,
        rating,
        comment: comment || null,
      })
      form.reset()
      await reviewsQuery.refetch()
      await restaurantQuery.refetch()
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : 'Could not submit your review.',
      )
    }
  }

  const onDeleteReview = async () => {
    if (!ownReview?.id) return

    setDeleteError('')
    try {
      await deleteReview.mutateAsync(ownReview.id)
      setShowDeleteConfirm(false)
      await reviewsQuery.refetch()
      await restaurantQuery.refetch()
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : 'Could not delete your review.',
      )
    }
  }

  if (restaurantQuery.isLoading) {
    return <p className="text-sm text-slate-500">Loading restaurant…</p>
  }

  if (!restaurant) {
    return (
      <PortalCard title="Restaurant not found">
        <Link to="/restaurants" className="text-sm font-semibold text-sky-700 hover:underline">
          Back to restaurants
        </Link>
      </PortalCard>
    )
  }

  return (
    <div className="space-y-6">
      <Link
        to="/restaurants"
        className="inline-flex items-center gap-1 text-sm font-medium text-sky-700 hover:underline"
      >
        <ArrowLeft size={14} /> All restaurants
      </Link>

      <PortalCard
        title={restaurant.name ?? 'Restaurant'}
        description={restaurant.description ?? undefined}
        action={
          isAuthenticated ? null : (
            <Link
              to="/login"
              search={{ next: `/restaurants/${restaurantId}` }}
              className="rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700"
            >
              Sign in to order
            </Link>
          )
        }
      >
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin size={14} />
            {restaurant.address ?? formatCoords(restaurant.latitude, restaurant.longitude)}
          </span>
          {restaurant.averageRating != null ? (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              {restaurant.averageRating.toFixed(1)} · {restaurant.reviewCount ?? 0} reviews
            </span>
          ) : null}
          <span>{restaurant.isOpen === false ? 'Currently closed' : 'Open for orders'}</span>
        </div>
      </PortalCard>

      <PortalCard title="Menu" description="Products available for drone delivery.">
        {productsQuery.isLoading ? (
          <p className="text-sm text-slate-500">Loading menu…</p>
        ) : products.length === 0 ? (
          <p className="text-sm text-slate-500">No products listed yet.</p>
        ) : (
          <div className="space-y-6">
            {productsByCategory.map(({ category, items }) =>
              items.length > 0 ? (
                <section key={category.id ?? category.name}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                    {category.name ?? 'Category'}
                  </h3>
                  <ul className="mt-2 divide-y divide-slate-100">
                    {items.map((product, index) => (
                      <li
                        key={product.id ?? `product-${index}`}
                        className="flex items-start justify-between gap-3 py-3"
                      >
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name ?? 'Unnamed product'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {product.description ?? 'No description'}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {Number(product.price ?? 0).toFixed(2)}
                          </p>
                          {product.id
                            ? renderProductActions(
                                product.id,
                                product.name ?? 'Unnamed product',
                                Number(product.price ?? 0),
                              )
                            : null}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null,
            )}
            {uncategorized.length > 0 ? (
              <section>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Other items
                </h3>
                <ul className="mt-2 divide-y divide-slate-100">
                  {uncategorized.map((product, index) => (
                    <li
                      key={product.id ?? `other-${index}`}
                      className="flex items-start justify-between gap-3 py-3"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {product.name ?? 'Unnamed product'}
                        </p>
                      </div>
                      <div className="flex shrink-0 flex-col items-end gap-2">
                        <p className="text-sm font-semibold text-slate-800">
                          {Number(product.price ?? 0).toFixed(2)}
                        </p>
                        {product.id
                          ? renderProductActions(
                              product.id,
                              product.name ?? 'Unnamed product',
                              Number(product.price ?? 0),
                            )
                          : null}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        )}
      </PortalCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <PortalCard title="Customer reviews">
          {reviewsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-slate-500">No reviews yet. Be the first!</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((review, index) => (
                <li
                  key={review.id ?? `review-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">
                      {review.userId === sessionUser?.id ? (
                        <span>
                          You{' '}
                          <span className="text-xs font-normal text-sky-700">(your review)</span>
                        </span>
                      ) : (
                        review.userEmail ?? 'Customer'
                      )}
                    </p>
                    <p className="text-xs font-semibold text-amber-700">
                      {review.rating ?? 0}/5
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    {review.comment ?? 'No comment'}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </PortalCard>

        <PortalCard title={ownReview ? 'Your review' : 'Leave a review'}>
          {!isAuthenticated ? (
            <p className="text-sm text-slate-600">
              <Link
                to="/login"
                search={{ next: `/restaurants/${restaurantId}` }}
                className="font-semibold text-sky-700 hover:underline"
              >
                Sign in
              </Link>{' '}
              to leave a review.
            </p>
          ) : ownReview ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-slate-900">Your rating</p>
                  <p className="text-xs font-semibold text-amber-700">
                    {ownReview.rating ?? 0}/5
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {ownReview.comment ?? 'No comment'}
                </p>
              </div>
              <p className="text-sm text-slate-500">
                You have already reviewed this restaurant. Delete your review if you want to
                submit a new one.
              </p>
              {deleteError ? (
                <p className="rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
                  {deleteError}
                </p>
              ) : null}
              {showDeleteConfirm ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={deleteReview.isPending}
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={onDeleteReview}
                    disabled={deleteReview.isPending}
                    className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-60"
                  >
                    {deleteReview.isPending ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Deleting…
                      </>
                    ) : (
                      'Confirm delete'
                    )}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 rounded-md border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 hover:bg-rose-100"
                >
                  <Trash2 size={14} />
                  Delete review
                </button>
              )}
            </div>
          ) : (
          <form onSubmit={onSubmitReview} className="space-y-3">
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Rating</span>
              <select
                name="rating"
                defaultValue="5"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} stars
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              <span className="font-medium text-slate-700">Comment</span>
              <textarea
                name="comment"
                rows={4}
                placeholder="How was your order?"
                className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm"
              />
            </label>
            {reviewError ? (
              <p className="rounded-md border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700">
                {reviewError}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={createReview.isPending}
              className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {createReview.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Submitting…
                </>
              ) : (
                'Submit review'
              )}
            </button>
          </form>
          )}
        </PortalCard>
      </div>

      {isAuthenticated && cart.restaurantId === restaurantId && cart.itemCount > 0 ? (
        <div className="sticky bottom-4 z-10 mx-auto max-w-lg rounded-2xl border border-sky-200 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <ShoppingBag size={16} className="text-sky-600" />
              <span>
                {cart.itemCount} item(s) · {cart.subtotal.toFixed(2)}
              </span>
            </div>
            <Link
              to="/checkout"
              search={{ restaurantId }}
              className="rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700"
            >
              Review order
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
