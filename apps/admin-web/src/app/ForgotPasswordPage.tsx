import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useForgotPassword } from '@drones/shared/integrations/orval/mutations'

export function ForgotPasswordPage() {
  const forgot = useForgotPassword()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const fd = new FormData(event.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    if (!email) {
      setError('Email is required.')
      return
    }
    try {
      await forgot.mutateAsync(email)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
          Account recovery
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Forgot password</h1>
        <p className="mt-2 text-sm text-zinc-400">
          We&apos;ll email reset instructions if the address exists.
        </p>

        {done ? (
          <p className="mt-6 rounded-lg border border-sky-400/30 bg-sky-500/10 p-4 text-sm text-sky-100">
            If that email exists you will receive a reset link. Check your inbox
            and then{' '}
            <Link
              to="/login"
              search={{ next: '/fleet-overview' }}
              className="font-semibold underline"
            >
              return to sign in
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm text-zinc-300">
              Email
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              />
            </label>
            {error ? (
              <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={forgot.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {forgot.isPending ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-xs text-zinc-500">
          <Link
            to="/login"
            search={{ next: '/fleet-overview' }}
            className="text-sky-400 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </section>
    </div>
  )
}
