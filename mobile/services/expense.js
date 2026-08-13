import { apiClient } from '@/services/api-client';

export async function getExpenses(params) {
  const { data } = await apiClient.get('/api/v1/expenses', { params });
  return data;
}

export async function getExpense(id) {
  const { data } = await apiClient.get(`/api/v1/expenses/${id}`);
  return data;
}

export async function createExpense(payload) {
  const { data } = await apiClient.post('/api/v1/expenses', payload);
  return data;
}

export async function updateExpense(id, payload) {
  const { data } = await apiClient.put(`/api/v1/expenses/${id}`, payload);
  return data;
}

export async function deleteExpense(id) {
  await apiClient.delete(`/api/v1/expenses/${id}`);
}
