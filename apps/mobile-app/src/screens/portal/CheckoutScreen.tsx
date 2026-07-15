import { useState } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import { usePostApiOrders } from '../../api/generated/order/order';
import { useCart } from '../../cart/CartContext';
import { GradientButton } from '../../components/portal/GradientButton';
import {
  MutedText,
  PortalCard,
  PortalScreen,
} from '../../components/portal';
import type { RestaurantsStackParamList } from '../../navigation/types';
import { getErrorMessage } from '../../utils/getErrorMessage';

type Route = RouteProp<RestaurantsStackParamList, 'Checkout'>;
type Nav = NativeStackNavigationProp<RestaurantsStackParamList, 'Checkout'>;

const FieldLabel = styled.Text`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const FieldInput = styled.TextInput.attrs(({ theme }) => ({
  placeholderTextColor: theme.colors.placeholder,
}))`
  margin-top: 6px;
  margin-bottom: 12px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const LineRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  padding-vertical: 8px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.colors.divider};
`;

const LineName = styled.Text`
  flex: 1;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const LineMeta = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorText = styled.Text`
  margin-bottom: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.errorText};
`;

const CheckoutScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const cart = useCart();
  const createOrder = usePostApiOrders();
  const { restaurantId } = route.params;

  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryLatitude, setDeliveryLatitude] = useState('52.2297');
  const [deliveryLongitude, setDeliveryLongitude] = useState('21.0122');
  const [error, setError] = useState<string | null>(null);

  if (cart.restaurantId !== restaurantId || cart.lines.length === 0) {
    return (
      <PortalScreen>
        <PortalCard title="Cart is empty">
          <GradientButton title="Back to menu" onPress={() => navigation.goBack()} />
        </PortalCard>
      </PortalScreen>
    );
  }

  const onPlaceOrder = async () => {
    setError(null);
    const lat = Number(deliveryLatitude);
    const lng = Number(deliveryLongitude);

    if (!deliveryAddress.trim()) {
      setError('Delivery address is required.');
      return;
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setError('Enter valid delivery coordinates.');
      return;
    }

    try {
      await createOrder.mutateAsync({
        data: {
          restaurantId,
          deliveryAddress: deliveryAddress.trim(),
          deliveryLatitude: lat,
          deliveryLongitude: lng,
          items: cart.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        },
      });
      cart.clearCart();
      navigation.replace('OrderConfirmed', { orderId: 'pending' });
    } catch (err) {
      setError(getErrorMessage(err, 'Could not place your order.'));
    }
  };

  return (
    <PortalScreen keyboardShouldPersistTaps="handled">
      <PortalCard
        title="Checkout"
        description={`Order from ${cart.restaurantName ?? 'restaurant'}`}
      >
        {cart.lines.map((line) => (
          <LineRow key={line.productId}>
            <LineName>
              {line.quantity}× {line.name}
            </LineName>
            <LineMeta>{(line.price * line.quantity).toFixed(2)}</LineMeta>
          </LineRow>
        ))}
        <LineRow>
          <LineName>Total</LineName>
          <LineMeta>{cart.subtotal.toFixed(2)}</LineMeta>
        </LineRow>
      </PortalCard>

      <PortalCard title="Delivery details">
        <FieldLabel>Delivery address</FieldLabel>
        <FieldInput
          value={deliveryAddress}
          onChangeText={setDeliveryAddress}
          placeholder="Street, building, notes for the drone"
        />
        <FieldLabel>Latitude</FieldLabel>
        <FieldInput
          value={deliveryLatitude}
          onChangeText={setDeliveryLatitude}
          keyboardType="decimal-pad"
        />
        <FieldLabel>Longitude</FieldLabel>
        <FieldInput
          value={deliveryLongitude}
          onChangeText={setDeliveryLongitude}
          keyboardType="decimal-pad"
        />
        <MutedText>
          Set coordinates for your delivery landing zone. Native location picker can be added
          later.
        </MutedText>
        {error ? <ErrorText>{error}</ErrorText> : null}
        <GradientButton
          title="Place order"
          loading={createOrder.isPending}
          onPress={onPlaceOrder}
        />
      </PortalCard>
    </PortalScreen>
  );
};

export default CheckoutScreen;
