import { apiClient } from '@/services/api-client';

export async function getBudgets({ month, year }) {
  const { data } = await apiClient.get('/api/v1/budgets', { params: { month, year } });
  return data;
}

export async function setBudget(payload) {
  const { data } = await apiClient.put('/api/v1/budgets', payload);
  return data;
}
