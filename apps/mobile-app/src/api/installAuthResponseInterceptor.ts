import type { InternalAxiosRequestConfig } from 'axios';
import {
  getRefreshToken,
  removeToken,
  setRefreshToken,
  setToken,
} from '../auth/storage/token';
import { postApiAuthRefresh } from './generated/auth/auth';
import { api } from './axios-instance';

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const auth = await postApiAuthRefresh({ refreshToken });
      if (!auth.accessToken) {
        return null;
      }

      await setToken(auth.accessToken);
      if (auth.refreshToken) {
        await setRefreshToken(auth.refreshToken);
      }

      return auth.accessToken;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config as RetryableConfig | undefined;
    const status = error.response?.status;

    if (
      status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes('/api/auth/refresh')
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const accessToken = await refreshAccessToken();
    if (!accessToken) {
      await removeToken();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    if (typeof originalRequest.headers.set === 'function') {
      originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
    } else {
      originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    return api(originalRequest);
  },
);
