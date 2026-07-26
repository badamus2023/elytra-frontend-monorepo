import axios from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { getApiBaseUrl } from '../config/env';
import { getToken } from '../auth/storage/token';

export const api = axios.create({
  baseURL: getApiBaseUrl(),
});

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

export const customInstance = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api.request<T>(config);
  return response.data;
};
