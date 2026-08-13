import { apiClient } from '@/services/api-client';

export async function getSettings() {
  const { data } = await apiClient.get('/api/v1/settings');
  return data;
}

export async function updateSettings(payload) {
  const { data } = await apiClient.put('/api/v1/settings', payload);
  return data;
}

export async function updateProfile(payload) {
  const { data } = await apiClient.put('/api/v1/auth/me', payload);
  return data;
}
