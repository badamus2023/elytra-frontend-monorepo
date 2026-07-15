import { useState, type FormEvent } from 'react'
import type { DeliveryPointResponse } from '@drones/shared/api/model'
import { formatCoords } from '@drones/shared/api/format'
import {
  useCreateDeliveryPoint,
  useDeactivateDeliveryPoint,
  useUpdateDeliveryPoint,
} from '@drones/shared/integrations/orval/mutations'
import { useAllDeliveryPoints } from '@drones/shared/integrations/orval/queries'
import { ConfirmDialog } from '@drones/shared/components/ConfirmDialog/ConfirmDialog'
import { FormModal } from '@drones/shared/components/FormModal/FormModal'

export function DeliveryPointsPage() {
  const { data: points, isLoading } = useAllDeliveryPoints()
  const createPoint = useCreateDeliveryPoint()
  const updatePoint = useUpdateDeliveryPoint()
  const deactivatePoint = useDeactivateDeliveryPoint()

  const [modal, setModal] = useState<{
    open: boolean
    editing: DeliveryPointResponse | null
  }>({ open: false, editing: null })
  const [deactivateId, setDeactivateId] = useState<string | null>(null)
  const [formError, setFormError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError('')

    const formData = new FormData(event.currentTarget)
    const name = String(formData.get('name') ?? '').trim()
    const address = String(formData.get('address') ?? '').trim()
    const latitude = Number(formData.get('latitude') ?? 0)
    const longitude = Number(formData.get('longitude') ?? 0)
    const isActive = formData.get('isActive') === 'on'

    if (!name) {
      setFormError('Name is required.')
      return
    }
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setFormError('Enter valid coordinates.')
      return
    }

    try {
      if (modal.editing?.id) {
        await updatePoint.mutateAsync({
          id: modal.editing.id,
          body: { name, address, latitude, longitude, isActive },
        })
      } else {
        await createPoint.mutateAsync({
          name,
          address,
          latitude,
          longitude,
          isActive,
        })
      }
      setModal({ open: false, editing: null })
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed.')
    }
  }

  const onDeactivate = async () => {
    if (!deactivateId) return
    try {
      await deactivatePoint.mutateAsync(deactivateId)
      setDeactivateId(null)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Deactivate failed.')
    }
  }

  if (isLoading) {
    return <p className="text-sm text-zinc-400">Loading pickup points…</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-zinc-400">
          Manage drone drop-off locations customers can choose at checkout.
        </p>
        <button
          type="button"
          onClick={() => setModal({ open: true, editing: null })}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
        >
          Add pickup point
        </button>
      </div>

      {formError && !modal.open ? (
        <p className="text-sm text-rose-300">{formError}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-zinc-900/80 text-zinc-400">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Coordinates</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(points ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">
                  No pickup points yet.
                </td>
              </tr>
            ) : (
              (points ?? []).map((point) => (
                <tr key={point.id} className="border-t border-white/5">
                  <td className="px-4 py-3 font-medium text-zinc-100">
                    {point.name}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{point.address}</td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                    {formatCoords(point.latitude, point.longitude)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        point.isActive
                          ? 'text-emerald-300'
                          : 'text-zinc-500'
                      }
                    >
                      {point.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setModal({ open: true, editing: point })
                        }
                        className="rounded-md border border-white/10 px-3 py-1 text-xs text-zinc-200 hover:bg-white/5"
                      >
                        Edit
                      </button>
                      {point.isActive && point.id ? (
                        <button
                          type="button"
                          onClick={() => setDeactivateId(point.id!)}
                          className="rounded-md border border-rose-500/30 px-3 py-1 text-xs text-rose-300 hover:bg-rose-500/10"
                        >
                          Deactivate
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        isOpen={modal.open}
        title={modal.editing ? 'Edit pickup point' : 'Add pickup point'}
        submitLabel={modal.editing ? 'Save changes' : 'Create pickup point'}
        loading={createPoint.isPending || updatePoint.isPending}
        onClose={() => setModal({ open: false, editing: null })}
        onSubmit={onSubmit}
      >
        <label className="block text-sm text-zinc-300">
          Name
          <input
            name="name"
            defaultValue={modal.editing?.name ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
            required
          />
        </label>
        <label className="block text-sm text-zinc-300">
          Address
          <input
            name="address"
            defaultValue={modal.editing?.address ?? ''}
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm text-zinc-300">
            Latitude
            <input
              name="latitude"
              type="number"
              step="any"
              defaultValue={modal.editing?.latitude ?? 52.2297}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              required
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Longitude
            <input
              name="longitude"
              type="number"
              step="any"
              defaultValue={modal.editing?.longitude ?? 21.0122}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              required
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-300">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={modal.editing?.isActive ?? true}
            className="rounded border-white/20"
          />
          Active (visible to customers)
        </label>
        {formError ? (
          <p className="text-xs text-red-300">{formError}</p>
        ) : null}
      </FormModal>

      <ConfirmDialog
        isOpen={Boolean(deactivateId)}
        title="Deactivate pickup point?"
        description="Customers will no longer be able to select this location at checkout. Existing orders are unaffected."
        loading={deactivatePoint.isPending}
        onConfirm={onDeactivate}
        onCancel={() => setDeactivateId(null)}
      />
    </div>
  )
}
