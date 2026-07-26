import type { OrderResponse } from './model';
import {
  getGetApiOrdersOrderIdQueryKey,
  getGetApiOrdersQueryKey,
} from './generated/order/order';
import { getGetApiDispatchesOrderOrderIdQueryKey } from './generated/dispatch/dispatch';
import { queryClient } from './queryClient';

export function markOrderCancelledInCache(orderId: string) {
  queryClient.setQueryData<OrderResponse[]>(
    getGetApiOrdersQueryKey(),
    (orders) =>
      orders?.map((order) =>
        order.id === orderId ? { ...order, status: 'Cancelled' } : order,
      ),
  );
  queryClient.setQueryData<OrderResponse>(
    getGetApiOrdersOrderIdQueryKey(orderId),
    (order) => (order ? { ...order, status: 'Cancelled' } : order),
  );
}

export async function refreshOrderCache(orderId?: string) {
  const invalidations = [
    queryClient.invalidateQueries({
      queryKey: getGetApiOrdersQueryKey(),
      refetchType: 'all',
    }),
  ];

  if (orderId) {
    invalidations.push(
      queryClient.invalidateQueries({
        queryKey: getGetApiOrdersOrderIdQueryKey(orderId),
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: getGetApiDispatchesOrderOrderIdQueryKey(orderId),
        refetchType: 'all',
      }),
      queryClient.invalidateQueries({
        queryKey: ['dispatch', 'order', orderId],
        refetchType: 'all',
      }),
    );
  }

  await Promise.all(invalidations);
}
