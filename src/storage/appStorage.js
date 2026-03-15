import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hauler-app-state-v1';

export async function loadPersistedAppState() {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  return JSON.parse(rawValue);
}

export async function savePersistedAppState(appState) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

export async function resetPersistedAppState() {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
