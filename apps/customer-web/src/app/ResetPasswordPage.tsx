import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '@drones/shared/integrations/orval/mutations'
import {
  AuthPageLayout,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSuccessClass,
} from './AuthPageLayout'

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
    <AuthPageLayout
      eyebrow="Account recovery"
      title="Set new password"
      description="Use the token from your reset email."
      footerLinks={
        <Link to="/login" search={{ next: '/dashboard' }} className={authLinkClass}>
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <p className={`mt-6 ${authSuccessClass}`}>
          Password updated.{' '}
          <Link to="/login" search={{ next: '/dashboard' }} className={authLinkClass}>
            Sign in
          </Link>
          .
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className={authLabelClass}>
            Reset token
            <input
              name="token"
              value={token}
              onChange={(e) => setManualToken(e.target.value)}
              readOnly={Boolean(search.token)}
              className={`${authInputClass} font-mono text-sm`}
              required
            />
          </label>
          <label className={authLabelClass}>
            New password
            <input
              name="newPassword"
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
            disabled={reset.isPending}
            className={authPrimaryButtonClass}
          >
            {reset.isPending ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthPageLayout>
  )
}
