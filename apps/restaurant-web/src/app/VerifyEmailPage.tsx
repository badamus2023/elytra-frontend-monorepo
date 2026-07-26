import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import {
  useResendVerificationEmail,
  useVerifyEmail,
} from '@drones/shared/integrations/orval/mutations'
import { AuthPanel } from './ForgotPasswordPage'

export function VerifyEmailPage() {
  const search = useSearch({ strict: false }) as { token?: string }
  const [manualToken, setManualToken] = useState('')
  const token = search.token ?? manualToken
  const verify = useVerifyEmail()
  const resend = useResendVerificationEmail('restaurantWeb')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const onVerify = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    try {
      await verify.mutateAsync(token.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed.')
    }
  }

  const onResend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    try {
      await resend.mutateAsync(String(data.get('email') ?? '').trim())
      setMessage('A new verification link was sent.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend email.')
    }
  }

  return (
    <AuthPanel title="Confirm email" description="Verify the email used for your restaurant application.">
      {verify.isSuccess ? (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Email verified. <Link to="/login" search={{ next: '/dashboard' }} className="font-semibold underline">Sign in</Link>
        </p>
      ) : (
        <form onSubmit={onVerify} className="space-y-4">
          <label className="block text-sm text-zinc-300">
            Verification token
            <input
              value={token}
              onChange={(event) => setManualToken(event.target.value)}
              readOnly={Boolean(search.token)}
              required
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 font-mono text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={verify.isPending}
            className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-zinc-950 disabled:opacity-50"
          >
            {verify.isPending ? 'Verifying…' : 'Verify email'}
          </button>
        </form>
      )}

      <form onSubmit={onResend} className="mt-6 space-y-3 border-t border-white/10 pt-5">
        <label className="block text-sm text-zinc-300">
          Resend to email
          <input
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2"
          />
        </label>
        <button type="submit" disabled={resend.isPending} className="text-sm text-amber-400 disabled:opacity-50">
          Resend verification link
        </button>
      </form>
      {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
    </AuthPanel>
  )
}
