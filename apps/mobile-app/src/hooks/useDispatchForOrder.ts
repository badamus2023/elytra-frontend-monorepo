import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getApiDispatchesOrderOrderId } from '../api/generated/dispatch/dispatch';

export function useDispatchForOrder(orderId: string) {
  return useQuery({
    queryKey: ['dispatch', 'order', orderId],
    queryFn: async () => {
      try {
        return await getApiDispatchesOrderOrderId(orderId);
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
