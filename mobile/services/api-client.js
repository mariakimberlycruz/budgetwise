import axios from 'axios';

import { API_BASE_URL } from '@/utils/api-config';
import { clearToken, getToken } from '@/utils/token-storage';

let onUnauthorized = null;

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// The backend wraps every response in {success, message, data}. Unwrap it
// here so the rest of the app can keep treating response.data as the
// resource itself, without every service call needing to know the envelope
// exists.
export function unwrapEnvelope(response) {
  const body = response.data;
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.message = body.message;
    response.data = body.data;
  }
  return response;
}

apiClient.interceptors.response.use(
  unwrapEnvelope,
  async (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
