import type { AuthResponse } from '../domain';

export const parseLoginResponse = (data: unknown): AuthResponse => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid login response');
  }

  const record = data as Record<string, unknown>;
  const accessToken =
    record.accessToken ?? record.access_token ?? record.token;

  if (typeof accessToken !== 'string' || !accessToken) {
    throw new Error('Missing access token in login response');
  }

  const refreshToken = record.refreshToken ?? record.refresh_token;
  const userRaw = record.user;

  if (!userRaw || typeof userRaw !== 'object') {
    throw new Error('Missing user in login response');
  }

  const userRecord = userRaw as Record<string, unknown>;
  const id = userRecord.id;
  const email = userRecord.email;
  const roles = userRecord.roles;

  if (typeof id !== 'string' || typeof email !== 'string') {
    throw new Error('Invalid user in login response');
  }

  return {
    accessToken,
    refreshToken:
      typeof refreshToken === 'string' ? refreshToken : '',
    accessTokenExpiresAt:
      typeof record.accessTokenExpiresAt === 'string'
        ? record.accessTokenExpiresAt
        : typeof record.access_token_expires_at === 'string'
          ? record.access_token_expires_at
          : undefined,
    user: {
      id,
      email,
      roles: Array.isArray(roles)
        ? roles.filter((r): r is string => typeof r === 'string')
        : [],
    },
  };
};

export const isCustomerAccount = (roles: string[]): boolean => {
  return roles.some((r) => r.toLowerCase() === 'user');
};

export const isAdminAccount = (roles: string[]): boolean => {
  return roles.some((r) => r.toLowerCase() === 'admin');
};
