import { useState, type FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { useForgotPassword } from '@drones/shared/integrations/orval/mutations'
import {
  AuthPageLayout,
  authErrorClass,
  authInfoClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
} from './AuthPageLayout'

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
    <AuthPageLayout
      eyebrow="Account recovery"
      title="Forgot password"
      description="We'll email reset instructions if the address exists."
      footerLinks={
        <Link to="/login" search={{ next: '/dashboard' }} className={authLinkClass}>
          Back to sign in
        </Link>
      }
    >
      {done ? (
        <p className={`mt-6 ${authInfoClass}`}>
          If that email exists you will receive a reset link. Check your inbox and then{' '}
          <Link to="/login" search={{ next: '/dashboard' }} className={authLinkClass}>
            return to sign in
          </Link>
          .
        </p>
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
          {error ? <p className={authErrorClass}>{error}</p> : null}
          <button
            type="submit"
            disabled={forgot.isPending}
            className={authPrimaryButtonClass}
          >
            {forgot.isPending ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      )}
    </AuthPageLayout>
  )
}
