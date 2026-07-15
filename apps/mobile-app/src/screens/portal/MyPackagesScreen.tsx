import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import styled from 'styled-components/native';
import {
  PortalCard,
  PortalScreen,
  PortalStatusPill,
  SegmentedControl,
  TextLink,
  PortalSearchInput,
  EmptyText,
} from '../../components/portal';
import { useOrders } from '../../hooks/useOrders';
import type { PortalTabParamList } from '../../navigation/types';
import type { OrderFilter } from '../../utils/orderStatus';
import { matchesOrderFilter } from '../../utils/orderStatus';

type Nav = BottomTabNavigationProp<PortalTabParamList, 'MyOrders'>;

const FILTERS: OrderFilter[] = ['all', 'active', 'done'];

const Row = styled.View`
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
`;

const RowMain = styled.View`
  flex: 1;
`;

const RowEnd = styled.View`
  align-items: flex-end;
  gap: 8px;
`;

const OrderId = styled.Text`
  font-family: Menlo;
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const Address = styled.Text`
  margin-top: 2px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const Total = styled.Text`
  margin-top: 2px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const MyPackagesScreen = () => {
  const navigation = useNavigation<Nav>();
  const ordersQuery = useOrders();
  const orders = ordersQuery.data ?? [];
  const [filter, setFilter] = useState<OrderFilter>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return orders
      .filter((order) => matchesOrderFilter(order.status, filter))
      .filter((order) => {
        if (!search.trim()) {
          return true;
        }
        const t = search.toLowerCase();
        return (
          order.id.toLowerCase().includes(t) ||
          (order.deliveryAddress ?? '').toLowerCase().includes(t)
        );
      });
  }, [orders, filter, search]);

  return (
    <PortalScreen>
      <PortalCard
        title="My orders"
        description="All your delivery orders."
      >
        <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} />
        <PortalSearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by id or address..."
        />
        {filtered.length === 0 ? (
          <EmptyText>
            {orders.length === 0
              ? 'You have no orders yet. Browse Restaurants to place your first order.'
              : 'No orders match your filter.'}
          </EmptyText>
        ) : (
          filtered.map((item) => (
            <Row key={item.id}>
              <RowMain>
                <OrderId>{item.id.slice(0, 8)}…</OrderId>
                <Address>{item.deliveryAddress || '—'}</Address>
                <Total>{Number(item.totalAmount ?? 0).toFixed(2)}</Total>
              </RowMain>
              <RowEnd>
                <PortalStatusPill value={item.status} />
                <TextLink
                  title="Track"
                  onPress={() =>
                    navigation.navigate('Track', { orderId: item.id })
                  }
                />
              </RowEnd>
            </Row>
          ))
        )}
      </PortalCard>
    </PortalScreen>
  );
};

export default MyPackagesScreen;
