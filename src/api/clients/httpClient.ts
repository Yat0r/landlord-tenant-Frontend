import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

if (!API_BASE_URL) {
  console.error('[httpClient] VITE_API_BASE_URL is not set. Check your .env file.');
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

/**
 * Attach the OIDC Bearer token to every request.
 * Call this once during app bootstrap after auth is initialized.
 */
export function setAuthToken(token: string | null) {
  if (token) {
    httpClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete httpClient.defaults.headers.common['Authorization'];
  }
}

// Response interceptor — normalizes errors for apiHelpers
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Let the caller handle all HTTP errors — do not redirect here.
    return Promise.reject(error);
  }
);
