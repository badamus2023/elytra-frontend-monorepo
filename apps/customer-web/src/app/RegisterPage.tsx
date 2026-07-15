import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import type { RegisterRequest } from '@drones/shared/api/model'
import { useRegisterUser } from '@drones/shared/integrations/orval/mutations'
import {
  AuthPageLayout,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSuccessClass,
} from './AuthPageLayout'

export function RegisterPage() {
  const search = useSearch({ strict: false }) as { next?: string }
  const next = search.next?.startsWith('/') ? search.next : '/dashboard'

  const register = useRegisterUser()
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const fd = new FormData(event.currentTarget)
    const payload: RegisterRequest = {
      email: String(fd.get('email') ?? '').trim(),
      password: String(fd.get('password') ?? ''),
      confirmPassword: String(fd.get('confirmPassword') ?? ''),
    }
    if (!payload.email || !payload.password) {
      setError('Email and password are required.')
      return
    }
    if (payload.password !== payload.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    try {
      await register.mutateAsync(payload)
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    }
  }

  return (
    <AuthPageLayout
      eyebrow="Create account"
      title="Join Drone Fleet"
      description="Create an account to order from partner restaurants. You must verify your email before signing in."
      footerLinks={
        <Link to="/login" search={{ next }} className={authLinkClass}>
          Already have an account?
        </Link>
      }
    >
      {done ? (
        <div className={`mt-6 space-y-3 ${authSuccessClass}`}>
          <p className="font-medium">Check your inbox</p>
          <p>
            We sent a verification link. After confirming, you can{' '}
            <Link to="/login" search={{ next }} className={authLinkClass}>
              sign in
            </Link>
            .
          </p>
          <Link
            to="/verify-email"
            search={{ token: undefined }}
            className="inline-block text-xs text-sky-700 hover:underline"
          >
            Open email verification page
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className={authLabelClass}>
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className={authInputClass}
            />
          </label>
          <label className={authLabelClass}>
            Password
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className={authInputClass}
            />
          </label>
          <label className={authLabelClass}>
            Confirm password
            <input
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={authInputClass}
            />
          </label>
          {error ? <p className={authErrorClass}>{error}</p> : null}
          <button
            type="submit"
            disabled={register.isPending}
            className={authPrimaryButtonClass}
          >
            {register.isPending ? 'Creating…' : 'Register'}
          </button>
        </form>
      )}
    </AuthPageLayout>
  )
}
