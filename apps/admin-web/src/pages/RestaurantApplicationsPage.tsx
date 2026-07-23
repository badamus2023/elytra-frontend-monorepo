import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { postApiRestaurantApplicationsReview } from '@drones/shared/api/client'
import { withAuth, assertOk } from '@drones/shared/api/withAuth'
import { useRestaurantApplications } from '@drones/shared/integrations/orval/queries'

export function RestaurantApplicationsPage() {
  const { data = [], isLoading } = useRestaurantApplications()
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState<Record<string, string>>({})
  const review = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' }) => {
      const r = await postApiRestaurantApplicationsReview(id, action, notes[id] ?? '', withAuth())
      assertOk(r.status, r.data, 'Could not review application')
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['restaurant-applications'] }),
  })

  if (isLoading) return <p className="text-zinc-400">Loading applications…</p>
  return <section className="space-y-5">
    <div><h1 className="text-xl font-semibold text-zinc-100">Restaurant applications</h1><p className="text-sm text-zinc-400">Review company details before creating the restaurant.</p></div>
    {data.length === 0 ? <p className="rounded-xl border border-white/10 p-6 text-zinc-400">No applications.</p> :
      data.map(item => <article key={item.id} className="rounded-xl border border-white/10 bg-zinc-900/70 p-5">
        <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold text-zinc-100">{item.restaurantName}</h2><p className="text-sm text-zinc-400">{item.companyName} · NIP {item.taxId}</p></div><span className="text-sm text-amber-300">{item.status}</span></div>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-zinc-500">Owner</dt><dd>{item.email} · {item.contactPhone}</dd></div><div><dt className="text-zinc-500">Address</dt><dd>{item.address}</dd></div><div><dt className="text-zinc-500">Coordinates</dt><dd>{item.latitude}, {item.longitude}</dd></div><div><dt className="text-zinc-500">Hours</dt><dd>{item.openTime}–{item.closeTime}</dd></div></dl>
        {item.description ? <p className="mt-3 text-sm text-zinc-300">{item.description}</p> : null}
        {item.status === 'Pending' && item.id ? <div className="mt-4 flex flex-col gap-3 sm:flex-row"><input value={notes[item.id] ?? ''} onChange={e => setNotes(v => ({...v,[item.id!]:e.target.value}))} placeholder="Admin note (optional)" className="flex-1 rounded-md border border-white/15 bg-zinc-950 px-3 py-2 text-sm" /><button onClick={() => review.mutate({id:item.id!,action:'approve'})} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold">Approve</button><button onClick={() => review.mutate({id:item.id!,action:'reject'})} className="rounded-md bg-rose-700 px-4 py-2 text-sm font-semibold">Reject</button></div> : item.adminNote ? <p className="mt-3 text-sm text-zinc-400">Admin note: {item.adminNote}</p> : null}
      </article>)}
  </section>
}
