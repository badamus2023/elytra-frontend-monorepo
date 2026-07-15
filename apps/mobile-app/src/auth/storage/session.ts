import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../../api/domain';

const USER_JSON_KEY = 'auth_user';

export const getSessionUser = async (): Promise<AuthUser | null> => {
  const raw = await AsyncStorage.getItem(USER_JSON_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setSessionUser = async (user: AuthUser): Promise<void> => {
  await AsyncStorage.setItem(USER_JSON_KEY, JSON.stringify(user));
};

export const removeSessionUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(USER_JSON_KEY);
};
