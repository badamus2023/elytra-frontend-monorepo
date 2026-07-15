import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '@drones/shared/integrations/orval/mutations'

export function ResetPasswordPage() {
  const search = useSearch({ strict: false }) as { token?: string }
  const [manualToken, setManualToken] = useState('')
  const token = search.token ?? manualToken
  const reset = useResetPassword()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const fd = new FormData(event.currentTarget)
    const t = String(fd.get('token') ?? token).trim()
    const newPassword = String(fd.get('newPassword') ?? '')
    const confirmPassword = String(fd.get('confirmPassword') ?? '')
    if (!t) {
      setError('Reset token is required.')
      return
    }
    if (!newPassword || newPassword !== confirmPassword) {
      setError('Passwords must match and be non-empty.')
      return
    }
    try {
      await reset.mutateAsync({ token: t, newPassword, confirmPassword })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
          Account recovery
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Set new password</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Use the token from your reset email.
        </p>

        {done ? (
          <p className="mt-6 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            Password updated.{' '}
            <Link
              to="/login"
              search={{ next: '/fleet-overview' }}
              className="font-semibold underline"
            >
              Sign in
            </Link>
            .
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block text-sm text-zinc-300">
              Reset token
              <input
                name="token"
                value={token}
                onChange={(e) => setManualToken(e.target.value)}
                readOnly={Boolean(search.token)}
                className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 font-mono text-sm text-zinc-100"
                required
              />
            </label>
            <label className="block text-sm text-zinc-300">
              New password
              <input
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              />
            </label>
            <label className="block text-sm text-zinc-300">
              Confirm password
              <input
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
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
              disabled={reset.isPending}
              className="w-full rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {reset.isPending ? 'Saving…' : 'Update password'}
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
