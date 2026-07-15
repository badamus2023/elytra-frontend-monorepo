import { useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import styled from 'styled-components/native';
import {
  PortalCard,
  PortalKpi,
  PortalScreen,
  PortalStatusPill,
  TextLink,
  MutedText,
} from '../../components/portal';
import { useAuth } from '../../auth/AuthContext';
import { useOrders } from '../../hooks/useOrders';
import { useRestaurants } from '../../hooks/useRestaurants';
import type { PortalTabParamList } from '../../navigation/types';
import { orderDelivered, orderInAir } from '../../utils/orderStatus';

type Nav = BottomTabNavigationProp<PortalTabParamList, 'Dashboard'>;

const Hero = styled.View`
  border-radius: 24px;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.indigo};
`;

const HeroEyebrow = styled.Text`
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.heroEyebrow};
`;

const HeroTitle = styled.Text`
  margin-top: 8px;
  font-size: 26px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.white};
`;

const HeroBody = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.heroText};
`;

const HeroActions = styled.View`
  margin-top: 16px;
  flex-direction: row;
  gap: 20px;
`;

const KpiGrid = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
`;

const KpiHalf = styled.View`
  width: 48%;
  flex-grow: 1;
`;

const LinkInline = styled.Text`
  color: ${({ theme }) => theme.colors.link};
  font-weight: 600;
`;

const OrderRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-vertical: 12px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
`;

const OrderMain = styled.View`
  flex: 1;
`;

const OrderTitle = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const OrderMeta = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const HelpBox = styled.View<{ $spaced?: boolean }>`
  border-radius: ${({ theme }) => theme.radius.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.portalBg};
  padding: ${({ theme }) => theme.spacing.md}px;
  margin-top: ${({ $spaced, theme }) => ($spaced ? theme.spacing.md : 0)}px;
`;

const HelpTitle = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const HelpMeta = styled.Text`
  margin-top: 2px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const CustomerDashboardScreen = () => {
  const navigation = useNavigation<Nav>();
  const { displayName } = useAuth();
  const ordersQuery = useOrders();
  const restaurantsQuery = useRestaurants();
  const orders = ordersQuery.data ?? [];
  const restaurants = restaurantsQuery.data ?? [];

  const inTransit = useMemo(
    () => orders.filter((o) => orderInAir(o.status)).length,
    [orders],
  );
  const delivered = useMemo(
    () => orders.filter((o) => orderDelivered(o.status)).length,
    [orders],
  );

  return (
    <PortalScreen>
      <Hero>
        <HeroEyebrow>Welcome back</HeroEyebrow>
        <HeroTitle>Hello, {displayName}</HeroTitle>
        <HeroBody>
          Browse local restaurants, order by drone, and track your deliveries.
        </HeroBody>
        <HeroActions>
          <TextLink
            title="Browse restaurants →"
            onPress={() => navigation.navigate('Restaurants')}
          />
          <TextLink
            title="Track order"
            onPress={() => navigation.navigate('Track')}
          />
        </HeroActions>
      </Hero>

      <KpiGrid>
        <KpiHalf>
          <PortalKpi label="Total orders" value={orders.length} hint="All time" icon="📦" tone="sky" />
        </KpiHalf>
        <KpiHalf>
          <PortalKpi
            label="In the air"
            value={inTransit}
            hint="Dispatched or flying"
            icon="✈️"
            tone="violet"
          />
        </KpiHalf>
        <KpiHalf>
          <PortalKpi
            label="Delivered"
            value={delivered}
            hint="Completed"
            icon="🚚"
            tone="emerald"
          />
        </KpiHalf>
        <KpiHalf>
          <PortalKpi
            label="Restaurants"
            value={restaurants.length}
            hint="Available to order from"
            icon="🍽️"
            tone="amber"
          />
        </KpiHalf>
      </KpiGrid>

      <PortalCard
        title="Recent orders"
        description="Latest delivery requests for your account."
        action={
          <TextLink
            title="View all"
            onPress={() => navigation.navigate('MyOrders')}
          />
        }
      >
        {orders.length === 0 ? (
          <MutedText>
            You have no orders yet.{' '}
            <LinkInline onPress={() => navigation.navigate('Restaurants')}>
              Browse restaurants
            </LinkInline>{' '}
            to place your first order.
          </MutedText>
        ) : (
          orders.slice(0, 5).map((order) => (
            <OrderRow key={order.id}>
              <OrderMain>
                <OrderTitle>
                  {order.deliveryAddress || `Order ${order.id.slice(0, 8)}…`}
                </OrderTitle>
                <OrderMeta>
                  {order.items?.length ?? 0} line item(s) ·{' '}
                  {Number(order.totalAmount ?? 0).toFixed(2)} total
                </OrderMeta>
              </OrderMain>
              <PortalStatusPill value={order.status} />
            </OrderRow>
          ))
        )}
      </PortalCard>

      <PortalCard title="Need help?" description="We are here for you.">
        <HelpBox>
          <HelpTitle>Live chat</HelpTitle>
          <HelpMeta>Average response under 2 minutes.</HelpMeta>
        </HelpBox>
        <HelpBox $spaced>
          <HelpTitle>Phone</HelpTitle>
          <HelpMeta>+48 22 555 01 02</HelpMeta>
        </HelpBox>
      </PortalCard>
    </PortalScreen>
  );
};

export default CustomerDashboardScreen;
