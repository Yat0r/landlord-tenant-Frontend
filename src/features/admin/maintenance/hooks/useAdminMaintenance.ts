import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/clients/httpClient';
import {
  getApiErrorStatus,
  isNonRetryableStatus,
  unwrapApiResponse,
  unwrapApiResponseAllowEmpty,
  type ApiResponse,
} from '@/api/helpers/apiHelpers';
import {
  fetchAuditLogs,
  fetchLeases,
  fetchLandlords,
  fetchMaintenanceRequests,
  fetchProperties,
  fetchTenants,
} from '@/api/modules/adminApi';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  AuditRecord,
  LandlordRecord,
  LeaseRecord,
  MaintenanceRecord,
  PropertyRecord,
  TenantRecord,
} from '../utils/maintenanceDerivedData';

const queryOptions = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: (failureCount: number, error: unknown) => {
    const status = getApiErrorStatus(error);
    if (status !== null && isNonRetryableStatus(status)) {
      return false;
    }

    return failureCount < 2;
  },
} as const;

export interface MaintenanceRequestPayload {
  tenantId?: string;
  propertyId?: string;
  propertyUnit?: string;
  title: string;
  description: string;
  priority: string;
  category?: string;
  notes?: string;
  status?: string;
}

export interface MaintenanceUpdatePayload extends Partial<MaintenanceRequestPayload> {
  id: string;
}

export function useAdminMaintenanceData(pageSize = 500) {
  const requestsQuery = useQuery({
    queryKey: ['admin', 'maintenance-requests', 'workspace', pageSize],
    queryFn: () => fetchMaintenanceRequests({ pageSize }),
    ...queryOptions,
  });

  const tenantsQuery = useQuery({
    queryKey: ['admin', 'tenants', 'workspace', pageSize],
    queryFn: () => fetchTenants({ pageSize }),
    ...queryOptions,
  });

  const propertiesQuery = useQuery({
    queryKey: ['admin', 'properties', 'workspace', pageSize],
    queryFn: () => fetchProperties({ pageSize }),
    ...queryOptions,
  });

  const landlordsQuery = useQuery({
    queryKey: ['admin', 'landlords', 'workspace', pageSize],
    queryFn: () => fetchLandlords({ pageSize }),
    ...queryOptions,
  });

  const leasesQuery = useQuery({
    queryKey: ['admin', 'leases', 'workspace', pageSize],
    queryFn: () => fetchLeases({ pageSize }),
    ...queryOptions,
  });

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit-logs', 'workspace', pageSize],
    queryFn: () => fetchAuditLogs({ pageSize }),
    ...queryOptions,
  });

  return {
    requestsQuery,
    tenantsQuery,
    propertiesQuery,
    landlordsQuery,
    leasesQuery,
    auditQuery,
    requests: (requestsQuery.data?.items ?? []) as MaintenanceRecord[],
    tenants: (tenantsQuery.data?.items ?? []) as TenantRecord[],
    properties: (propertiesQuery.data?.items ?? []) as PropertyRecord[],
    landlords: (landlordsQuery.data?.items ?? []) as LandlordRecord[],
    leases: (leasesQuery.data?.items ?? []) as LeaseRecord[],
    audits: (auditQuery.data?.items ?? []) as AuditRecord[],
  };
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: MaintenanceRequestPayload) =>
      httpClient
        .post<ApiResponse<MaintenanceRecord>>(ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS, payload)
        .then((response) => unwrapApiResponse(response.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...payload }: MaintenanceUpdatePayload) =>
      httpClient
        .put<ApiResponse<MaintenanceRecord>>(`${ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS}/${id}`, payload)
        .then((response) => unwrapApiResponse(response.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}

export function useDeleteMaintenanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      httpClient
        .delete<ApiResponse<object>>(`${ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS}/${id}`)
        .then((response) => unwrapApiResponseAllowEmpty(response.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'maintenance-requests'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}
