import { MutationCache, QueryClient } from '@tanstack/react-query';
import { emitMutationSuccess } from '../notifications/toastBus';

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => emitMutationSuccess(),
  }),
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});
