import { apiClient } from '@/services/api-client';

export async function getIncomes({ month, year }) {
  const { data } = await apiClient.get('/api/v1/income', { params: { month, year } });
  return data;
}

export async function getIncome(id) {
  const { data } = await apiClient.get(`/api/v1/income/${id}`);
  return data;
}

export async function createIncome(payload) {
  const { data } = await apiClient.post('/api/v1/income', payload);
  return data;
}

export async function updateIncome(id, payload) {
  const { data } = await apiClient.put(`/api/v1/income/${id}`, payload);
  return data;
}

export async function deleteIncome(id) {
  await apiClient.delete(`/api/v1/income/${id}`);
}
