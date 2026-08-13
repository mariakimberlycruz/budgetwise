import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_PORT = 8000;

export function getEnvApiUrl() {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (url && url.trim().length > 0) {
    return url.trim().replace(/\/+$/, '');
  }
  return null;
}

export function getDevServerHost() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0] || null;
  }
  return null;
}

export function getPlatformFallbackHost() {
  if (Platform.OS === 'android') {
    return '10.0.2.2';
  }
  return 'localhost';
}

export function getApiPort() {
  return process.env.EXPO_PUBLIC_API_PORT ?? String(API_PORT);
}

export function getApiBaseUrl() {
  const envUrl = getEnvApiUrl();
  if (envUrl) {
    return envUrl;
  }

  const host = getDevServerHost() ?? getPlatformFallbackHost();
  const port = getApiPort();
  return `http://${host}:${port}`;
}

export const API_BASE_URL = getApiBaseUrl();
