type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  description: string
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  loading,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-4">
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        <p className="mt-2 text-sm text-zinc-400">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-md border border-red-300/40 bg-red-500/20 px-3 py-1.5 text-sm text-red-100 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}
