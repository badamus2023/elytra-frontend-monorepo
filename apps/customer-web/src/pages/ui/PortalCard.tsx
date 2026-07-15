import type { ReactNode } from 'react'

type PortalCardProps = {
  title?: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function PortalCard({
  title,
  description,
  action,
  children,
  className,
}: PortalCardProps) {
  return (
    <section
      className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className ?? ''}`}
    >
      {title || action ? (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title ? (
              <h2 className="text-base font-semibold text-slate-900">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {action}
        </header>
      ) : null}
      {children}
    </section>
  )
}

export function PortalStatusPill({ value }: { value?: string | null }) {
  const normalized = value?.toLowerCase() ?? 'unknown'
  const tone = pillTone(normalized)
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {value ?? 'Unknown'}
    </span>
  )
}

function pillTone(value: string): string {
  if (value.includes('complete') || value.includes('delivered')) {
    return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
  }
  if (value.includes('active') || value.includes('transit') || value.includes('online')) {
    return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
  }
  if (value.includes('queue') || value.includes('idle') || value.includes('pending')) {
    return 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
  }
  if (value.includes('delay') || value.includes('offline') || value.includes('cancel')) {
    return 'bg-rose-50 text-rose-700 ring-1 ring-rose-200'
  }
  return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
}
