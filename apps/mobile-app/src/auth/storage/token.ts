import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setToken = async (token: string) => {
  return AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const setRefreshToken = async (token: string) => {
  return AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const removeToken = async () => {
  await AsyncStorage.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
};
