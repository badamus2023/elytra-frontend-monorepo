import type { FormEvent, ReactNode } from 'react'

type FormModalProps = {
  isOpen: boolean
  title: string
  submitLabel: string
  loading: boolean
  onClose: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  children: ReactNode
}

export function FormModal({
  isOpen,
  title,
  submitLabel,
  loading,
  onClose,
  onSubmit,
  children,
}: FormModalProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-white/10 bg-zinc-900 p-4">
        <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>
        <div className="mt-4 space-y-3">{children}</div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-white/15 px-3 py-1.5 text-sm text-zinc-200 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border border-cyan-300/40 bg-cyan-500/20 px-3 py-1.5 text-sm text-cyan-100 disabled:opacity-50"
          >
            {loading ? 'Saving...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  )
}
