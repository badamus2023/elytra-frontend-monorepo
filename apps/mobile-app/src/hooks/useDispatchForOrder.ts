import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { DispatchResponse } from '../api/domain';
import { getApiDispatchesOrderOrderId } from '../api/generated/dispatch/dispatch';

export function useDispatchForOrder(orderId: string) {
  return useQuery({
    queryKey: ['dispatch', 'order', orderId],
    queryFn: async (): Promise<DispatchResponse | null> => {
      try {
        const raw: unknown = await getApiDispatchesOrderOrderId(orderId);
        if (!raw || typeof raw !== 'object') {
          return null;
        }
        return raw as DispatchResponse;
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(orderId),
    retry: false,
  });
}
