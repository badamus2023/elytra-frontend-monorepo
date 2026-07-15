import { useMemo, useState, type FormEvent } from "react";
import type {
  CategoryResponse,
  ProductResponse,
  RestaurantResponse,
} from '@drones/shared/api/model'
import {
  formatCoords,
  fromApiTimeSpan,
  toApiTimeSpan,
  toApiTimeSpanOptional,
} from '@drones/shared/api/format'
import {
  useCreateCategory,
  useCreateProduct,
  useCreateRestaurant,
  useDeleteCategory,
  useDeleteProduct,
  useDeleteRestaurant,
  useUpdateCategory,
  useUpdateProduct,
  useUpdateRestaurant,
} from '@drones/shared/integrations/orval/mutations'
import {
  useCategoriesByRestaurant,
  useProductsByRestaurant,
  useRestaurants,
} from '@drones/shared/integrations/orval/queries'
import { ConfirmDialog } from '@drones/shared/components/ConfirmDialog/ConfirmDialog'
import { FormModal } from '@drones/shared/components/FormModal/FormModal'

type DeleteTarget =
  | { kind: "restaurant"; id: string }
  | { kind: "category"; id: number }
  | { kind: "product"; id: string }
  | null;

export function RestaurantManagementPage() {
  const { data: restaurants, isLoading } = useRestaurants();

  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(
    null,
  );
  const selectedRestaurant = useMemo(
    () =>
      (restaurants ?? []).find((r) => r.id === selectedRestaurantId) ?? null,
    [restaurants, selectedRestaurantId],
  );

  const categoriesQuery = useCategoriesByRestaurant(selectedRestaurantId ?? "");
  const productsQuery = useProductsByRestaurant(selectedRestaurantId ?? "");
  const categories = categoriesQuery.data ?? [];

  const productsByCategory = useMemo(() => {
    const products = productsQuery.data ?? [];
    const map = new Map<number, ProductResponse[]>();
    for (const product of products) {
      if (product.categoryId == null) continue;
      const list = map.get(product.categoryId) ?? [];
      list.push(product);
      map.set(product.categoryId, list);
    }
    return map;
  }, [productsQuery.data]);

  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const deleteRestaurant = useDeleteRestaurant();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [restaurantModal, setRestaurantModal] = useState<{
    open: boolean;
    editing: RestaurantResponse | null;
  }>({ open: false, editing: null });
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean;
    editing: CategoryResponse | null;
  }>({ open: false, editing: null });
  const [productModal, setProductModal] = useState<{
    open: boolean;
    editing: ProductResponse | null;
    categoryId: number | null;
  }>({ open: false, editing: null, categoryId: null });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [formError, setFormError] = useState("");

  const onRestaurantSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const latitude = Number(formData.get("latitude") ?? 0);
    const longitude = Number(formData.get("longitude") ?? 0);
    const openTime = String(formData.get("openTime") ?? "").trim();
    const closeTime = String(formData.get("closeTime") ?? "").trim();

    if (!name) {
      setFormError("Name is required.");
      return;
    }

    try {
      if (restaurantModal.editing?.id) {
        await updateRestaurant.mutateAsync({
          restaurantId: restaurantModal.editing.id,
          body: {
            name,
            address: address || null,
            description: description || null,
            isOpen: formData.get("isOpen") === "on",
            openTime: toApiTimeSpanOptional(openTime),
            closeTime: toApiTimeSpanOptional(closeTime),
          },
        });
      } else {
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
          setFormError("Latitude and longitude are required.");
          return;
        }
        const created = await createRestaurant.mutateAsync({
          name,
          address: address || null,
          description: description || null,
          latitude,
          longitude,
          openTime: toApiTimeSpan(openTime, "09:00:00"),
          closeTime: toApiTimeSpan(closeTime, "22:00:00"),
        });
        if (created.id) setSelectedRestaurantId(created.id);
      }
      setRestaurantModal({ open: false, editing: null });
      setFormError("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Request failed. Please retry.",
      );
    }
  };

  const onCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRestaurantId) return;

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!name) {
      setFormError("Name is required.");
      return;
    }

    try {
      if (categoryModal.editing?.id != null) {
        await updateCategory.mutateAsync({
          categoryId: categoryModal.editing.id,
          body: { name, description: description || null },
        });
      } else {
        await createCategory.mutateAsync({
          restaurantId: selectedRestaurantId,
          name,
          description: description || null,
        });
      }
      setCategoryModal({ open: false, editing: null });
      setFormError("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Request failed. Please retry.",
      );
    }
  };

  const onProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const price = Number(formData.get("price") ?? 0);
    const weightKg = Number(formData.get("weightKg") ?? 0);
    const categoryId =
      productModal.categoryId ?? Number(formData.get("categoryId") ?? 0);

    if (!name) {
      setFormError("Name is required.");
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      setFormError("Price must be zero or greater.");
      return;
    }

    try {
      if (productModal.editing?.id) {
        await updateProduct.mutateAsync({
          productId: productModal.editing.id,
          body: {
            name,
            description: description || null,
            price,
            weightKg: Number.isFinite(weightKg) ? weightKg : null,
            isAvailable: formData.get("isAvailable") === "on",
          },
        });
      } else {
        if (!Number.isFinite(categoryId) || categoryId <= 0) {
          setFormError("Category is required.");
          return;
        }
        await createProduct.mutateAsync({
          categoryId,
          name,
          description: description || null,
          price,
          weightKg: Number.isFinite(weightKg) ? weightKg : undefined,
        });
      }
      setProductModal({ open: false, editing: null, categoryId: null });
      setFormError("");
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Request failed. Please retry.",
      );
    }
  };

  const onConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.kind === "restaurant") {
      await deleteRestaurant.mutateAsync(deleteTarget.id);
      if (selectedRestaurantId === deleteTarget.id) {
        setSelectedRestaurantId(null);
      }
    } else if (deleteTarget.kind === "category") {
      await deleteCategory.mutateAsync(deleteTarget.id);
    } else {
      await deleteProduct.mutateAsync(deleteTarget.id);
    }
    setDeleteTarget(null);
  };

  const deleteLoading =
    deleteRestaurant.isPending ||
    deleteCategory.isPending ||
    deleteProduct.isPending;

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-100">
              Restaurant catalog
            </h2>
            <p className="mt-1 text-sm text-zinc-400">
              Add a restaurant, then build its menu with categories and products
              in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFormError("");
              setRestaurantModal({ open: true, editing: null });
            }}
            className="rounded-md border border-violet-300/40 bg-violet-500/20 px-3 py-1.5 text-xs text-violet-100"
          >
            Add restaurant
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_1fr]">
        <aside className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
          <h3 className="text-sm font-semibold text-zinc-100">Restaurants</h3>
          {isLoading ? (
            <p className="mt-3 text-sm text-zinc-400">Loading…</p>
          ) : (restaurants ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-zinc-500">
              No restaurants yet. Add one to get started.
            </p>
          ) : (
            <ul className="mt-3 max-h-[32rem] space-y-1 overflow-y-auto">
              {(restaurants ?? []).map((restaurant, index) => (
                <li key={restaurant.id ?? `restaurant-${index}`}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRestaurantId(restaurant.id ?? null)
                    }
                    className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                      selectedRestaurantId === restaurant.id
                        ? "border-violet-400/50 bg-violet-500/15 text-violet-50"
                        : "border-white/10 bg-zinc-950/50 text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    <span className="block font-medium">
                      {restaurant.name ?? "Unnamed"}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      {restaurant.isOpen === false ? "Closed" : "Open"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        <div className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
          {!selectedRestaurant ? (
            <p className="text-sm text-zinc-500">
              Select a restaurant to manage categories and products.
            </p>
          ) : (
            <div className="space-y-6">
              <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {selectedRestaurant.name ?? "Restaurant"}
                  </h3>
                  <p className="mt-1 text-sm text-zinc-400">
                    {selectedRestaurant.address ?? "No address"}
                  </p>
                  <p className="mt-1 text-xs text-zinc-500">
                    {formatCoords(
                      selectedRestaurant.latitude,
                      selectedRestaurant.longitude,
                    )}
                    {selectedRestaurant.averageRating != null
                      ? ` · ${selectedRestaurant.averageRating.toFixed(1)}★`
                      : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setRestaurantModal({
                        open: true,
                        editing: selectedRestaurant,
                      });
                    }}
                    className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedRestaurant.id) {
                        setDeleteTarget({
                          kind: "restaurant",
                          id: selectedRestaurant.id,
                        });
                      }
                    }}
                    className="rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                  >
                    Delete
                  </button>
                </div>
              </header>

              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-zinc-100">
                  Categories & products
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setFormError("");
                    setCategoryModal({ open: true, editing: null });
                  }}
                  className="rounded-md border border-violet-300/40 bg-violet-500/20 px-3 py-1.5 text-xs text-violet-100"
                >
                  Add category
                </button>
              </div>

              {categoriesQuery.isLoading || productsQuery.isLoading ? (
                <p className="text-sm text-zinc-400">Loading menu…</p>
              ) : categories.length === 0 ? (
                <p className="rounded-lg border border-dashed border-white/15 p-6 text-center text-sm text-zinc-500">
                  No categories yet. Add a category, then add products to it.
                </p>
              ) : (
                <div className="space-y-4">
                  {categories.map((category, index) => {
                    const categoryProducts =
                      category.id != null
                        ? (productsByCategory.get(category.id) ?? [])
                        : [];

                    return (
                      <article
                        key={category.id ?? `category-${index}`}
                        className="rounded-lg border border-white/10 bg-zinc-950/40 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <h5 className="font-medium text-zinc-100">
                              {category.name ?? "Unnamed category"}
                            </h5>
                            <p className="mt-1 text-xs text-zinc-500">
                              {category.description ?? "No description"}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (category.id == null) return;
                                setFormError("");
                                setProductModal({
                                  open: true,
                                  editing: null,
                                  categoryId: category.id,
                                });
                              }}
                              className="rounded-md border border-cyan-300/40 bg-cyan-500/15 px-2 py-1 text-xs text-cyan-100"
                            >
                              Add product
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setFormError("");
                                setCategoryModal({ open: true, editing: category });
                              }}
                              className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (category.id == null) return;
                                setDeleteTarget({
                                  kind: "category",
                                  id: category.id,
                                });
                              }}
                              className="rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        {categoryProducts.length === 0 ? (
                          <p className="mt-3 text-xs text-zinc-500">
                            No products in this category.
                          </p>
                        ) : (
                          <ul className="mt-3 divide-y divide-white/5">
                            {categoryProducts.map((product, productIndex) => (
                              <li
                                key={product.id ?? `product-${productIndex}`}
                                className="flex flex-wrap items-center justify-between gap-3 py-2"
                              >
                                <div>
                                  <p className="text-sm text-zinc-100">
                                    {product.name ?? "Unnamed product"}
                                  </p>
                                  <p className="text-xs text-zinc-500">
                                    {Number(product.price ?? 0).toFixed(2)}
                                    {product.weightKg != null
                                      ? ` · ${product.weightKg} kg`
                                      : ""}
                                    {product.isAvailable === false
                                      ? " · unavailable"
                                      : ""}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormError("");
                                      setProductModal({
                                        open: true,
                                        editing: product,
                                        categoryId: product.categoryId ?? null,
                                      });
                                    }}
                                    className="rounded-md border border-white/15 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!product.id) return;
                                      setDeleteTarget({
                                        kind: "product",
                                        id: product.id,
                                      });
                                    }}
                                    className="rounded-md border border-red-300/40 px-2 py-1 text-xs text-red-200 hover:bg-red-500/20"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <FormModal
        isOpen={restaurantModal.open}
        title={
          restaurantModal.editing ? "Edit restaurant" : "Add restaurant"
        }
        submitLabel={
          restaurantModal.editing ? "Save changes" : "Create restaurant"
        }
        loading={createRestaurant.isPending || updateRestaurant.isPending}
        onClose={() => setRestaurantModal({ open: false, editing: null })}
        onSubmit={onRestaurantSubmit}
      >
        <RestaurantFormFields editing={restaurantModal.editing} />
        {formError ? <p className="text-xs text-red-300">{formError}</p> : null}
      </FormModal>

      <FormModal
        isOpen={categoryModal.open}
        title={categoryModal.editing ? "Edit category" : "Add category"}
        submitLabel={categoryModal.editing ? "Save changes" : "Create category"}
        loading={createCategory.isPending || updateCategory.isPending}
        onClose={() => setCategoryModal({ open: false, editing: null })}
        onSubmit={onCategorySubmit}
      >
        <label className="block text-sm text-zinc-300">
          Name
          <input
            name="name"
            defaultValue={categoryModal.editing?.name ?? ""}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            required
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Description
          <textarea
            name="description"
            defaultValue={categoryModal.editing?.description ?? ""}
            rows={3}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        {formError ? <p className="text-xs text-red-300">{formError}</p> : null}
      </FormModal>

      <FormModal
        isOpen={productModal.open}
        title={productModal.editing ? "Edit product" : "Add product"}
        submitLabel={productModal.editing ? "Save changes" : "Create product"}
        loading={createProduct.isPending || updateProduct.isPending}
        onClose={() =>
          setProductModal({ open: false, editing: null, categoryId: null })
        }
        onSubmit={onProductSubmit}
      >
        {productModal.editing ? null : productModal.categoryId != null ? (
          <input
            type="hidden"
            name="categoryId"
            value={productModal.categoryId}
          />
        ) : null}
        <label className="block text-sm text-zinc-300">
          Name
          <input
            name="name"
            defaultValue={productModal.editing?.name ?? ""}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            required
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Description
          <textarea
            name="description"
            defaultValue={productModal.editing?.description ?? ""}
            rows={3}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">
            Price
            <input
              name="price"
              type="number"
              min={0}
              step="0.01"
              defaultValue={productModal.editing?.price ?? 0}
              className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Weight (kg)
            <input
              name="weightKg"
              type="number"
              min={0}
              step="0.01"
              defaultValue={productModal.editing?.weightKg ?? 0.5}
              className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
        </div>
        {productModal.editing ? (
          <label className="flex items-center gap-2 text-sm text-zinc-300">
            <input
              name="isAvailable"
              type="checkbox"
              defaultChecked={productModal.editing.isAvailable !== false}
              className="rounded border-white/20"
            />
            Available for ordering
          </label>
        ) : null}
        {formError ? <p className="text-xs text-red-300">{formError}</p> : null}
      </FormModal>

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title={
          deleteTarget?.kind === "restaurant"
            ? "Delete restaurant"
            : deleteTarget?.kind === "category"
              ? "Delete category"
              : "Delete product"
        }
        description={
          deleteTarget?.kind === "restaurant"
            ? "This removes the restaurant and related catalog data."
            : deleteTarget?.kind === "category"
              ? "Products in this category may be affected."
              : "Customers will no longer be able to order this item."
        }
        loading={deleteLoading}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
      />
    </section>
  );
}

function RestaurantFormFields({
  editing,
}: {
  editing: RestaurantResponse | null;
}) {
  return (
    <>
      <label className="block text-sm text-zinc-300">
        Name
        <input
          name="name"
          defaultValue={editing?.name ?? ""}
          className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          required
        />
      </label>
      <label className="block text-sm text-zinc-300">
        Address
        <input
          name="address"
          defaultValue={editing?.address ?? ""}
          className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
        />
      </label>
      <label className="block text-sm text-zinc-300">
        Description
        <textarea
          name="description"
          defaultValue={editing?.description ?? ""}
          rows={3}
          className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
        />
      </label>
      {!editing ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">
            Latitude
            <input
              name="latitude"
              type="number"
              step="any"
              defaultValue={52.23}
              className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Longitude
            <input
              name="longitude"
              type="number"
              step="any"
              defaultValue={21.01}
              className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            />
          </label>
        </div>
      ) : (
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            name="isOpen"
            type="checkbox"
            defaultChecked={editing.isOpen ?? false}
            className="rounded border-white/20"
          />
          Restaurant is open
        </label>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm text-zinc-300">
          Open time
          <input
            name="openTime"
            type="time"
            defaultValue={fromApiTimeSpan(editing?.openTime)}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Close time
          <input
            name="closeTime"
            type="time"
            defaultValue={fromApiTimeSpan(editing?.closeTime ?? "22:00:00")}
            className="mt-1 w-full rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
      </div>
    </>
  );
}

export default RestaurantManagementPage;
