import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { postApiAuthRegisterRestaurantOwner } from '@drones/shared/api/client'
import { getApiErrorMessage } from '@drones/shared/api/parseApiError'
import { toApiTimeSpan } from '@drones/shared/api/format'

export function RegisterPage() {
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setPending(true)
    const data = new FormData(event.currentTarget)
    try {
      const response = await postApiAuthRegisterRestaurantOwner({
        email: String(data.get('email') ?? '').trim(),
        password: String(data.get('password') ?? ''),
        confirmPassword: String(data.get('confirmPassword') ?? ''),
        companyName: String(data.get('companyName') ?? '').trim(),
        taxId: String(data.get('taxId') ?? '').trim(),
        contactPhone: String(data.get('contactPhone') ?? '').trim(),
        restaurantName: String(data.get('restaurantName') ?? '').trim(),
        address: String(data.get('address') ?? '').trim(),
        latitude: Number(data.get('latitude')),
        longitude: Number(data.get('longitude')),
        description: String(data.get('description') ?? '').trim() || null,
        openTime: toApiTimeSpan(String(data.get('openTime') ?? ''), '09:00:00'),
        closeTime: toApiTimeSpan(String(data.get('closeTime') ?? ''), '22:00:00'),
      })
      if (response.status < 200 || response.status >= 300)
        throw new Error(getApiErrorMessage(response.data, 'Registration failed'))
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setPending(false)
    }
  }

  if (sent) return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-4 text-zinc-100">
      <section className="max-w-lg rounded-2xl border border-emerald-400/30 bg-zinc-900 p-8">
        <h1 className="text-2xl font-semibold">Application submitted</h1>
        <p className="mt-3 text-zinc-400">Verify your email. An administrator must approve the company before the restaurant becomes available.</p>
        <Link to="/login" search={{ next: '/dashboard' }} className="mt-5 inline-block text-amber-400">Back to login</Link>
      </section>
    </main>
  )

  const input = 'mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2'
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100">
      <form onSubmit={submit} className="mx-auto max-w-3xl space-y-5 rounded-3xl border border-white/10 bg-zinc-900/80 p-8">
        <div><p className="text-xs uppercase tracking-widest text-amber-400">Restaurant partner</p><h1 className="mt-2 text-2xl font-semibold">Register your company</h1></div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ['companyName','Company legal name','text'], ['taxId','Tax ID / NIP','text'],
            ['contactPhone','Contact phone','tel'], ['restaurantName','Restaurant name','text'],
            ['email','Email','email'], ['address','Restaurant address','text'],
            ['latitude','Latitude','number'], ['longitude','Longitude','number'],
            ['openTime','Open time','time'], ['closeTime','Close time','time'],
            ['password','Password','password'], ['confirmPassword','Confirm password','password'],
          ].map(([name,label,type]) => <label key={name} className="text-sm text-zinc-300">{label}<input name={name} type={type} step={type === 'number' ? 'any' : undefined} required className={input} /></label>)}
        </div>
        <label className="block text-sm text-zinc-300">Company and restaurant description<textarea name="description" rows={4} className={input} /></label>
        {error ? <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
        <button disabled={pending} className="w-full rounded-lg bg-amber-500 py-3 font-semibold text-zinc-950 disabled:opacity-60">{pending ? 'Submitting…' : 'Submit application'}</button>
        <p className="text-center text-sm text-zinc-400">Already registered? <Link to="/login" search={{ next: '/dashboard' }} className="text-amber-400">Sign in</Link></p>
      </form>
    </main>
  )
}
