import { useRef, useState } from 'react'
import { Link, Outlet, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  ChevronDown,
  HelpCircle,
  LogIn,
  LogOut,
  Menu,
  PlaneTakeoff,
  UserPlus,
  X,
} from 'lucide-react'
import { useWorkspaceAuth } from '../auth/WorkspaceAuthContext'
import { useNotificationReadState } from '../notifications/useNotificationReadState'
import { useDismissOnClickOutside } from '../hooks/useDismissOnClickOutside'
import type { AppNotification } from './AppShell'

type CustomerNavItem = {
  to: string
  label: string
}

type CustomerShellProps = {
  navItems: CustomerNavItem[]
  notifications: AppNotification[]
  isAuthenticated: boolean
}

const severityDot: Record<AppNotification['severity'], string> = {
  info: 'bg-sky-500',
  warning: 'bg-amber-500',
  critical: 'bg-rose-500',
}

export function CustomerShell({
  navItems,
  notifications,
  isAuthenticated,
}: CustomerShellProps) {
  const { getUserName, clearRole } = useWorkspaceAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const [notifyOpen, setNotifyOpen] = useState(false)
  const userName = getUserName()
  const routerState = useRouterState()
  const pathname = routerState.location.pathname
  const authNext = pathname.startsWith('/') ? pathname : '/'
  const { unreadCount, markAllAsRead } = useNotificationReadState(notifications)
  const notifyRef = useRef<HTMLDivElement>(null)

  useDismissOnClickOutside(notifyRef, notifyOpen, () => setNotifyOpen(false))

  const [trackedPath, setTrackedPath] = useState(pathname)
  if (trackedPath !== pathname) {
    setTrackedPath(pathname)
    setMobileOpen(false)
    setAccountOpen(false)
    setNotifyOpen(false)
  }

  const handleLogout = () => {
    clearRole()
    window.location.href = '/'
  }

  const logoTo = isAuthenticated ? '/dashboard' : '/'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-sky-600 focus:px-3 focus:py-1 focus:text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
          <Link to={logoTo} className="flex items-center gap-2">
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

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                activeProps={{
                  className:
                    'bg-sky-50 text-sky-700 hover:bg-sky-50 hover:text-sky-700',
                }}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {isAuthenticated ? (
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
                    setAccountOpen(false)
                  }}
                  className="relative rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 min-w-[18px] rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </button>

                {notifyOpen ? (
                  <div className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                    <div className="border-b border-slate-100 px-4 py-2">
                      <p className="text-sm font-semibold text-slate-900">
                        Notifications
                      </p>
                      <p className="text-xs text-slate-500">
                        {unreadCount > 0
                          ? `${unreadCount} unread`
                          : notifications.length > 0
                            ? `${notifications.length} recent update${notifications.length === 1 ? '' : 's'}`
                            : 'No updates right now'}
                      </p>
                    </div>
                    <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <li className="px-4 py-6 text-center text-xs text-slate-500">
                          No updates right now
                        </li>
                      ) : (
                        notifications.map((notification) => (
                          <li key={notification.id} className="px-4 py-3">
                            <div className="flex items-start gap-2">
                              <span
                                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${severityDot[notification.severity]}`}
                              />
                              <div>
                                <p className="text-sm font-medium text-slate-900">
                                  {notification.title}
                                </p>
                                <p className="text-xs text-slate-500">
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
            ) : null}

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setAccountOpen((value) => !value)
                  setNotifyOpen(false)
                }}
                className="flex items-center gap-2 rounded-md border border-slate-200 px-2 py-1.5 hover:bg-slate-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-xs font-bold text-white">
                  {isAuthenticated ? initials(userName) : '?'}
                </span>
                <span className="hidden text-xs leading-tight md:block">
                  <span className="block font-medium text-slate-900">
                    {isAuthenticated ? userName : 'Guest'}
                  </span>
                  <span className="block text-[10px] uppercase tracking-wide text-slate-500">
                    {isAuthenticated ? 'Customer' : 'Account'}
                  </span>
                </span>
                <ChevronDown size={14} className="hidden text-slate-500 md:block" />
              </button>

              {accountOpen ? (
                <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                  {isAuthenticated ? (
                    <>
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {userName}
                        </p>
                        <p className="text-xs text-slate-500">Customer account</p>
                      </div>
                      <Link
                        to="/profile"
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <HelpCircle size={14} /> My profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut size={14} /> Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-sm font-semibold text-slate-900">Guest</p>
                        <p className="text-xs text-slate-500">
                          Sign in to order and track deliveries
                        </p>
                      </div>
                      <Link
                        to="/login"
                        search={{ next: authNext }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <LogIn size={14} /> Sign in
                      </Link>
                      <Link
                        to="/register"
                        search={{ next: authNext }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      >
                        <UserPlus size={14} /> Create account
                      </Link>
                    </>
                  )}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((value) => !value)}
              className="rounded-md border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <nav className="border-t border-slate-200 bg-white px-4 py-3 lg:hidden">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="block rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    activeProps={{
                      className: 'bg-sky-50 text-sky-700 hover:bg-sky-50',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
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

function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) {
    return '?'
  }
  const first = parts[0]?.charAt(0) ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : ''
  return (first + last).toUpperCase() || '?'
}
