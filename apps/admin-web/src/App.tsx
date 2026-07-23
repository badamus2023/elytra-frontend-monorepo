import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './app/router'
import { ToastProvider } from '@drones/shared/notifications/ToastProvider'
import { RealtimeNotifications } from '@drones/shared/notifications/RealtimeNotifications'
import { emitMutationSuccess } from '@drones/shared/notifications/toastBus'

const queryClient = new QueryClient({
  mutationCache: new MutationCache({ onSuccess: () => emitMutationSuccess() }),
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RealtimeNotifications>
          <RouterProvider router={router} />
        </RealtimeNotifications>
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
