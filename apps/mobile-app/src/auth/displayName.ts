import type { AuthUser } from '../api/domain';
import {
  getStoredDisplayName,
  removeStoredDisplayName,
  setStoredDisplayName,
} from './storage/displayName';

const defaultName = (user: AuthUser | null): string => {
  if (user?.email) {
    return user.email.split('@')[0] ?? 'Customer';
  }
  return 'Customer';
};

export const getUserName = async (): Promise<string> => {
  const stored = await getStoredDisplayName();
  if (stored?.trim()) {
    return stored.trim();
  }
  return defaultName(null);
};

export const getUserNameWithFallback = async (
  user: AuthUser | null,
): Promise<string> => {
  const stored = await getStoredDisplayName();
  if (stored?.trim()) {
    return stored.trim();
  }
  return defaultName(user);
};

export const setUserName = async (name: string): Promise<void> => {
  await setStoredDisplayName(name.trim() || 'Customer');
};

export const clearUserName = async (): Promise<void> => {
  await removeStoredDisplayName();
};
