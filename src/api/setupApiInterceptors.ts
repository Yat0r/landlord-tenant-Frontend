import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { httpClient } from '@/api/client';

interface SetupApiInterceptorsOptions {
  getAccessToken: () => string | null | undefined;
  onUnauthorized: (error: AxiosError) => void | Promise<void>;
}

let activeUnauthorizedHandler: ((error: AxiosError) => void | Promise<void>) | null = null;
let isHandlingUnauthorized = false;

export function setupApiInterceptors(options: SetupApiInterceptorsOptions) {
  activeUnauthorizedHandler = options.onUnauthorized;

  const requestInterceptorId = httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = options.getAccessToken();

    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    } else {
      config.headers.delete('Authorization');
    }

    return config;
  });

  const responseInterceptorId = httpClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401 && activeUnauthorizedHandler && !isHandlingUnauthorized) {
        isHandlingUnauthorized = true;

        try {
          await activeUnauthorizedHandler(error);
        } finally {
          isHandlingUnauthorized = false;
        }
      }

      return Promise.reject(error);
    }
  );

  return () => {
    httpClient.interceptors.request.eject(requestInterceptorId);
    httpClient.interceptors.response.eject(responseInterceptorId);

    if (activeUnauthorizedHandler === options.onUnauthorized) {
      activeUnauthorizedHandler = null;
    }
  };
}
