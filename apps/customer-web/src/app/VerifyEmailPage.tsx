import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import {
  useResendVerificationEmail,
  useVerifyEmail,
} from '@drones/shared/integrations/orval/mutations'
import {
  AuthPageLayout,
  authErrorClass,
  authInputClass,
  authLabelClass,
  authLinkClass,
  authPrimaryButtonClass,
  authSuccessClass,
} from './AuthPageLayout'

export function VerifyEmailPage() {
  const search = useSearch({ strict: false }) as { token?: string }
  const [manualToken, setManualToken] = useState('')
  const token = search.token ?? manualToken
  const verify = useVerifyEmail()
  const resend = useResendVerificationEmail()
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')

  const onVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const t = token.trim()
    if (!t) {
      setError('Token is required.')
      return
    }
    try {
      await verify.mutateAsync(t)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed')
    }
  }

  const onResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setResendMsg('')
    setError('')
    const fd = new FormData(event.currentTarget)
    const email = String(fd.get('email') ?? '').trim()
    if (!email) return
    try {
      await resend.mutateAsync(email)
      setResendMsg('If that email exists, a new verification message was sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend.')
    }
  }

  return (
    <AuthPageLayout
      eyebrow="Account"
      title="Confirm email"
      description="Paste the token from your verification email. Opening the link may pre-fill it here."
      footerLinks={
        <Link to="/" className={authLinkClass}>
          Back to home
        </Link>
      }
    >
      {verify.isSuccess ? (
        <div className={`mt-6 ${authSuccessClass}`}>
          <p className="font-medium">Email verified</p>
          <p className="mt-2">
            <Link to="/login" search={{ next: '/dashboard' }} className={authLinkClass}>
              Sign in
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={onVerify} className="mt-6 space-y-4">
          <label className={authLabelClass}>
            Verification token
            <input
              value={token}
              onChange={(e) => setManualToken(e.target.value)}
              readOnly={Boolean(search.token)}
              autoComplete="off"
              className={`${authInputClass} font-mono text-sm`}
              placeholder="from email link"
            />
          </label>
          {error ? <p className={authErrorClass}>{error}</p> : null}
          <button
            type="submit"
            disabled={verify.isPending}
            className={authPrimaryButtonClass}
          >
            {verify.isPending ? 'Verifying…' : 'Verify email'}
          </button>
        </form>
      )}

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          Resend link
        </p>
        <form onSubmit={onResend} className="mt-3 flex gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="Your email"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <button
            type="submit"
            disabled={resend.isPending}
            className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            Send
          </button>
        </form>
        {resendMsg ? (
          <p className="mt-2 text-xs text-emerald-700">{resendMsg}</p>
        ) : null}
      </div>
    </AuthPageLayout>
  )
}
