import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { useForgotPassword } from '@drones/shared/integrations/orval/mutations'

export function ForgotPasswordPage() {
  const forgot = useForgotPassword('restaurantWeb')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email') ?? '').trim()
    if (!email) return

    try {
      await forgot.mutateAsync(email)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.')
    }
  }

  return (
    <AuthPanel title="Forgot password" description="We will send a reset link to your owner email.">
      {done ? (
        <p className="rounded-lg border border-sky-400/30 bg-sky-500/10 p-4 text-sm text-sky-100">
          If that account exists, a reset link was sent.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-zinc-300">
            Email
            <input
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
            />
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button
            type="submit"
            disabled={forgot.isPending}
            className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-zinc-950 disabled:opacity-50"
          >
            {forgot.isPending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
      <Link to="/login" search={{ next: '/dashboard' }} className="mt-5 block text-center text-sm text-amber-400">
        Back to sign in
      </Link>
    </AuthPanel>
  )
}

function AuthPanel({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Restaurant owner</p>
        <h1 className="mt-2 text-2xl font-semibold">{title}</h1>
        <p className="mb-6 mt-2 text-sm text-zinc-400">{description}</p>
        {children}
      </section>
    </main>
  )
}

export { AuthPanel }
