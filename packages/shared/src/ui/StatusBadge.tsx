type StatusBadgeProps = {
  value?: string | null
}

const tones: Record<string, string> = {
  online: 'bg-emerald-400/15 text-emerald-200 ring-1 ring-emerald-300/30',
  active: 'bg-cyan-400/15 text-cyan-200 ring-1 ring-cyan-300/30',
  idle: 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/30',
  offline: 'bg-red-400/15 text-red-200 ring-1 ring-red-300/30',
  completed: 'bg-violet-400/15 text-violet-200 ring-1 ring-violet-300/30',
}

export function StatusBadge({ value }: StatusBadgeProps) {
  const normalized = value?.toLowerCase() ?? 'unknown'
  const style = tones[normalized] ?? 'bg-zinc-500/20 text-zinc-200 ring-1 ring-zinc-400/30'

  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${style}`}>
      {value ?? 'Unknown'}
    </span>
  )
}
