import { useMemo } from 'react';
import {
  useGetApiDrones,
  useGetApiDronesAvailable,
  useGetApiDronesDroneId,
} from '../api/generated/drone/drone';
import type { DroneResponse } from '../api/domain';

export function useDrones() {
  const query = useGetApiDrones();
  const data = useMemo(
    () => (query.data as DroneResponse[] | undefined) ?? [],
    [query.data],
  );
  return { ...query, data };
}

export function useAvailableDrones() {
  const query = useGetApiDronesAvailable();
  const data = useMemo(
    () => (query.data as DroneResponse[] | undefined) ?? [],
    [query.data],
  );
  return { ...query, data };
}

export function useDrone(droneId: string) {
  const query = useGetApiDronesDroneId(droneId, {
    query: { enabled: Boolean(droneId) },
  } as Parameters<typeof useGetApiDronesDroneId>[1]);
  const data = query.data as DroneResponse | undefined;
  return { ...query, data };
}
