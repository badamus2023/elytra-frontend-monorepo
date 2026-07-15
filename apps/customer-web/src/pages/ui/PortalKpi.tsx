import type { ReactNode } from 'react'

type PortalKpiProps = {
  label: string
  value: string | number
  hint?: string
  icon?: ReactNode
  tone?: 'sky' | 'emerald' | 'amber' | 'violet'
}

const tones: Record<NonNullable<PortalKpiProps['tone']>, string> = {
  sky: 'from-sky-500 to-indigo-600',
  emerald: 'from-emerald-500 to-teal-600',
  amber: 'from-amber-500 to-orange-600',
  violet: 'from-violet-500 to-fuchsia-600',
}

export function PortalKpi({
  label,
  value,
  hint,
  icon,
  tone = 'sky',
}: PortalKpiProps) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {icon ? (
        <span
          className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm ${tones[tone]}`}
        >
          {icon}
        </span>
      ) : null}
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
        {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      </div>
    </article>
  )
}
