import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/clients/httpClient';
import { ENDPOINTS } from '@/api/modules/endpoints';
import type {
  CreateLandlordPayload,
  CreateLandlordResponse,
  Landlord,
  PagedResult,
} from '../types';

function get<T>(url: string): Promise<T> {
  return httpClient.get<T>(url).then((response) => response.data);
}

function qs(params: Record<string, boolean | number | string | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

  return parts.length ? `?${parts.join('&')}` : '';
}

export interface LandlordsFilter {
  page?: number;
  pageSize?: number;
  search?: string;
  keycloakLinked?: boolean;
}

export function useLandlords(filter: LandlordsFilter = {}) {
  const { page = 1, pageSize = 15, search, keycloakLinked } = filter;

  return useQuery({
    queryKey: ['admin', 'landlords', 'list', page, pageSize, search, keycloakLinked],
    queryFn: () =>
      get<PagedResult<Landlord>>(
        ENDPOINTS.ADMIN.LANDLORDS + qs({ page, pageSize, search, keycloakLinked })
      ),
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateLandlord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLandlordPayload) =>
      httpClient
        .post<CreateLandlordResponse>(ENDPOINTS.ADMIN.LANDLORDS, payload)
        .then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'landlords', 'list'] });
    },
  });
}
