import { useEffect, useState } from 'react';
import { Pressable } from 'react-native';
import Config from 'react-native-config';
import { useStripe } from '@stripe/stripe-react-native';
import { useMutation } from '@tanstack/react-query';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import styled from 'styled-components/native';
import { useGetApiDeliveryPoints } from '../../api/generated/delivery-point/delivery-point';
import { usePostApiOrders } from '../../api/generated/order/order';
import { useCart } from '../../cart/CartContext';
import { GradientButton } from '../../components/portal/GradientButton';
import {
  MutedText,
  PortalCard,
  PortalScreen,
} from '../../components/portal';
import type { RestaurantsStackParamList } from '../../navigation/types';
import {
  confirmMobilePaymentIntent,
  createMobilePaymentIntent,
} from '../../payments/mobilePayments';
import { refreshOrderCache } from '../../api/orderCache';
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
  min-width: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const LineMeta = styled.Text`
  flex-shrink: 0;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ErrorText = styled.Text`
  margin-bottom: 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.errorText};
`;

const PointOption = styled(Pressable)<{ $selected: boolean }>`
  margin-bottom: 8px;
  border-width: 1px;
  border-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.primary : theme.colors.inputBorder};
  border-radius: ${({ theme }) => theme.radius.md}px;
  background-color: ${({ theme, $selected }) =>
    $selected ? theme.colors.successBg : theme.colors.white};
  padding: 12px;
`;

const PointName = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const PointAddress = styled.Text`
  margin-top: 4px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const CheckoutScreen = () => {
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const cart = useCart();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const createOrder = usePostApiOrders();
  const createPaymentIntent = useMutation({
    mutationFn: createMobilePaymentIntent,
  });
  const confirmPaymentIntent = useMutation({
    mutationFn: confirmMobilePaymentIntent,
  });
  const { data: deliveryPoints, isLoading: pointsLoading } = useGetApiDeliveryPoints();
  const { restaurantId } = route.params;

  const [deliveryPointId, setDeliveryPointId] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [submittedPaymentIntentId, setSubmittedPaymentIntentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (!deliveryPointId && deliveryPoints?.length) {
      const first = deliveryPoints.find((point) => point.id);
      if (first?.id) setDeliveryPointId(first.id);
    }
  }, [deliveryPoints, deliveryPointId]);

  if (cart.restaurantId !== restaurantId || cart.lines.length === 0) {
    return (
      <PortalScreen>
        <PortalCard title="Cart is empty">
          <GradientButton
            title="Back to menu"
            size="compact"
            fullWidth={false}
            onPress={() => navigation.goBack()}
          />
        </PortalCard>
      </PortalScreen>
    );
  }

  const onPlaceOrder = async () => {
    setError(null);

    if (!deliveryPointId) {
      setError('Select a pickup point for your delivery.');
      return;
    }

    try {
      if (!Config.STRIPE_PUBLISHABLE_KEY?.trim()) {
        setError(
          'Stripe is not configured. Set STRIPE_PUBLISHABLE_KEY and rebuild the app.',
        );
        return;
      }

      if (createdOrderId && submittedPaymentIntentId) {
        const payment = await confirmPaymentIntent.mutateAsync(
          submittedPaymentIntentId,
        );
        if (payment.paymentStatus?.toLowerCase() !== 'completed') {
          throw new Error('Stripe payment confirmation is still pending.');
        }

        await refreshOrderCache(createdOrderId);
        cart.clearCart();
        navigation.replace('OrderConfirmed', { orderId: createdOrderId });
        return;
      }

      let orderId = createdOrderId;
      if (!orderId) {
        const order = await createOrder.mutateAsync({
          data: {
            restaurantId,
            deliveryPointId,
            ...(deliveryNotes.trim()
              ? { deliveryAddress: deliveryNotes.trim() }
              : {}),
            items: cart.lines.map((line) => ({
              productId: line.productId,
              quantity: line.quantity,
            })),
          },
        });

        if (!order.id) {
          throw new Error('Order was created but no order id was returned.');
        }
        orderId = order.id;
        setCreatedOrderId(orderId);
      }

      const intent = await createPaymentIntent.mutateAsync(orderId);
      if (!intent.clientSecret || !intent.paymentIntentId) {
        throw new Error('Stripe did not return the payment details.');
      }

      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Drones',
        paymentIntentClientSecret: intent.clientSecret,
        returnURL: 'drones://stripe-redirect',
      });
      if (initError) {
        throw new Error(initError.message);
      }

      const { error: paymentError } = await presentPaymentSheet();
      if (paymentError) {
        if (paymentError.code === 'Canceled') {
          setError('Payment was cancelled. Tap Pay with Stripe to try again.');
          return;
        }
        throw new Error(paymentError.message);
      }

      setSubmittedPaymentIntentId(intent.paymentIntentId);
      const payment = await confirmPaymentIntent.mutateAsync(intent.paymentIntentId);
      if (payment.paymentStatus?.toLowerCase() !== 'completed') {
        throw new Error('Stripe completed the payment, but confirmation is still pending.');
      }

      await refreshOrderCache(orderId);
      cart.clearCart();
      navigation.replace('OrderConfirmed', { orderId });
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
        <FieldLabel>Pickup point</FieldLabel>
        {pointsLoading ? (
          <MutedText>Loading pickup points…</MutedText>
        ) : (deliveryPoints ?? []).length === 0 ? (
          <MutedText>No pickup points are available yet.</MutedText>
        ) : (
          (deliveryPoints ?? []).map((point) => {
            if (!point.id) return null;
            const selected = deliveryPointId === point.id;
            return (
              <PointOption
                key={point.id}
                $selected={selected}
                onPress={() => setDeliveryPointId(point.id!)}
              >
                <PointName>{point.name}</PointName>
                <PointAddress>{point.address}</PointAddress>
              </PointOption>
            );
          })
        )}
        <FieldLabel>Delivery notes (optional)</FieldLabel>
        <FieldInput
          value={deliveryNotes}
          onChangeText={setDeliveryNotes}
          placeholder="Gate code, landmark, etc."
        />
        {error ? <ErrorText>{error}</ErrorText> : null}
        <GradientButton
          title="Pay with Stripe"
          variant="checkout"
          loading={
            createOrder.isPending ||
            createPaymentIntent.isPending ||
            confirmPaymentIntent.isPending
          }
          disabled={
            pointsLoading ||
            (deliveryPoints ?? []).length === 0 ||
            !deliveryPointId
          }
          onPress={onPlaceOrder}
        />
      </PortalCard>
    </PortalScreen>
  );
};

export default CheckoutScreen;
