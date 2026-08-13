import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'budgetwise_access_token';

const isNative = Platform.OS !== 'web';

export async function getToken() {
  if (isNative) {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  }
  if (typeof window !== 'undefined') {
    return window.localStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export async function setToken(token) {
  if (isNative) {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return;
  }
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
  }
}

export async function clearToken() {
  if (isNative) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return;
  }
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}
