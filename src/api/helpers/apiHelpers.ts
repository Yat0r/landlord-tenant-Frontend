import { AxiosError } from 'axios';

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
  errors?: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T | null;
  errors?: string[] | null;
  statusCode: number;
}

export interface PagedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiErrorBody {
  success?: boolean;
  message?: string;
  errors?: string[] | null;
  statusCode?: number;
  title?: string;
  detail?: string;
  error?: string;
}

export class ApiResponseError extends Error {
  readonly status: number;
  readonly errors: string[];
  readonly detail?: string;

  constructor(message: string, status = 0, errors: string[] = [], detail?: string) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
    this.errors = errors;
    this.detail = detail;
  }
}

export function isApiResponse<T>(value: unknown): value is ApiResponse<T> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return (
    'success' in value &&
    'message' in value &&
    'statusCode' in value
  );
}

export function unwrapApiResponse<T>(raw: ApiResponse<T>, options?: { allowEmpty?: boolean }): T {
  if (!isApiResponse<T>(raw)) {
    throw new ApiResponseError('Unexpected API response shape.', 0);
  }

  if (!raw.success) {
    throw new ApiResponseError(
      raw.message || 'API request failed.',
      raw.statusCode,
      raw.errors ?? []
    );
  }

  if (raw.data === null || raw.data === undefined) {
    if (options?.allowEmpty) {
      return undefined as T;
    }

    throw new ApiResponseError(raw.message || 'API response did not include data.', raw.statusCode);
  }

  return raw.data;
}

export function unwrapApiResponseAllowEmpty<T>(raw: ApiResponse<T>): T | undefined {
  return unwrapApiResponse<T | undefined>(raw as ApiResponse<T | undefined>, { allowEmpty: true });
}

/**
 * Extracts a user-friendly error message from an Axios error response.
 */
export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiResponseError) {
    return {
      status: error.status,
      message: error.message,
      detail: error.detail,
      errors: error.errors,
    };
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 0;
    const data = error.response?.data as ApiErrorBody | undefined;
    const message =
      data?.message ||
      data?.title ||
      data?.error ||
      error.message ||
      'An unexpected error occurred.';
    const detail = data?.detail ?? undefined;
    return { status, message, detail, errors: data?.errors ?? undefined };
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

export function getApiErrorStatus(error: unknown): number | null {
  if (error instanceof ApiResponseError) return error.status;
  if (error instanceof AxiosError) return error.response?.status ?? null;
  return null;
}
