import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { httpClient } from '@/api/clients/httpClient';
import { isNonRetryableStatus } from '@/api/helpers/apiHelpers';
import {
  fetchAuditLogs,
  fetchLeases,
  fetchMaintenanceRequests,
  fetchPayments,
  fetchProperties,
  fetchTenants,
} from '@/api/modules/adminApi';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  AuditRecord,
  LeaseRecord,
  MaintenanceRecord,
  PaymentRecord,
  PropertyRecord,
  TenantRecord,
} from '../utils/leaseDerivedData';

const queryOptions = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof AxiosError && error.response && isNonRetryableStatus(error.response.status)) {
      return false;
    }

    return failureCount < 2;
  },
} as const;

export interface CreateLeasePayload {
  tenantId: string;
  propertyId: string;
  unitId?: string;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  depositAmount?: number;
  notes?: string;
}

export function useAdminLeasesData(pageSize = 500) {
  const leasesQuery = useQuery({
    queryKey: ['admin', 'leases', 'workspace', pageSize],
    queryFn: () => fetchLeases({ pageSize }),
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

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit-logs', 'workspace', pageSize],
    queryFn: () => fetchAuditLogs({ pageSize }),
    ...queryOptions,
  });

  return {
    leasesQuery,
    tenantsQuery,
    propertiesQuery,
    paymentsQuery,
    maintenanceQuery,
    auditQuery,
    leases: (leasesQuery.data?.items ?? []) as LeaseRecord[],
    tenants: (tenantsQuery.data?.items ?? []) as TenantRecord[],
    properties: (propertiesQuery.data?.items ?? []) as PropertyRecord[],
    payments: (paymentsQuery.data?.items ?? []) as PaymentRecord[],
    maintenance: (maintenanceQuery.data?.items ?? []) as MaintenanceRecord[],
    activity: (auditQuery.data?.items ?? []) as AuditRecord[],
  };
}

export function useCreateLease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLeasePayload) =>
      httpClient.post<LeaseRecord>(ENDPOINTS.ADMIN.LEASES, payload).then((response) => response.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'leases'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'maintenance'] });
    },
  });
}
