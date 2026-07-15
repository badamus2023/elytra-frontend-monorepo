import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthResponse, AuthUser } from '../api/domain';
import {
  clearUserName,
  getUserNameWithFallback,
  setUserName as persistDisplayName,
} from './displayName';
import { getStoredDisplayName } from './storage/displayName';
import { getSessionUser, removeSessionUser, setSessionUser } from './storage/session';
import { getToken, removeToken, setRefreshToken, setToken } from './storage/token';

type AuthContextValue = {
  isLoggedIn: boolean | null;
  user: AuthUser | null;
  displayName: string;
  refreshProfile: () => Promise<void>;
  setDisplayName: (name: string) => Promise<void>;
  signIn: (response: AuthResponse) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [displayName, setDisplayNameState] = useState('Customer');

  const refreshProfile = useCallback(async () => {
    const token = await getToken();
    const sessionUser = await getSessionUser();
    setUser(sessionUser);
    setIsLoggedIn(!!token);
    setDisplayNameState(await getUserNameWithFallback(sessionUser));
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const setDisplayName = useCallback(async (name: string) => {
    await persistDisplayName(name);
    setDisplayNameState(name.trim() || 'Customer');
  }, []);

  const signIn = useCallback(async (response: AuthResponse) => {
    await setToken(response.accessToken);

    if (response.refreshToken) {
      await setRefreshToken(response.refreshToken);
    }

    await setSessionUser(response.user);
    const storedName = await getStoredDisplayName();
    if (!storedName?.trim()) {
      await persistDisplayName(response.user.email?.split('@')[0] ?? 'Customer');
    }
    setUser(response.user);
    setDisplayNameState(await getUserNameWithFallback(response.user));
    setIsLoggedIn(true);
  }, []);

  const signOut = useCallback(async () => {
    await removeToken();
    await removeSessionUser();
    await clearUserName();
    setUser(null);
    setDisplayNameState('Customer');
    setIsLoggedIn(false);
  }, []);

  const value = useMemo(
    () => ({
      isLoggedIn,
      user,
      displayName,
      refreshProfile,
      setDisplayName,
      signIn,
      signOut,
    }),
    [isLoggedIn, user, displayName, refreshProfile, setDisplayName, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
