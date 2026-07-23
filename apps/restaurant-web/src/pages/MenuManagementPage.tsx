import { useMemo, useState, type FormEvent } from 'react'
import type { CategoryResponse, ProductResponse } from '@drones/shared/api/model'
import {
  useCreateCategory,
  useCreateProduct,
  useDeleteCategory,
  useDeleteProduct,
  useUpdateCategory,
  useUpdateProduct,
} from '@drones/shared/integrations/orval/mutations'
import {
  useCategoriesByRestaurant,
  useProductsByRestaurant,
  useMyRestaurant as useRestaurants,
} from '@drones/shared/integrations/orval/queries'
import { ConfirmDialog } from '@drones/shared/components/ConfirmDialog/ConfirmDialog'
import { FormModal } from '@drones/shared/components/FormModal/FormModal'

type DeleteTarget =
  | { kind: 'category'; id: number }
  | { kind: 'product'; id: string }
  | null

export function MenuManagementPage() {
  const { data: restaurants, isLoading } = useRestaurants()
  const restaurantId = restaurants?.[0]?.id ?? null
  const restaurantName = restaurants?.[0]?.name ?? 'Your restaurant'

  const categoriesQuery = useCategoriesByRestaurant(restaurantId ?? '')
  const productsQuery = useProductsByRestaurant(restaurantId ?? '')
  const categories = categoriesQuery.data ?? []

  const productsByCategory = useMemo(() => {
    const products = productsQuery.data ?? []
    const map = new Map<number, ProductResponse[]>()
    for (const product of products) {
      if (product.categoryId == null) continue
      const list = map.get(product.categoryId) ?? []
      list.push(product)
      map.set(product.categoryId, list)
    }
    return map
  }, [productsQuery.data])

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const deleteCategory = useDeleteCategory()
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const [categoryModal, setCategoryModal] = useState<{
    open: boolean
    editing: CategoryResponse | null
  }>({ open: false, editing: null })
  const [productModal, setProductModal] = useState<{
    open: boolean
    editing: ProductResponse | null
    categoryId: number | null
  }>({ open: false, editing: null, categoryId: null })
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null)
  const [formError, setFormError] = useState('')

  const onCategorySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!restaurantId) return
    setFormError('')
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    if (!name) {
      setFormError('Category name is required.')
      return
    }
    try {
      if (categoryModal.editing?.id != null) {
        await updateCategory.mutateAsync({
          categoryId: categoryModal.editing.id,
          body: { name },
        })
      } else {
        await createCategory.mutateAsync({ name, restaurantId })
      }
      setCategoryModal({ open: false, editing: null })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed.')
    }
  }

  const onProductSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!restaurantId || productModal.categoryId == null) return
    setFormError('')
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const price = Number(formData.get('price') ?? 0)
    const description = String(formData.get('description') ?? '').trim()
    if (!name) {
      setFormError('Product name is required.')
      return
    }
    try {
      if (productModal.editing?.id) {
        await updateProduct.mutateAsync({
          productId: productModal.editing.id,
          body: {
            name,
            price,
            description: description || null,
          },
        })
      } else {
        await createProduct.mutateAsync({
          name,
          price,
          description: description || null,
          categoryId: productModal.categoryId,
        })
      }
      setProductModal({ open: false, editing: null, categoryId: null })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed.')
    }
  }

  const onConfirmDelete = async () => {
    if (!deleteTarget) return
    try {
      if (deleteTarget.kind === 'category') {
        await deleteCategory.mutateAsync(deleteTarget.id)
      } else {
        await deleteProduct.mutateAsync(deleteTarget.id)
      }
      setDeleteTarget(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading menu…</p>
  }

  if (!restaurantId) {
    return (
      <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-6 text-sm text-amber-100">
        No restaurant is linked to this account yet. Until the backend exposes
        owner-scoped restaurants, an admin must create a restaurant in the
        platform catalog.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">
        Manage categories and products for {restaurantName}.
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategoryModal({ open: true, editing: null })}
          className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-medium text-amber-100 ring-1 ring-amber-300/30 hover:bg-amber-500/30"
        >
          Add category
        </button>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-zinc-500">No categories yet.</p>
      ) : (
        categories.map((category) => (
          <section
            key={category.id}
            className="rounded-xl border border-white/10 bg-zinc-900/50 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold text-zinc-100">
                {category.name}
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCategoryModal({ open: true, editing: category })
                  }
                  className="text-xs text-amber-300 hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() =>
                    category.id != null &&
                    setDeleteTarget({ kind: 'category', id: category.id })
                  }
                  className="text-xs text-red-300 hover:underline"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setProductModal({
                      open: true,
                      editing: null,
                      categoryId: category.id ?? null,
                    })
                  }
                  className="rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                >
                  Add product
                </button>
              </div>
            </div>
            <ul className="space-y-2">
              {(productsByCategory.get(category.id ?? -1) ?? []).map((product) => (
                <li
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-white/5 bg-zinc-950/40 px-3 py-2 text-sm"
                >
                  <div>
                    <p className="font-medium text-zinc-100">{product.name}</p>
                    <p className="text-xs text-zinc-500">{product.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-amber-200">
                      ${product.price?.toFixed(2) ?? '0.00'}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setProductModal({
                          open: true,
                          editing: product,
                          categoryId: category.id ?? null,
                        })
                      }
                      className="text-xs text-amber-300 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        product.id &&
                        setDeleteTarget({ kind: 'product', id: product.id })
                      }
                      className="text-xs text-red-300 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}

      <FormModal
        isOpen={categoryModal.open}
        title={categoryModal.editing ? 'Edit category' : 'New category'}
        submitLabel={categoryModal.editing ? 'Save changes' : 'Create category'}
        loading={createCategory.isPending || updateCategory.isPending}
        onClose={() => setCategoryModal({ open: false, editing: null })}
        onSubmit={onCategorySubmit}
      >
        <label className="block text-sm text-zinc-300">
          Name
          <input
            name="name"
            defaultValue={categoryModal.editing?.name ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            required
          />
        </label>
        {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
      </FormModal>

      <FormModal
        isOpen={productModal.open}
        title={productModal.editing ? 'Edit product' : 'New product'}
        submitLabel={productModal.editing ? 'Save changes' : 'Create product'}
        loading={createProduct.isPending || updateProduct.isPending}
        onClose={() =>
          setProductModal({ open: false, editing: null, categoryId: null })
        }
        onSubmit={onProductSubmit}
      >
        <label className="block text-sm text-zinc-300">
          Name
          <input
            name="name"
            defaultValue={productModal.editing?.name ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Price
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={productModal.editing?.price ?? 0}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Description
          <textarea
            name="description"
            defaultValue={productModal.editing?.description ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            rows={3}
          />
        </label>
        {formError ? <p className="text-sm text-red-300">{formError}</p> : null}
      </FormModal>

      <ConfirmDialog
        isOpen={deleteTarget != null}
        title="Delete item?"
        description="This action cannot be undone."
        loading={deleteCategory.isPending || deleteProduct.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={onConfirmDelete}
      />
    </div>
  )
}
