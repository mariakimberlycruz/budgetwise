import { apiClient } from '@/services/api-client';

export async function getMonthlyReport({ month, year }) {
  const { data } = await apiClient.get('/api/v1/reports/monthly', {
    params: { month, year },
  });
  return data;
}
