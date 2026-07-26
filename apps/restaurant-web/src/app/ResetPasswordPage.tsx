import { useState, type FormEvent } from 'react'
import { Link, useSearch } from '@tanstack/react-router'
import { useResetPassword } from '@drones/shared/integrations/orval/mutations'
import { AuthPanel } from './ForgotPasswordPage'

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
    const data = new FormData(event.currentTarget)
    const newPassword = String(data.get('newPassword') ?? '')
    const confirmPassword = String(data.get('confirmPassword') ?? '')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      await reset.mutateAsync({
        token: token.trim(),
        newPassword,
        confirmPassword,
      })
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed.')
    }
  }

  return (
    <AuthPanel title="Set new password" description="Use the secure link from your reset email.">
      {done ? (
        <p className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          Password updated. <Link to="/login" search={{ next: '/dashboard' }} className="font-semibold underline">Sign in</Link>
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm text-zinc-300">
            Reset token
            <input
              value={token}
              onChange={(event) => setManualToken(event.target.value)}
              readOnly={Boolean(search.token)}
              required
              className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2 font-mono text-sm"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            New password
            <input name="newPassword" type="password" required className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2" />
          </label>
          <label className="block text-sm text-zinc-300">
            Confirm password
            <input name="confirmPassword" type="password" required className="mt-1 w-full rounded-lg border border-white/15 bg-zinc-950 px-3 py-2" />
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          <button type="submit" disabled={reset.isPending} className="w-full rounded-lg bg-amber-500 py-2.5 font-semibold text-zinc-950 disabled:opacity-50">
            {reset.isPending ? 'Saving…' : 'Update password'}
          </button>
        </form>
      )}
    </AuthPanel>
  )
}
