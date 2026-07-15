import { useMemo, useState } from "react";
import { shortId } from '@drones/shared/api/format'
import { useDeleteReview } from '@drones/shared/integrations/orval/mutations'
import {
  useRestaurants,
  useReviewsByRestaurant,
} from '@drones/shared/integrations/orval/queries'
import { ConfirmDialog } from '@drones/shared/components/ConfirmDialog/ConfirmDialog'
import { DataTable } from '@drones/shared/components/Table/DataTable'

export function ReviewsManagementPage() {
  const { data: restaurants } = useRestaurants();
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
  const reviewsQuery = useReviewsByRestaurant(selectedRestaurantId);
  const deleteReview = useDeleteReview();
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);

  const restaurantNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of restaurants ?? []) {
      if (r.id) map.set(r.id, r.name ?? "Unnamed");
    }
    return map;
  }, [restaurants]);

  const rows = reviewsQuery.data ?? [];

  return (
    <section className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">Reviews</h2>
      <p className="mt-1 text-sm text-zinc-400">
        Moderate customer feedback per restaurant.
      </p>

      <label className="mt-4 block max-w-md text-sm text-zinc-300">
        Restaurant
        <select
          value={selectedRestaurantId}
          onChange={(e) => setSelectedRestaurantId(e.target.value)}
          className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
        >
          <option value="">Select a restaurant</option>
          {(restaurants ?? [])
            .filter((r) => r.id)
            .map((r) => (
              <option key={r.id} value={r.id}>
                {r.name ?? "Unnamed"}
              </option>
            ))}
        </select>
      </label>

      {!selectedRestaurantId ? (
        <p className="mt-4 text-sm text-zinc-500">
          Choose a restaurant to load its reviews.
        </p>
      ) : reviewsQuery.isLoading ? (
        <p className="mt-4 text-sm text-zinc-400">Loading reviews…</p>
      ) : (
        <div className="mt-4">
          <DataTable
            data={rows}
            emptyLabel="No reviews for this restaurant."
            columns={[
              {
                key: "user",
                header: "Customer",
                render: (r) => r.userEmail ?? shortId(r.userId),
              },
              {
                key: "rating",
                header: "Rating",
                render: (r) => `${r.rating ?? 0}/5`,
              },
              {
                key: "comment",
                header: "Comment",
                render: (r) => r.comment ?? "—",
              },
              {
                key: "created",
                header: "Created",
                render: (r) => r.createdAt ?? "—",
              },
              {
                key: "actions",
                header: "Actions",
                render: (r) => (
                  <button
                    type="button"
                    onClick={() => setToDeleteId(r.id ?? null)}
                    className="rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                ),
              },
            ]}
          />
          <p className="mt-2 text-xs text-zinc-500">
            Showing reviews for{" "}
            {restaurantNameById.get(selectedRestaurantId) ?? selectedRestaurantId}
          </p>
        </div>
      )}

      <ConfirmDialog
        isOpen={toDeleteId !== null}
        title="Delete review"
        description="This permanently removes the customer review."
        loading={deleteReview.isPending}
        onCancel={() => setToDeleteId(null)}
        onConfirm={async () => {
          if (!toDeleteId) return;
          await deleteReview.mutateAsync(toDeleteId);
          setToDeleteId(null);
        }}
      />
    </section>
  );
}
