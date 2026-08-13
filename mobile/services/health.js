import { apiRequest } from '@/services/api';

export function getHealth() {
  return apiRequest('/api/v1/health');
}
