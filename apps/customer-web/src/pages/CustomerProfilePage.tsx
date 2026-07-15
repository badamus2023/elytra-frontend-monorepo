import { useState, type FormEvent } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { getUserName, setUserName } from '../auth/workspace'
import { getSessionUser } from '@drones/shared/auth/session'
import { PortalCard } from './ui/PortalCard'

export function CustomerProfilePage() {
  const sessionUser = getSessionUser()

  const [name, setName] = useState(getUserName())
  const [saved, setSaved] = useState(false)

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setUserName(name.trim() || 'Customer')
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <PortalCard
        title="My profile"
        description="Display preferences for this browser session."
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm">
            <span className="font-medium text-slate-700">Display name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            />
          </label>

          {saved ? (
            <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <CheckCircle2 size={16} /> Profile updated.
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-md bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700"
            >
              Save changes
            </button>
          </div>
        </form>
      </PortalCard>

      <PortalCard title="Signed-in account">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              User id
            </dt>
            <dd className="font-mono text-slate-900">
              {sessionUser?.id ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Email
            </dt>
            <dd className="text-slate-900">{sessionUser?.email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Roles
            </dt>
            <dd className="text-slate-900">
              {sessionUser?.roles?.length
                ? sessionUser.roles.join(', ')
                : '—'}
            </dd>
          </div>
        </dl>
      </PortalCard>
    </div>
  )
}
