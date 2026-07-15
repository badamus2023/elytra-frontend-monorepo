import { isAxiosError } from 'axios';

export const getErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong',
): string => {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (data && typeof data === 'object') {
      const record = data as Record<string, unknown>;
      const message = record.message ?? record.title ?? record.error;

      if (typeof message === 'string') {
        return message;
      }
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
