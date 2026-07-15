export function orderInAir(status: string | undefined): boolean {
  const s = status?.toLowerCase() ?? '';
  return s === 'inflight' || s === 'dispatched';
}

export function orderDelivered(status: string | undefined): boolean {
  return status?.toLowerCase() === 'delivered';
}

export type OrderFilter = 'all' | 'active' | 'done';

export function matchesOrderFilter(
  status: string | undefined,
  filter: OrderFilter,
): boolean {
  const s = status?.toLowerCase() ?? '';
  if (filter === 'active') {
    return ['pending', 'paid', 'dispatched', 'inflight'].includes(s);
  }
  if (filter === 'done') {
    return s === 'delivered' || s === 'cancelled';
  }
  return true;
}

export function getTrackStageIndex(status: string): number {
  const normalized = status.toLowerCase();
  if (normalized === 'delivered') {
    return 2;
  }
  if (
    normalized.includes('flight') ||
    normalized.includes('dispatch') ||
    normalized.includes('assigned') ||
    normalized === 'paid'
  ) {
    return 1;
  }
  return 0;
}

export const TRACK_STAGES = [
  { key: 'pending', label: 'Order received' },
  { key: 'flight', label: 'In the air' },
  { key: 'delivered', label: 'Delivered' },
] as const;
