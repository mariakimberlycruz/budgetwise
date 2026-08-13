import { apiClient } from '@/services/api-client';

export async function loginUser(payload) {
  const { data } = await apiClient.post('/api/v1/auth/login', payload);
  return data;
}

export async function registerUser(payload) {
  const { data } = await apiClient.post('/api/v1/auth/register', payload);
  return data;
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get('/api/v1/auth/me');
  return data;
}
