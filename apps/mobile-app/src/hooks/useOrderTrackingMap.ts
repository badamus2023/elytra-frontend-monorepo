import { useMemo } from 'react';
import type { DispatchResponse, OrderResponse } from '../api/domain';
import type { MapMarker, MapSegment } from '../components/map/types';

export function useOrderTrackingMap(
  order: OrderResponse | undefined,
  dispatch: DispatchResponse | undefined,
) {
  const markers = useMemo((): MapMarker[] => {
    if (!order) {
      return [];
    }

    const result: MapMarker[] = [
      {
        id: 'delivery',
        label: `Delivery: ${order.deliveryAddress}`,
        latitude: order.deliveryLatitude,
        longitude: order.deliveryLongitude,
      },
    ];

    if (dispatch) {
      result.push({
        id: 'drone',
        label: `Drone (${dispatch.status})`,
        latitude: dispatch.droneLatitude,
        longitude: dispatch.droneLongitude,
      });
    }

    return result;
  }, [order, dispatch]);

  const segments = useMemo((): MapSegment[] => {
    if (!order || !dispatch) {
      return [];
    }

    return [
      {
        id: 'to-customer',
        from: {
          latitude: dispatch.droneLatitude,
          longitude: dispatch.droneLongitude,
        },
        to: {
          latitude: order.deliveryLatitude,
          longitude: order.deliveryLongitude,
        },
        color: '#6366f1',
      },
    ];
  }, [order, dispatch]);

  return { markers, segments };
}
