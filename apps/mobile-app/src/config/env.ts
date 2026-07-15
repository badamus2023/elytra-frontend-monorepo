import Config from 'react-native-config';

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, '');

export const getApiBaseUrl = (): string => {
  const apiUrl = Config.API_URL;

  if (!apiUrl) {
    throw new Error(
      'API_URL is not set. Copy .env.example to .env and rebuild the app.',
    );
  }

  return normalizeBaseUrl(apiUrl);
};
