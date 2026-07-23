import { useMemo, useState } from 'react'
import { shortId } from '../api/format'
import { useConfirmReceipt } from '../integrations/orval/mutations'
import { useOrders } from '../integrations/orval/queries'

export function CustomerReceiptGate() {
  const { data: orders } = useOrders()
  const confirmReceipt = useConfirmReceipt()
  const [error, setError] = useState('')

  const order = useMemo(
    () =>
      [...(orders ?? [])]
        .filter((item) => item.status?.toLowerCase() === 'delivered')
        .sort((a, b) =>
          String(a.updatedAt ?? a.createdAt).localeCompare(
            String(b.updatedAt ?? b.createdAt),
          ),
        )[0],
    [orders],
  )

  if (!order?.id) return null

  const confirm = async () => {
    setError('')
    try {
      await confirmReceipt.mutateAsync(order.id!)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not confirm receipt.')
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="receipt-title"
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
          Delivery arrived
        </p>
        <h2 id="receipt-title" className="mt-2 text-xl font-semibold text-slate-950">
          Confirm receipt of order {shortId(order.id)}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          Your drone reports that the delivery reached {order.deliveryAddress}.
          Confirm that you received it to complete the order.
        </p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p>{order.items?.length ?? 0} line item(s)</p>
          <p className="font-semibold">
            Total: {Number(order.totalAmount ?? 0).toFixed(2)}
          </p>
        </div>
        {error ? (
          <p className="mt-3 rounded-md bg-rose-50 p-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
        <button
          type="button"
          disabled={confirmReceipt.isPending}
          onClick={confirm}
          className="mt-5 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {confirmReceipt.isPending ? 'Confirming…' : 'I received my order'}
        </button>
      </div>
    </div>
  )
}
