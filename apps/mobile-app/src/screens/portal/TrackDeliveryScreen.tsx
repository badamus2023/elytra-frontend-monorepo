import { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import styled from 'styled-components/native';
import { DeliveryMap } from '../../components/map';
import {
  GradientButton,
  PortalCard,
  PortalScreen,
  PortalStatusPill,
  PortalInputSpaced,
  MutedText,
  SectionEyebrow,
  SectionTitle,
  SpacedTop,
} from '../../components/portal';
import type { OrderResponse, DispatchResponse } from '../../api/domain';
import {
  getGetApiOrdersOrderIdQueryKey,
  useGetApiOrdersOrderId,
} from '../../api/generated/order/order';
import {
  getGetApiDispatchesOrderOrderIdQueryKey,
  useGetApiDispatchesOrderOrderId,
} from '../../api/generated/dispatch/dispatch';
import { usePostApiOrdersOrderIdCancel } from '../../api/generated/order/order';
import { usePostApiDispatchesDispatchIdSimulate } from '../../api/generated/dispatch/dispatch';
import { queryClient } from '../../api/queryClient';
import { useOrderTrackingMap } from '../../hooks/useOrderTrackingMap';
import type { PortalTabParamList } from '../../navigation/types';
import {
  TRACK_STAGES,
  getTrackStageIndex,
} from '../../utils/orderStatus';

type TrackRoute = RouteProp<PortalTabParamList, 'Track'>;

const Timeline = styled.View`
  margin-top: 20px;
  padding-left: 8px;
  border-left-width: 2px;
  border-left-color: ${({ theme }) => theme.colors.border};
  gap: 20px;
`;

const Stage = styled.View`
  flex-direction: row;
  gap: 12px;
  margin-left: -19px;
`;

const StageDot = styled.View<{ $done?: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ $done, theme }) =>
    $done ? theme.colors.sky : theme.colors.border};
`;

const StageDotText = styled.Text<{ $done?: boolean }>`
  font-size: 11px;
  font-weight: 700;
  color: ${({ $done, theme }) =>
    $done ? theme.colors.white : theme.colors.textMuted};
`;

const StageBody = styled.View`
  flex: 1;
  padding-top: 2px;
`;

const StageLabel = styled.Text<{ $current?: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${({ $current, theme }) =>
    $current ? theme.colors.link : theme.colors.text};
`;

const StageHint = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  margin-top: 2px;
`;

const ItemLine = styled.Text`
  margin-top: 8px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TotalLine = styled.Text`
  margin-top: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
`;

const TrackDeliveryScreen = () => {
  const route = useRoute<TrackRoute>();
  const [query, setQuery] = useState(route.params?.orderId ?? '');
  const [activeId, setActiveId] = useState(query.trim());

  useEffect(() => {
    if (route.params?.orderId) {
      setQuery(route.params.orderId);
      setActiveId(route.params.orderId.trim());
    }
  }, [route.params?.orderId]);

  const orderQuery = useGetApiOrdersOrderId(activeId, {
    query: { enabled: Boolean(activeId) },
  } as Parameters<typeof useGetApiOrdersOrderId>[1]);
  const dispatchQuery = useGetApiDispatchesOrderOrderId(activeId, {
    query: { enabled: Boolean(activeId) },
  } as Parameters<typeof useGetApiDispatchesOrderOrderId>[1]);
  const cancelOrder = usePostApiOrdersOrderIdCancel();
  const simulateDispatch = usePostApiDispatchesDispatchIdSimulate();

  const order = orderQuery.data as OrderResponse | undefined;
  const dispatch = dispatchQuery.data as DispatchResponse | undefined;
  const { markers, segments } = useOrderTrackingMap(order, dispatch);

  const status = (dispatch?.status ?? order?.status ?? 'Pending').toLowerCase();
  const activeIndex = useMemo(() => getTrackStageIndex(status), [status]);

  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetApiOrdersOrderIdQueryKey(activeId),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetApiDispatchesOrderOrderIdQueryKey(activeId),
      }),
    ]);
  };

  const orderStatus = order?.status?.toLowerCase() ?? '';
  const canModify =
    order &&
    orderStatus !== 'cancelled' &&
    orderStatus !== 'delivered' &&
    orderStatus !== 'completed';

  return (
    <PortalScreen keyboardShouldPersistTaps="handled">
      <PortalCard
        title="Track an order"
        description="Enter the order ID from your orders list."
      >
        <PortalInputSpaced
          value={query}
          onChangeText={setQuery}
          placeholder="e.g. f47ac10b-58cc-4372-a567-0e02b2c3d479"
          autoCapitalize="none"
        />
        <GradientButton
          title="Load order"
          onPress={() => setActiveId(query.trim())}
        />
      </PortalCard>

      {activeId && orderQuery.isError ? (
        <PortalCard>
          <MutedText>
            We could not find that order. Check the ID and try again.
          </MutedText>
        </PortalCard>
      ) : null}

      {order ? (
        <>
          <PortalCard
            title={
              order.deliveryAddress || `Order ${order.id.slice(0, 8)}…`
            }
            description={order.id}
            action={<PortalStatusPill value={dispatch?.status ?? order.status} />}
          >
            <DeliveryMap height={320} markers={markers} segments={segments} />
            <Timeline>
              {TRACK_STAGES.map((stage, index) => {
                const isDone = index <= activeIndex;
                const isCurrent = index === activeIndex;
                return (
                  <Stage key={stage.key}>
                    <StageDot $done={isDone}>
                      <StageDotText $done={isDone}>{index + 1}</StageDotText>
                    </StageDot>
                    <StageBody>
                      <StageLabel $current={isCurrent}>{stage.label}</StageLabel>
                      <StageHint>
                        {isCurrent
                          ? 'Current stage'
                          : isDone
                            ? 'Completed'
                            : 'Upcoming'}
                      </StageHint>
                    </StageBody>
                  </Stage>
                );
              })}
            </Timeline>
          </PortalCard>

          <PortalCard>
            <SectionEyebrow>Items</SectionEyebrow>
            {order.items?.map((item) => (
              <ItemLine key={item.id}>
                {item.productName} × {item.quantity} @{' '}
                {Number(item.unitPrice).toFixed(2)}
              </ItemLine>
            ))}
            <TotalLine>
              Total: {Number(order.totalAmount ?? 0).toFixed(2)}
            </TotalLine>
          </PortalCard>

          <PortalCard>
            <SectionEyebrow>Dispatch</SectionEyebrow>
            <SectionTitle>
              {dispatch
                ? `Drone ${dispatch.droneId.slice(0, 8)}…`
                : 'No dispatch yet'}
            </SectionTitle>
            <MutedText>
              {dispatch
                ? `Last update ${dispatch.updatedAt ?? dispatch.createdAt}`
                : 'A drone will be assigned when your delivery starts.'}
            </MutedText>
            {dispatch && canModify ? (
              <SpacedTop>
                <GradientButton
                  title={
                    simulateDispatch.isPending
                      ? 'Starting simulation…'
                      : 'Simulate flight (demo)'
                  }
                  variant="warning"
                  loading={simulateDispatch.isPending}
                  disabled={simulateDispatch.isPending}
                  onPress={async () => {
                    try {
                      await simulateDispatch.mutateAsync({
                        dispatchId: dispatch.id,
                      });
                      await refetchAll();
                    } catch {}
                  }}
                />
              </SpacedTop>
            ) : null}
          </PortalCard>

          <PortalCard>
            <SectionEyebrow>Destination</SectionEyebrow>
            <SectionTitle>{order.deliveryAddress}</SectionTitle>
            <MutedText>
              {order.deliveryLatitude.toFixed(4)},{' '}
              {order.deliveryLongitude.toFixed(4)}
            </MutedText>
          </PortalCard>

          {canModify ? (
            <GradientButton
              title={cancelOrder.isPending ? 'Cancelling…' : 'Cancel order'}
              variant="danger"
              loading={cancelOrder.isPending}
              disabled={cancelOrder.isPending}
              onPress={() => {
                Alert.alert('Cancel order', 'Cancel this order?', [
                  { text: 'No', style: 'cancel' },
                  {
                    text: 'Yes',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await cancelOrder.mutateAsync({ orderId: order.id });
                        await refetchAll();
                      } catch {}
                    },
                  },
                ]);
              }}
            />
          ) : null}
        </>
      ) : null}
    </PortalScreen>
  );
};

export default TrackDeliveryScreen;
