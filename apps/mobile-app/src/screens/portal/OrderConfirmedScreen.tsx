import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import { GradientButton } from '../../components/portal/GradientButton';
import { PortalCard, PortalScreen } from '../../components/portal';
import type { PortalTabParamList } from '../../navigation/types';
import type { RestaurantsStackParamList } from '../../navigation/types';

type Route = RouteProp<RestaurantsStackParamList, 'OrderConfirmed'>;
type Nav = NativeStackNavigationProp<RestaurantsStackParamList, 'OrderConfirmed'>;

const Body = styled.Text`
  font-size: 14px;
  line-height: 20px;
  color: ${({ theme }) => theme.colors.textSubtle};
`;

const Actions = styled.View`
  margin-top: ${({ theme }) => theme.spacing.lg}px;
  flex-direction: row;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.sm}px;
`;

const OrderConfirmedScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { orderId } = route.params;

  return (
    <PortalScreen>
      <PortalCard title="Order placed!" description="Your order has been submitted.">
        <Body>
          {orderId !== 'pending'
            ? `Order id: ${orderId}`
            : 'Check My orders for your latest delivery request.'}
        </Body>
        <Actions>
          <GradientButton
            title="Track delivery"
            size="compact"
            fullWidth={false}
            onPress={() => {
              const parent = navigation.getParent();
              parent?.navigate('Track' as keyof PortalTabParamList, {
                orderId: orderId !== 'pending' ? orderId : undefined,
              });
            }}
          />
          <GradientButton
            title="Browse restaurants"
            variant="outline"
            size="compact"
            fullWidth={false}
            onPress={() => navigation.popToTop()}
          />
        </Actions>
      </PortalCard>
    </PortalScreen>
  );
};

export default OrderConfirmedScreen;
