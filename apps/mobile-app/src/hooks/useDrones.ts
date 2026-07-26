import { useMemo } from 'react';
import {
  useGetApiDrones,
  useGetApiDronesAvailable,
  useGetApiDronesDroneId,
} from '../api/generated/drone/drone';

export function useDrones() {
  const query = useGetApiDrones();
  const data = useMemo(
    () => query.data ?? [],
    [query.data],
  );
  return { ...query, data };
}

export function useAvailableDrones() {
  const query = useGetApiDronesAvailable();
  const data = useMemo(
    () => query.data ?? [],
    [query.data],
  );
  return { ...query, data };
}

export function useDrone(droneId: string) {
  const query = useGetApiDronesDroneId(droneId, {
    query: { enabled: Boolean(droneId) },
  } as Parameters<typeof useGetApiDronesDroneId>[1]);
  return query;
}
