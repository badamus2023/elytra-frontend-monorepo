import type { ReactNode } from 'react'

type ChartCardProps = {
  title: string
  description?: string
  children: ReactNode
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <article className="rounded-xl border border-white/10 bg-zinc-900/70 p-4">
      <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      ) : null}
      <div className="mt-4 [&_.recharts-active-bar]:opacity-100 [&_.recharts-bar-rectangle]:outline-none [&_.recharts-cartesian-grid-horizontal_line]:stroke-zinc-700/80 [&_.recharts-cartesian-grid-vertical_line]:stroke-zinc-700/80 [&_.recharts-surface]:outline-none [&_.recharts-tooltip-cursor]:fill-white/[0.04] [&_.recharts-tooltip-cursor]:stroke-white/[0.06]">
        {children}
      </div>
    </article>
  )
}
