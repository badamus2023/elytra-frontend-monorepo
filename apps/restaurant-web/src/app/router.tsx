/* eslint-disable react-refresh/only-export-components */
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import {
  LayoutDashboard,
  MessageSquare,
  ShoppingBag,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import { WorkspaceAuthProvider } from '@drones/shared/auth/WorkspaceAuthContext'
import { getAccessToken } from '@drones/shared/auth/session'
import { AppShell } from '@drones/shared/layouts/AppShell'
import { useOperationalNotifications } from '@drones/shared/notifications/useOperationalNotifications'
import { MenuManagementPage } from '../pages/MenuManagementPage'
import { OwnerDashboardPage } from '../pages/OwnerDashboardPage'
import { OwnerOrdersPage } from '../pages/OwnerOrdersPage'
import { OwnerRestaurantPage } from '../pages/OwnerRestaurantPage'
import { OwnerReviewsPage } from '../pages/OwnerReviewsPage'
import { LoginPage } from './LoginPage'
import { getRole, workspaceAuth } from '../auth/workspace'

function guardOwner() {
  return ({ location }: { location: { pathname: string } }) => {
    if (getRole() !== 'restaurantOwner') {
      throw redirect({ to: '/login', search: { next: location.pathname } })
    }
    if (!getAccessToken()) {
      throw redirect({
        to: '/login',
        search: { next: location.pathname },
      })
    }
  }
}

function OwnerLayout() {
  const { notifications } = useOperationalNotifications('restaurant')

  return (
    <WorkspaceAuthProvider auth={workspaceAuth}>
      <AppShell
        brandTitle="Restaurant Owner"
        brandSubtitle="Partner portal"
        workspaceLabel="Owner"
        accent="amber"
        notifications={notifications}
        sections={[
          {
            heading: 'Workspace',
            items: [
              {
                to: '/dashboard',
                label: 'Dashboard',
                icon: <LayoutDashboard size={16} />,
              },
              {
                to: '/orders',
                label: 'Orders',
                icon: <ShoppingBag size={16} />,
              },
              {
                to: '/menu',
                label: 'Menu',
                icon: <UtensilsCrossed size={16} />,
              },
              {
                to: '/restaurant',
                label: 'Restaurant',
                icon: <Store size={16} />,
              },
              {
                to: '/reviews',
                label: 'Reviews',
                icon: <MessageSquare size={16} />,
              },
            ],
          },
        ]}
      />
    </WorkspaceAuthProvider>
  )
}

const rootRoute = createRootRoute({ component: () => <Outlet /> })

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (getRole() === 'restaurantOwner' && getAccessToken()) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/login', search: { next: '/dashboard' } })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (record: Record<string, unknown>) => ({
    next: typeof record.next === 'string' ? record.next : '/dashboard',
  }),
  component: LoginPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'owner-app',
  beforeLoad: guardOwner(),
  component: OwnerLayout,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  component: OwnerDashboardPage,
})

const ordersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/orders',
  component: OwnerOrdersPage,
})

const menuRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/menu',
  component: MenuManagementPage,
})

const restaurantRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/restaurant',
  component: OwnerRestaurantPage,
})

const reviewsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/reviews',
  component: OwnerReviewsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  appRoute.addChildren([
    dashboardRoute,
    ordersRoute,
    menuRoute,
    restaurantRoute,
    reviewsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
