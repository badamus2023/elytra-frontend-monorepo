/* eslint-disable react-refresh/only-export-components */
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { WorkspaceAuthProvider } from '@drones/shared/auth/WorkspaceAuthContext'
import { getAccessToken } from '@drones/shared/auth/session'
import { CustomerShell } from '@drones/shared/layouts/CustomerShell'
import { CartProvider } from '../cart/CartContext'
import { CustomerDashboardPage } from '../pages/CustomerDashboardPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { CustomerProfilePage } from '../pages/CustomerProfilePage'
import { GuestHomePage } from '../pages/GuestHomePage'
import { MyPackagesPage } from '../pages/MyPackagesPage'
import { OrderConfirmedPage } from '../pages/OrderConfirmedPage'
import { RestaurantDetailPage } from '../pages/RestaurantDetailPage'
import { RestaurantsPage } from '../pages/RestaurantsPage'
import { TrackDeliveryPage } from '../pages/TrackDeliveryPage'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { LoginPage } from './LoginPage'
import { RegisterPage } from './RegisterPage'
import { ResetPasswordPage } from './ResetPasswordPage'
import { VerifyEmailPage } from './VerifyEmailPage'
import { getRole, isCustomerAuthenticated, workspaceAuth } from '../auth/workspace'

const publicNav = [
  { to: '/', label: 'Home' },
  { to: '/restaurants', label: 'Restaurants' },
]

const fullNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/packages', label: 'My orders' },
  { to: '/track', label: 'Track delivery' },
  { to: '/profile', label: 'Profile' },
]

function guardCustomer() {
  return ({ location }: { location: { pathname: string } }) => {
    if (getRole() !== 'customer') {
      throw redirect({
        to: '/login',
        search: { next: location.pathname },
      })
    }
    if (!getAccessToken()) {
      throw redirect({
        to: '/login',
        search: { next: location.pathname },
      })
    }
  }
}

function CustomerLayout() {
  const isAuthenticated = isCustomerAuthenticated()

  return (
    <WorkspaceAuthProvider auth={workspaceAuth}>
      <CartProvider>
        <CustomerShell
          isAuthenticated={isAuthenticated}
          notificationsCount={isAuthenticated ? 2 : 0}
          navItems={isAuthenticated ? fullNav : publicNav}
        />
      </CartProvider>
    </WorkspaceAuthProvider>
  )
}

const rootRoute = createRootRoute({ component: () => <Outlet /> })

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (record: Record<string, unknown>) => ({
    next: typeof record.next === 'string' ? record.next : '/dashboard',
  }),
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  validateSearch: (record: Record<string, unknown>) => ({
    next: typeof record.next === 'string' ? record.next : '/dashboard',
  }),
  component: RegisterPage,
})

const verifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/verify-email',
  validateSearch: (record: Record<string, unknown>) => ({
    token: typeof record.token === 'string' ? record.token : undefined,
  }),
  component: VerifyEmailPage,
})

const authVerifyEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/verify-email',
  validateSearch: (record: Record<string, unknown>) => ({
    token: typeof record.token === 'string' ? record.token : undefined,
  }),
  component: VerifyEmailPage,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reset-password',
  validateSearch: (record: Record<string, unknown>) => ({
    token: typeof record.token === 'string' ? record.token : undefined,
  }),
  component: ResetPasswordPage,
})

const authResetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/reset-password',
  validateSearch: (record: Record<string, unknown>) => ({
    token: typeof record.token === 'string' ? record.token : undefined,
  }),
  component: ResetPasswordPage,
})

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'customer-app',
  component: CustomerLayout,
})

const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  beforeLoad: () => {
    if (isCustomerAuthenticated()) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: GuestHomePage,
})

const restaurantsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/restaurants',
  component: RestaurantsPage,
})

const restaurantDetailRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/restaurants/$restaurantId',
  component: RestaurantDetailPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/dashboard',
  beforeLoad: guardCustomer(),
  component: CustomerDashboardPage,
})

const packagesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/packages',
  beforeLoad: guardCustomer(),
  component: MyPackagesPage,
})

const trackRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/track',
  beforeLoad: guardCustomer(),
  component: TrackDeliveryPage,
  validateSearch: (search: Record<string, unknown>) => ({
    id: typeof search.id === 'string' ? search.id : undefined,
  }),
})

const profileRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/profile',
  beforeLoad: guardCustomer(),
  component: CustomerProfilePage,
})

const checkoutRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/checkout',
  beforeLoad: guardCustomer(),
  validateSearch: (search: Record<string, unknown>) => ({
    restaurantId:
      typeof search.restaurantId === 'string' ? search.restaurantId : undefined,
  }),
  component: CheckoutPage,
})

const orderConfirmedRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/order-confirmed',
  beforeLoad: guardCustomer(),
  validateSearch: (search: Record<string, unknown>) => ({
    orderId: typeof search.orderId === 'string' ? search.orderId : undefined,
    session_id: typeof search.session_id === 'string' ? search.session_id : undefined,
  }),
  component: OrderConfirmedPage,
})

const routeTree = rootRoute.addChildren([
  loginRoute,
  registerRoute,
  verifyEmailRoute,
  authVerifyEmailRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  authResetPasswordRoute,
  appRoute.addChildren([
    homeRoute,
    restaurantsRoute,
    restaurantDetailRoute,
    dashboardRoute,
    packagesRoute,
    trackRoute,
    checkoutRoute,
    orderConfirmedRoute,
    profileRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
