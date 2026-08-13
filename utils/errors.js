import axios from 'axios';

export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      const first = detail[0];
      if (first?.msg) {
        return first.msg;
      }
    }
    if (!error.response) {
      return 'Network error. Make sure the backend is running.';
    }
    return `Request failed (${error.response.status}). Please try again.`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
