import axios from 'axios';

// Maps any error the app can encounter (network, timeout, auth, validation,
// server) to one short, user-safe sentence. Never surfaces raw exception
// text/stack traces — the backend already sends a clean `message`, and this
// only falls back to generic copy when that isn't available.
export function getErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'The request timed out. Please check your connection and try again.';
    }
    if (!error.response) {
      return 'Network error. Make sure the backend is running and you are connected to the internet.';
    }

    const message = error.response.data?.message;
    if (typeof message === 'string' && message.trim()) {
      return message;
    }

    switch (error.response.status) {
      case 401:
        return 'Your session has expired. Please sign in again.';
      case 403:
        return 'You do not have permission to do that.';
      case 404:
        return 'We could not find what you were looking for.';
      case 422:
        return 'Please check the form for invalid values.';
      default:
        return error.response.status >= 500
          ? 'Something went wrong on our end. Please try again in a moment.'
          : `Request failed (${error.response.status}). Please try again.`;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
