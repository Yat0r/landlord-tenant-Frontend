import { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}

/**
 * Extracts a user-friendly error message from an Axios error response.
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = error.response?.data as any;
    const message =
      data?.message ||
      data?.title ||
      data?.error ||
      error.message ||
      'An unexpected error occurred.';
    const detail = data?.detail ?? undefined;
    return { status, message, detail };
  }

  if (error instanceof Error) {
    return { status: 0, message: error.message };
  }

  return { status: 0, message: 'An unknown error occurred.' };
}

/**
 * Returns true for status codes that should not be retried by TanStack Query.
 */
export function isNonRetryableStatus(status: number): boolean {
  return [400, 401, 403, 404, 409, 429].includes(status);
}
