import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/clients/httpClient';
import {
  unwrapApiResponse,
  type ApiResponse,
  type PagedResponse,
} from '@/api/helpers/apiHelpers';
import { ENDPOINTS } from '@/api/modules/endpoints';
import type {
  CreateLandlordRequest,
  CreateLandlordResponse,
  LandlordDetails,
  Landlord,
  PagedResult,
  UpdateLandlordRequest,
} from '../types';

type BackendLandlord = {
  id: string;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  phone?: string | null;
  nationalId?: string | null;
  keycloakUserId?: string | null;
  keycloakLinked?: boolean | null;
  propertyCount?: number | null;
  tenantCount?: number | null;
  createdAt?: string | null;
};

type BackendLandlordDetails = {
  id: string;
  fullName?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  address?: string | null;
  keycloakUserId?: string | null;
  createdAt?: string | null;
  propertyCount?: number | null;
};

function getDisplayName(landlord: BackendLandlord): string {
  const fullName = landlord.fullName?.trim();
  if (fullName) return fullName;

  const firstName = landlord.firstName?.trim();
  const lastName = landlord.lastName?.trim();
  const combined = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (combined) return combined;

  const name = landlord.name?.trim();
  if (name) return name;

  return 'NA';
}

function getPaged<T>(url: string): Promise<PagedResult<T>> {
  return httpClient.get<ApiResponse<PagedResponse<T>>>(url).then((response) => {
    const data = unwrapApiResponse(response.data);
    return {
      items: data.items ?? [],
      totalCount: data.totalCount ?? 0,
      page: data.pageNumber ?? 1,
      pageSize: data.pageSize ?? 0,
    };
  });
}

function normalizeLandlordDetails(landlord: BackendLandlordDetails): LandlordDetails {
  return {
    id: landlord.id,
    fullName: landlord.fullName?.trim() || 'NA',
    phoneNumber: landlord.phoneNumber?.trim() || '',
    email: landlord.email ?? null,
    address: landlord.address ?? null,
    keycloakUserId: landlord.keycloakUserId ?? null,
    createdAt: landlord.createdAt ?? '',
    propertyCount: landlord.propertyCount ?? 0,
  };
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
    queryFn: async () => {
      const pageData = await getPaged<BackendLandlord>(
        ENDPOINTS.ADMIN.LANDLORDS_QUERY + qs({ pageNumber: page, pageSize, search, keycloakLinked })
      );

      return {
        ...pageData,
        items: pageData.items.map((landlord) => ({
          id: landlord.id,
          name: getDisplayName(landlord),
          email: landlord.email ?? '',
          phone: landlord.phoneNumber ?? landlord.phone ?? null,
          nationalId: landlord.nationalId ?? null,
          keycloakLinked: Boolean(landlord.keycloakUserId || landlord.keycloakLinked),
          propertyCount: landlord.propertyCount ?? 0,
          tenantCount: landlord.tenantCount ?? 0,
          createdAt: landlord.createdAt ?? '',
        })) satisfies Landlord[],
      };
    },
    staleTime: 30_000,
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateLandlord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLandlordRequest) =>
      httpClient
        .post<ApiResponse<CreateLandlordResponse>>(ENDPOINTS.ADMIN.LANDLORDS, payload)
        .then((response) => {
          const data = unwrapApiResponse(response.data);
          const name = data.fullName?.trim() || 'NA';

          return {
            ...data,
            name,
          };
        }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'landlords', 'list'] });
    },
  });
}

export async function fetchLandlordById(id: string): Promise<LandlordDetails> {
  const response = await httpClient.get<ApiResponse<BackendLandlordDetails>>(`${ENDPOINTS.ADMIN.LANDLORDS}/${id}`);
  return normalizeLandlordDetails(unwrapApiResponse(response.data));
}

export function updateLandlord(id: string, payload: UpdateLandlordRequest) {
  return httpClient
    .put<ApiResponse<LandlordDetails>>(`${ENDPOINTS.ADMIN.LANDLORDS}/${id}`, payload)
    .then((response) => unwrapApiResponse(response.data));
}

export function useUpdateLandlord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateLandlordRequest & { id: string }) => updateLandlord(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'landlords', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'landlords'] });
    },
  });
}
