import AsyncStorage from '@react-native-async-storage/async-storage';

const DISPLAY_NAME_KEY = 'display_name';

export const getStoredDisplayName = async (): Promise<string | null> => {
  return AsyncStorage.getItem(DISPLAY_NAME_KEY);
};

export const setStoredDisplayName = async (name: string): Promise<void> => {
  await AsyncStorage.setItem(DISPLAY_NAME_KEY, name);
};

export const removeStoredDisplayName = async (): Promise<void> => {
  await AsyncStorage.removeItem(DISPLAY_NAME_KEY);
};
