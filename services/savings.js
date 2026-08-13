import { apiClient } from '@/services/api-client';

export async function getSavingsGoals() {
  const { data } = await apiClient.get('/api/v1/savings-goals');
  return data;
}

export async function getSavingsGoal(id) {
  const { data } = await apiClient.get(`/api/v1/savings-goals/${id}`);
  return data;
}

export async function createSavingsGoal(payload) {
  const { data } = await apiClient.post('/api/v1/savings-goals', payload);
  return data;
}

export async function updateSavingsGoal(id, payload) {
  const { data } = await apiClient.put(`/api/v1/savings-goals/${id}`, payload);
  return data;
}

export async function deleteSavingsGoal(id) {
  await apiClient.delete(`/api/v1/savings-goals/${id}`);
}

export async function addContribution(id, amount) {
  const { data } = await apiClient.post(`/api/v1/savings-goals/${id}/contributions`, { amount });
  return data;
}
