import { useRestaurants, useReviewsByRestaurant } from '@drones/shared/integrations/orval/queries'

export function OwnerReviewsPage() {
  const { data: restaurants } = useRestaurants()
  const restaurantId = restaurants?.[0]?.id ?? ''
  const { data: reviews, isLoading } = useReviewsByRestaurant(restaurantId)

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading reviews…</p>
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        Customer feedback for {restaurants?.[0]?.name ?? 'your restaurant'}.
      </p>
      <ul className="space-y-3">
        {(reviews ?? []).length === 0 ? (
          <li className="text-sm text-zinc-500">No reviews yet.</li>
        ) : (
          (reviews ?? []).map((review) => (
            <li
              key={review.id}
              className="rounded-xl border border-white/10 bg-zinc-900/50 p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-zinc-100">
                  {review.rating != null ? `${review.rating} / 5` : 'Rating'}
                </p>
                <p className="text-xs text-zinc-500">{review.createdAt ?? ''}</p>
              </div>
              <p className="mt-2 text-sm text-zinc-300">{review.comment}</p>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
