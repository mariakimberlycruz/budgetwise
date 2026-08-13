import { apiClient } from '@/services/api-client';

export async function getRecurringExpenses(params) {
  const { data } = await apiClient.get('/api/v1/recurring-expenses', { params });
  return data;
}

export async function getRecurringExpense(id) {
  const { data } = await apiClient.get(`/api/v1/recurring-expenses/${id}`);
  return data;
}

export async function createRecurringExpense(payload) {
  const { data } = await apiClient.post('/api/v1/recurring-expenses', payload);
  return data;
}

export async function updateRecurringExpense(id, payload) {
  const { data } = await apiClient.put(`/api/v1/recurring-expenses/${id}`, payload);
  return data;
}

export async function deleteRecurringExpense(id) {
  await apiClient.delete(`/api/v1/recurring-expenses/${id}`);
}
