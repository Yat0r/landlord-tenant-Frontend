import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/clients/httpClient';
import {
  getApiErrorStatus,
  isNonRetryableStatus,
  unwrapApiResponse,
  type ApiResponse,
} from '@/api/helpers/apiHelpers';
import {
  fetchAuditLogs,
  fetchLeases,
  fetchPayments,
  fetchProperties,
  fetchTenants,
} from '@/api/modules/adminApi';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  AuditRecord,
  LeaseRecord,
  PaymentRecord,
  PropertyRecord,
  TenantRecord,
} from '../utils/paymentDerivedData';

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

export interface RecordPaymentPayload {
  tenantId?: string;
  leaseId?: string;
  amount: number;
  method?: string;
  paymentMethod?: string;
  transactionReference?: string;
  paidDate?: string;
  notes?: string;
}

export function useAdminPaymentsData(pageSize = 500) {
  const paymentsQuery = useQuery({
    queryKey: ['admin', 'payments', 'workspace', pageSize],
    queryFn: () => fetchPayments({ pageSize }),
    ...queryOptions,
  });

  const tenantsQuery = useQuery({
    queryKey: ['admin', 'tenants', 'workspace', pageSize],
    queryFn: () => fetchTenants({ pageSize }),
    ...queryOptions,
  });

  const leasesQuery = useQuery({
    queryKey: ['admin', 'leases', 'workspace', pageSize],
    queryFn: () => fetchLeases({ pageSize }),
    ...queryOptions,
  });

  const propertiesQuery = useQuery({
    queryKey: ['admin', 'properties', 'workspace', pageSize],
    queryFn: () => fetchProperties({ pageSize }),
    ...queryOptions,
  });

  const auditQuery = useQuery({
    queryKey: ['admin', 'audit-logs', 'workspace', pageSize],
    queryFn: () => fetchAuditLogs({ pageSize }),
    ...queryOptions,
  });

  return {
    paymentsQuery,
    tenantsQuery,
    leasesQuery,
    propertiesQuery,
    auditQuery,
    payments: (paymentsQuery.data?.items ?? []) as PaymentRecord[],
    tenants: (tenantsQuery.data?.items ?? []) as TenantRecord[],
    leases: (leasesQuery.data?.items ?? []) as LeaseRecord[],
    properties: (propertiesQuery.data?.items ?? []) as PropertyRecord[],
    auditEvents: (auditQuery.data?.items ?? []) as AuditRecord[],
  };
}

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecordPaymentPayload) =>
      httpClient
        .post<ApiResponse<PaymentRecord>>(ENDPOINTS.ADMIN.PAYMENTS, payload)
        .then((response) => unwrapApiResponse(response.data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'leases'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'audit-logs'] });
    },
  });
}
