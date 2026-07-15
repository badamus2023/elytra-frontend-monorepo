import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import type { AuthResponse } from '@drones/shared/api/model'
import { postApiAuthLogin } from '@drones/shared/api/client'
import { setSession } from '@drones/shared/auth/session'
import { rolesAllowedForWorkspace } from '@drones/shared/auth/workspace'
import { setRole, setUserName } from '../auth/workspace'
import {
  AuthPageLayout,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from './AuthPageLayout'

export function LoginPage() {
  const search = useSearch({ strict: false }) as { next?: string }
  const next = search.next?.startsWith('/') ? search.next : '/dashboard'

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
      if (!rolesAllowedForWorkspace('customer', auth.user.roles ?? [])) {
        throw new Error(
          'This account cannot access the customer app. Use a User-role account.',
        )
      }
      setSession(auth)
      setRole('customer')
      setUserName(auth.user.email?.split('@')[0] ?? 'User')
      window.location.assign(next)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    }
  }

  return (
    <AuthPageLayout
      eyebrow="Sign in"
      title="Welcome back"
      description="Sign in to order from local restaurants and track your drone deliveries."
      footerLinks={
        <>
          <Link to="/" className={authLinkClass}>
            Back to home
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className={authLabelClass}>
          Email
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={authInputClass}
            required
          />
        </label>
        <label className={authLabelClass}>
          Password
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={authInputClass}
            required
          />
        </label>
        {error ? <p className={authErrorClass}>{error}</p> : null}
        <button type="submit" className={authPrimaryButtonClass}>
          Continue
        </button>
      </form>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-center text-xs text-slate-500">
        <Link to="/register" search={{ next }} className={authLinkClass}>
          Create account
        </Link>
        <Link to="/forgot-password" className={authLinkClass}>
          Forgot password?
        </Link>
      </div>
      {error && /verify|VERIFIED|EMAIL_NOT_VERIFIED/i.test(error) ? (
        <p className="mt-3 text-center text-xs text-amber-700">
          <Link to="/verify-email" search={{ token: undefined }} className={authLinkClass}>
            Confirm your email
          </Link>{' '}
          before signing in.
        </p>
      ) : null}
    </AuthPageLayout>
  )
}
