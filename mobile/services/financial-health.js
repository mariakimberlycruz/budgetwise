import { apiClient } from '@/services/api-client';

export async function getFinancialHealth({ month, year }) {
  const { data } = await apiClient.get('/api/v1/financial-health', {
    params: { month, year },
  });
  return data;
}
