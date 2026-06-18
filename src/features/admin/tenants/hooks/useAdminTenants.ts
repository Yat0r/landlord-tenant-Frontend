import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/clients/httpClient';
import {
  getApiErrorStatus,
  isNonRetryableStatus,
  unwrapApiResponse,
  type ApiResponse,
} from '@/api/helpers/apiHelpers';
import {
  fetchLeases,
  fetchMaintenanceRequests,
  fetchPayments,
  fetchProperties,
  fetchTenants,
} from '@/api/modules/adminApi';
import { ENDPOINTS } from '@/api/modules/endpoints';
import type {
  LeaseRecord,
  MaintenanceRecord,
  PaymentRecord,
  PropertyRecord,
  TenantRecord,
} from '../utils/tenantDerivedData';

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

export interface CreateTenantPayload {
  fullName: string;
  phoneNumber: string;
  email?: string;
  nationalId?: string;
  notes?: string;
}

export function useAdminTenantsData(pageSize = 500) {
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

  const leasesQuery = useQuery({
    queryKey: ['admin', 'leases', 'workspace', pageSize],
    queryFn: () => fetchLeases({ pageSize }),
    ...queryOptions,
  });

  const paymentsQuery = useQuery({
    queryKey: ['admin', 'payments', 'workspace', pageSize],
    queryFn: () => fetchPayments({ pageSize }),
    ...queryOptions,
  });

  const maintenanceQuery = useQuery({
    queryKey: ['admin', 'maintenance', 'workspace', pageSize],
    queryFn: () => fetchMaintenanceRequests({ pageSize }),
    ...queryOptions,
  });

  return {
    tenantsQuery,
    propertiesQuery,
    leasesQuery,
    paymentsQuery,
    maintenanceQuery,
    tenants: (tenantsQuery.data?.items ?? []) as TenantRecord[],
    properties: (propertiesQuery.data?.items ?? []) as PropertyRecord[],
    leases: (leasesQuery.data?.items ?? []) as LeaseRecord[],
    payments: (paymentsQuery.data?.items ?? []) as PaymentRecord[],
    maintenance: (maintenanceQuery.data?.items ?? []) as MaintenanceRecord[],
  };
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateTenantPayload) =>
      httpClient
        .post<ApiResponse<TenantRecord>>(ENDPOINTS.ADMIN.TENANTS, payload)
        .then((response) => unwrapApiResponse(response.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'leases'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'maintenance'] });
    },
  });
}
