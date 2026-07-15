import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  Link,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { useNotificationReadState } from '../notifications/useNotificationReadState'
import {
  Bell,
  ChevronRight,
  LogOut,
  Menu,
  Search,
  Settings,
  X,
} from 'lucide-react'
import { useWorkspaceAuth } from '../auth/WorkspaceAuthContext'
import { useDismissOnClickOutside } from '../hooks/useDismissOnClickOutside'

export type NavLink = {
  to: string
  label: string
  icon: ReactNode
}

export type NavSection = {
  heading: string
  items: NavLink[]
}

export type AppNotification = {
  id: string
  title: string
  description: string
  severity: 'info' | 'warning' | 'critical'
}

type Accent = 'cyan' | 'violet' | 'amber'

type AppShellProps = {
  brandTitle: string
  brandSubtitle: string
  workspaceLabel: string
  sections: NavSection[]
  notifications: AppNotification[]
  accent: Accent
}

const accentMap: Record<
  Accent,
  {
    badge: string
    activeNav: string
    iconActive: string
    chip: string
    headline: string
  }
> = {
  cyan: {
    badge: 'bg-cyan-500/15 text-cyan-200 ring-1 ring-cyan-300/30',
    activeNav: 'bg-cyan-500/15 text-cyan-100 ring-1 ring-inset ring-cyan-300/30',
    iconActive: 'text-cyan-300',
    chip: 'bg-cyan-500/10 text-cyan-200 ring-1 ring-cyan-300/30',
    headline: 'text-cyan-100',
  },
  violet: {
    badge: 'bg-violet-500/15 text-violet-200 ring-1 ring-violet-300/30',
    activeNav:
      'bg-violet-500/15 text-violet-100 ring-1 ring-inset ring-violet-300/30',
    iconActive: 'text-violet-300',
    chip: 'bg-violet-500/10 text-violet-200 ring-1 ring-violet-300/30',
    headline: 'text-violet-100',
  },
  amber: {
    badge: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-300/30',
    activeNav:
      'bg-amber-500/15 text-amber-100 ring-1 ring-inset ring-amber-300/30',
    iconActive: 'text-amber-300',
    chip: 'bg-amber-500/10 text-amber-200 ring-1 ring-amber-300/30',
    headline: 'text-amber-100',
  },
}

const severityChip: Record<AppNotification['severity'], string> = {
  info: 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-300/30',
  warning: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-300/30',
  critical: 'bg-red-500/15 text-red-200 ring-1 ring-red-300/30',
}

export function AppShell({
  brandTitle,
  brandSubtitle,
  workspaceLabel,
  sections,
  notifications,
  accent,
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const { getRole, getUserName, clearRole } = useWorkspaceAuth()
  const role = getRole()
  const userName = getUserName()
  const colors = accentMap[accent]
  const { unreadCount, markAllAsRead } = useNotificationReadState(notifications)
  const notifyRef = useRef<HTMLDivElement>(null)

  useDismissOnClickOutside(notifyRef, notifyOpen, () => setNotifyOpen(false))

  const routerState = useRouterState()
  const pathname = routerState.location.pathname

  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname, sections), [
    pathname,
    sections,
  ])
  const currentTitle = breadcrumbs[breadcrumbs.length - 1]?.label ?? brandTitle

  const [trackedPath, setTrackedPath] = useState(pathname)
  if (trackedPath !== pathname) {
    setTrackedPath(pathname)
    setMobileOpen(false)
    setNotifyOpen(false)
    setUserOpen(false)
  }

  const handleLogout = () => {
    clearRole()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            className="rounded-md border border-white/10 p-2 text-zinc-200 hover:bg-white/10 lg:hidden"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-md font-bold ${colors.badge}`}
              aria-hidden
            >
              DF
            </div>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                {brandSubtitle}
              </p>
              <p className={`text-sm font-semibold ${colors.headline}`}>
                {brandTitle}
              </p>
            </div>
          </div>

          <span
            className={`ml-2 hidden rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide md:inline-flex ${colors.chip}`}
          >
            {workspaceLabel}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden md:block">
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <input
                type="search"
                placeholder="Search drones, missions, packages..."
                className="w-72 rounded-md border border-white/10 bg-zinc-900/70 py-1.5 pl-8 pr-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/20 focus:outline-none"
              />
            </div>

            <div className="relative" ref={notifyRef}>
              <button
                type="button"
                onClick={() => {
                  setNotifyOpen((value) => {
                    const opening = !value
                    if (opening) {
                      markAllAsRead()
                    }
                    return opening
                  })
                  setUserOpen(false)
                }}
                className="relative rounded-md border border-white/10 p-2 text-zinc-200 hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell size={16} />
                {unreadCount > 0 ? (
                  <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </button>

              {notifyOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-xl">
                  <div className="border-b border-white/10 px-4 py-2">
                    <p className="text-sm font-semibold text-zinc-100">
                      Notifications
                    </p>
                    <p className="text-xs text-zinc-400">
                      {unreadCount > 0
                        ? `${unreadCount} unread`
                        : notifications.length > 0
                          ? `${notifications.length} recent alert${notifications.length === 1 ? '' : 's'}`
                          : 'No active alerts'}
                    </p>
                  </div>
                  <ul className="max-h-72 divide-y divide-white/5 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-6 text-center text-xs text-zinc-500">
                        Nothing new. All systems nominal.
                      </li>
                    ) : (
                      notifications.map((notification) => (
                        <li key={notification.id} className="px-4 py-3">
                          <div className="flex items-start gap-2">
                            <span
                              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${severityChip[notification.severity]}`}
                            />
                            <div>
                              <p className="text-sm font-medium text-zinc-100">
                                {notification.title}
                              </p>
                              <p className="text-xs text-zinc-400">
                                {notification.description}
                              </p>
                            </div>
                          </div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ) : null}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserOpen((value) => !value)
                  setNotifyOpen(false)
                }}
                className="flex items-center gap-2 rounded-md border border-white/10 bg-zinc-900/60 px-2 py-1.5 text-left hover:bg-white/10"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${colors.badge}`}
                >
                  {initials(userName)}
                </span>
                <span className="hidden text-xs leading-tight md:block">
                  <span className="block font-medium text-zinc-100">
                    {userName}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wide text-zinc-400">
                    {role ?? 'guest'}
                  </span>
                </span>
              </button>

              {userOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-lg border border-white/10 bg-zinc-900 shadow-xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <p className="text-sm font-medium text-zinc-100">
                      {userName}
                    </p>
                    <p className="text-xs text-zinc-400 capitalize">
                      Signed in as {role ?? 'guest'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                  >
                    <Settings size={14} /> Settings
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-200 hover:bg-red-500/10"
                  >
                    <LogOut size={14} /> Logout
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 lg:grid lg:grid-cols-[240px_1fr]">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/10 bg-zinc-950/95 p-4 transition-transform duration-200 lg:static lg:z-auto lg:block lg:translate-x-0 lg:rounded-xl lg:border lg:bg-zinc-900/60 ${
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <nav className="space-y-5">
            {sections.map((section) => (
              <div key={section.heading}>
                <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {section.heading}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-white/5"
                        activeProps={{ className: colors.activeNav }}
                      >
                        <span
                          className={`text-zinc-500 group-hover:text-zinc-200 ${colors.iconActive}`}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {mobileOpen ? (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
        ) : null}

        <main className="min-w-0 space-y-5">
          <div className="space-y-1">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1 text-xs text-zinc-500"
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={crumb.to} className="flex items-center gap-1">
                  {index > 0 ? (
                    <ChevronRight size={12} className="text-zinc-600" />
                  ) : null}
                  {index < breadcrumbs.length - 1 ? (
                    <Link to={crumb.to} className="hover:text-zinc-200">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-zinc-300">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
            <h1 className="text-xl font-semibold text-zinc-100 md:text-2xl">
              {currentTitle}
            </h1>
          </div>

          <Outlet />
        </main>
      </div>

      <footer className="mx-auto max-w-7xl px-4 pb-6 pt-4 text-center text-[11px] text-zinc-500">
        <p>
          {brandTitle} &middot; v1.0.0 &middot; (c) {new Date().getFullYear()}
          {' '}Drone Fleet Management System
        </p>
      </footer>
    </div>
  )
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) {
    return '?'
  }
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return (first + last).toUpperCase() || '?'
}

function buildBreadcrumbs(
  pathname: string,
  sections: NavSection[],
): Array<{ to: string; label: string }> {
  const allItems = sections.flatMap((section) => section.items)
  const root = pathname.split('/').filter(Boolean)[0]
  const home = allItems[0]
  const homeCrumb = home
    ? { to: home.to, label: capitalize(root ?? 'home') }
    : { to: '/', label: 'Home' }

  const exact = allItems.find((item) => item.to === pathname)
  if (exact) {
    return [homeCrumb, { to: exact.to, label: exact.label }]
  }

  const partial = allItems.find((item) => pathname.startsWith(item.to))
  if (partial) {
    return [homeCrumb, { to: partial.to, label: partial.label }]
  }

  return [homeCrumb]
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
