/* eslint-disable react-refresh/only-export-components */
import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import {
  Activity,
  BarChart3,
  Boxes,
  LayoutDashboard,
  Map,
  MapPin,
  MessageSquare,
  Plane,
  Truck,
  Users,
  Utensils,
  ClipboardCheck,
} from 'lucide-react'
import { WorkspaceAuthProvider } from '@drones/shared/auth/WorkspaceAuthContext'
import { getAccessToken } from '@drones/shared/auth/session'
import {
  AppShell,
} from '@drones/shared/layouts/AppShell'
import { useOperationalNotifications } from '@drones/shared/notifications/useOperationalNotifications'
import { AnalyticsDashboardPage } from '../pages/AnalyticsDashboardPage'
import { CustomersManagementPage } from '../pages/CustomersManagementPage'
import { DeliveryPointsPage } from '../pages/DeliveryPointsPage'
import { DronesManagementPage } from '../pages/DronesManagementPage'
import { FleetOverviewPage } from '../pages/FleetOverviewPage'
import { MissionsManagementPage } from '../pages/MissionsManagementPage'
import { PackagesManagementPage } from '../pages/PackagesManagementPage'
import { ReviewsManagementPage } from '../pages/ReviewsManagementPage'
import RestaurantManagementPage from '../pages/RestaurantManagmentPage'
import { RestaurantApplicationsPage } from '../pages/RestaurantApplicationsPage'
import { DroneDetailsPage } from '../pages/operator/DroneDetailsPage'
import { DronesListPage } from '../pages/operator/DronesListPage'
import { FlightsBoardPage } from '../pages/operator/FlightsBoardPage'
import { OperatorDashboardPage } from '../pages/operator/OperatorDashboardPage'
import { OperatorDispatchPage } from '../pages/operator/OperatorDispatchPage'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { LoginPage } from './LoginPage'
import { ResetPasswordPage } from './ResetPasswordPage'
import { getRole, workspaceAuth } from '../auth/workspace'

function guardAdmin() {
  return ({ location }: { location: { pathname: string } }) => {
    if (getRole() !== 'admin') {
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

function AdminLayout() {
  const { notifications } = useOperationalNotifications('admin')

  return (
    <WorkspaceAuthProvider auth={workspaceAuth}>
      <AppShell
        brandTitle="Admin Control Center"
        brandSubtitle="Drone Fleet Platform"
        workspaceLabel="Management"
        accent="violet"
        notifications={notifications}
        sections={[
          {
            heading: 'Overview',
            items: [
              {
                to: '/fleet-overview',
                label: 'Fleet overview',
                icon: <Activity size={16} />,
              },
              {
                to: '/analytics',
                label: 'Analytics',
                icon: <BarChart3 size={16} />,
              },
            ],
          },
          {
            heading: 'Operations',
            items: [
              {
                to: '/operations/dashboard',
                label: 'Ops dashboard',
                icon: <LayoutDashboard size={16} />,
              },
              {
                to: '/operations/flights-board',
                label: 'Flights board',
                icon: <Map size={16} />,
              },
              {
                to: '/operations/dispatch',
                label: 'Dispatch console',
                icon: <Truck size={16} />,
              },
              {
                to: '/operations/drones',
                label: 'Fleet list',
                icon: <Plane size={16} />,
              },
            ],
          },
          {
            heading: 'Fleet management',
            items: [
              {
                to: '/drones',
                label: 'Drones',
                icon: <Plane size={16} />,
              },
              {
                to: '/missions',
                label: 'Missions',
                icon: <Truck size={16} />,
              },
              {
                to: '/packages',
                label: 'Orders',
                icon: <Boxes size={16} />,
              },
              {
                to: '/restaurants',
                label: 'Restaurant catalog',
                icon: <Utensils size={16} />,
              },
              {
                to: '/restaurant-applications',
                label: 'Partner applications',
                icon: <ClipboardCheck size={16} />,
              },
              {
                to: '/delivery-points',
                label: 'Pickup points',
                icon: <MapPin size={16} />,
              },
              {
                to: '/reviews',
                label: 'Reviews',
                icon: <MessageSquare size={16} />,
              },
            ],
          },
          {
            heading: 'Access',
            items: [
              {
                to: '/customers',
                label: 'Customer signup',
                icon: <Users size={16} />,
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
    if (getRole() === 'admin' && getAccessToken()) {
      throw redirect({ to: '/fleet-overview' })
    }
    throw redirect({ to: '/login', search: { next: '/fleet-overview' } })
  },
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (record: Record<string, unknown>) => ({
    next: typeof record.next === 'string' ? record.next : '/fleet-overview',
  }),
  component: LoginPage,
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

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'admin-app',
  beforeLoad: guardAdmin(),
  component: AdminLayout,
})

const fleetOverviewRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/fleet-overview',
  component: FleetOverviewPage,
})

const analyticsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/analytics',
  component: AnalyticsDashboardPage,
})

const dronesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/drones',
  component: DronesManagementPage,
})

const missionsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/missions',
  component: MissionsManagementPage,
})

const packagesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/packages',
  component: PackagesManagementPage,
})

const customersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/customers',
  component: CustomersManagementPage,
})

const restaurantsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/restaurants',
  component: RestaurantManagementPage,
})
const restaurantApplicationsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/restaurant-applications',
  component: RestaurantApplicationsPage,
})

const deliveryPointsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/delivery-points',
  component: DeliveryPointsPage,
})

const reviewsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/reviews',
  component: ReviewsManagementPage,
})

const opsDashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/operations/dashboard',
  component: OperatorDashboardPage,
})

const opsFlightsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/operations/flights-board',
  component: FlightsBoardPage,
})

const opsDispatchRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/operations/dispatch',
  component: OperatorDispatchPage,
})

const opsDronesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/operations/drones',
  component: DronesListPage,
})

const opsDroneDetailsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/operations/drones/$droneId',
  component: DroneDetailsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  forgotPasswordRoute,
  resetPasswordRoute,
  appRoute.addChildren([
    fleetOverviewRoute,
    analyticsRoute,
    dronesRoute,
    missionsRoute,
    packagesRoute,
    customersRoute,
    restaurantsRoute,
    restaurantApplicationsRoute,
    deliveryPointsRoute,
    reviewsRoute,
    opsDashboardRoute,
    opsFlightsRoute,
    opsDispatchRoute,
    opsDronesRoute,
    opsDroneDetailsRoute,
  ]),
])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
