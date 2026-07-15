import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { PlaneTakeoff } from 'lucide-react'

type AuthPageLayoutProps = {
  eyebrow?: string
  title: string
  description: string
  children: ReactNode
  footerLinks?: ReactNode
}

export function AuthPageLayout({
  eyebrow,
  title,
  description,
  children,
  footerLinks,
}: AuthPageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
              <PlaneTakeoff size={18} />
            </span>
            <span className="leading-tight">
              <span className="block text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Drone Fleet
              </span>
              <span className="block text-base font-semibold text-slate-900">
                Customer Portal
              </span>
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
          {children}
        </section>
        {footerLinks ? (
          <div className="mt-6 text-center text-sm text-slate-500">{footerLinks}</div>
        ) : null}
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-slate-600 md:grid-cols-3">
          <div>
            <p className="text-base font-semibold text-slate-900">Drone Fleet</p>
            <p className="mt-1 text-xs text-slate-500">
              Fast, eco-friendly aerial deliveries across major cities.
            </p>
          </div>
          <div>
            <p className="font-medium text-slate-900">Help</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>support@drone-fleet.example</li>
              <li>+48 22 555 01 02</li>
              <li>Mon-Fri 8:00 - 18:00</li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-slate-900">Legal</p>
            <ul className="mt-2 space-y-1 text-xs">
              <li>Terms of service</li>
              <li>Privacy policy</li>
              <li>(c) {new Date().getFullYear()} Drone Fleet sp. z o.o.</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  )
}

export const authInputClass =
  'mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20'

export const authLabelClass = 'block text-sm font-medium text-slate-700'

export const authPrimaryButtonClass =
  'w-full rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-sky-600 hover:to-indigo-700 disabled:opacity-50'

export const authErrorClass =
  'rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'

export const authSuccessClass =
  'rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800'

export const authInfoClass =
  'rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-800'

export const authLinkClass = 'font-semibold text-sky-700 hover:underline'
