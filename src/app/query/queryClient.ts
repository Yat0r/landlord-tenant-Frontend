import { QueryClient } from '@tanstack/react-query';
import { isNonRetryableStatus } from '@/api/helpers/apiHelpers';
import { AxiosError } from 'axios';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // 1 minute
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: (failureCount, error) => {
        if (error instanceof AxiosError && error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            return false;
          }

          if (isNonRetryableStatus(error.response.status)) {
            return false;
          }
        }
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});
