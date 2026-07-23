import axios from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse } from './domain';
import { getApiBaseUrl } from '../config/env';
import {
  getRefreshToken,
  getToken,
  removeToken,
  setRefreshToken,
  setToken,
} from '../auth/storage/token';

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<AuthResponse | null> | null = null;

async function refreshAccessToken(): Promise<AuthResponse | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post<AuthResponse>(
        `${getApiBaseUrl()}/api/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' } },
      );

      const auth = response.data;
      if (!auth.accessToken) {
        return null;
      }

      await setToken(auth.accessToken);
      if (auth.refreshToken) {
        await setRefreshToken(auth.refreshToken);
      }

      return auth;
    } catch {
      return null;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken();

  if (token) {
    config.headers = config.headers ?? {};

    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
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

    const auth = await refreshAccessToken();
    if (!auth?.accessToken) {
      await removeToken();
      return Promise.reject(error);
    }

    originalRequest.headers = originalRequest.headers ?? {};
    if (typeof originalRequest.headers.set === 'function') {
      originalRequest.headers.set('Authorization', `Bearer ${auth.accessToken}`);
    } else {
      originalRequest.headers['Authorization'] = `Bearer ${auth.accessToken}`;
    }

    return api(originalRequest);
  },
);

export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api.request<T>(config);
  return response.data;
};
