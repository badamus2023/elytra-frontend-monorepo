import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import type { AuthResponse } from '@drones/shared/api/model'
import { postApiAuthLogin } from '@drones/shared/api/client'
import { setSession } from '@drones/shared/auth/session'
import { rolesAllowedForWorkspace } from '@drones/shared/auth/workspace'
import { setRole, setUserName } from '../auth/workspace'

export function LoginPage() {
  const search = useSearch({ strict: false }) as { next?: string }
  const next = search.next?.startsWith('/') ? search.next : '/fleet-overview'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      const r = await postApiAuthLogin(
        { email: email.trim(), password },
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      )
      if (r.status < 200 || r.status >= 300) {
        const msg =
          typeof r.data === 'object' && r.data && 'message' in r.data
            ? String((r.data as { message: unknown }).message)
            : 'Login failed'
        throw new Error(msg)
      }
      const auth: AuthResponse = r.data
      if (!auth?.accessToken || !auth?.user) {
        throw new Error('Unexpected login response')
      }
      if (!rolesAllowedForWorkspace('admin', auth.user.roles ?? [])) {
        throw new Error(
          'This account cannot access the admin app. Use an Admin-role account.',
        )
      }
      setSession(auth)
      setRole('admin')
      setUserName(auth.user.email?.split('@')[0] ?? 'Admin')
      window.location.assign(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-zinc-100">
      <section className="w-full max-w-md rounded-3xl border border-white/10 bg-zinc-900/80 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-400">
          Admin sign in
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Platform admin</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Fleet operations, analytics, and platform management.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-zinc-300">
            Email
            <input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              required
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Password
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 text-zinc-100"
              required
            />
          </label>
          {error ? (
            <p className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow hover:from-violet-600 hover:to-fuchsia-700"
          >
            Continue
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-zinc-500">
          <Link to="/forgot-password" className="text-violet-400 hover:underline">
            Forgot password?
          </Link>
        </p>
      </section>
    </div>
  )
}
