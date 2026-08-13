import { apiClient } from '@/services/api-client';

export async function getDashboard({ month, year }) {
  const { data } = await apiClient.get('/api/v1/dashboard', { params: { month, year } });
  return data;
}
