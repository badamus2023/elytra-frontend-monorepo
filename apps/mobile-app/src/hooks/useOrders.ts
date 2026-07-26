import { useMemo } from 'react';
import {
  useGetApiOrders,
  useGetApiOrdersOrderId,
} from '../api/generated/order/order';

export function useOrders() {
  const query = useGetApiOrders();
  const orders = useMemo(
    () => query.data ?? [],
    [query.data],
  );

  return { ...query, data: orders };
}

export function useOrder(orderId: string) {
  const query = useGetApiOrdersOrderId(orderId, {
    query: { enabled: Boolean(orderId) },
  } as Parameters<typeof useGetApiOrdersOrderId>[1]);
  return query;
}
