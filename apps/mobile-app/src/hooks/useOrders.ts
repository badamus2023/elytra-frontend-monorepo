import { useMemo } from 'react';
import {
  useGetApiOrders,
  useGetApiOrdersOrderId,
} from '../api/generated/order/order';
import type { OrderResponse } from '../api/domain';

export function useOrders() {
  const query = useGetApiOrders();
  const orders = useMemo(
    () => (query.data as OrderResponse[] | undefined) ?? [],
    [query.data],
  );

  return { ...query, data: orders };
}

export function useOrder(orderId: string) {
  const query = useGetApiOrdersOrderId(orderId, {
    query: { enabled: Boolean(orderId) },
  } as Parameters<typeof useGetApiOrdersOrderId>[1]);
  const data = query.data as OrderResponse | undefined;
  return { ...query, data };
}
