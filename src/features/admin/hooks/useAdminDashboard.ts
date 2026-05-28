import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/clients/httpClient';
import { ENDPOINTS } from '@/api/modules/endpoints';
import type {
  PagedResult,
  ApiProperty,
  ApiPayment,
  ApiLandlord,
  ApiTenant,
  ApiLease,
  ApiMaintenanceRequest,
  ApiAuditLog,
  PaymentStatus,
} from '../types/dashboard';

function get<T>(url: string): Promise<T> {
  return httpClient.get<T>(url).then((response) => response.data);
}

function qs(params: Record<string, string | number | undefined>): string {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

  return parts.length ? `?${parts.join('&')}` : '';
}

export function useDashboardKpi() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'kpis'],
    queryFn: () =>
      Promise.all([
        get<PagedResult<ApiProperty>>(
          ENDPOINTS.ADMIN.PROPERTIES + qs({ page: 1, pageSize: 1 })
        ).then((data) => data.totalCount),
        get<PagedResult<ApiPayment>>(
          ENDPOINTS.ADMIN.PAYMENTS + qs({ page: 1, pageSize: 1, status: 'pending' })
        ).then((data) => data.totalCount),
        get<PagedResult<ApiTenant>>(
          ENDPOINTS.ADMIN.TENANTS + qs({ page: 1, pageSize: 1 })
        ).then((data) => data.totalCount),
        get<PagedResult<ApiLandlord>>(
          ENDPOINTS.ADMIN.LANDLORDS + qs({ page: 1, pageSize: 1 })
        ).then((data) => data.totalCount),
        get<PagedResult<ApiLease>>(
          ENDPOINTS.ADMIN.LEASES + qs({ page: 1, pageSize: 1, status: 'active' })
        ).then((data) => data.totalCount),
      ]).then(([propertyCount, pendingPayments, tenantCount, landlordCount, activeLeases]) => ({
        propertyCount,
        pendingPayments,
        tenantCount,
        landlordCount,
        activeLeases,
      })),
    staleTime: 60_000,
  });
}

export function useProperties() {
  return useQuery({
    queryKey: ['admin', 'properties', 'recent'],
    queryFn: () =>
      get<PagedResult<ApiProperty>>(
        ENDPOINTS.ADMIN.PROPERTIES + qs({ page: 1, pageSize: 3 })
      ),
    staleTime: 30_000,
  });
}

export function usePropertyCount() {
  return useQuery({
    queryKey: ['admin', 'properties', 'count'],
    queryFn: () =>
      get<PagedResult<ApiProperty>>(
        ENDPOINTS.ADMIN.PROPERTIES + qs({ page: 1, pageSize: 1 })
      ),
    staleTime: 60_000,
    select: (data) => data.totalCount,
  });
}

export function usePayments(status?: PaymentStatus) {
  return useQuery({
    queryKey: ['admin', 'payments', status ?? 'all'],
    queryFn: () =>
      get<PagedResult<ApiPayment>>(
        ENDPOINTS.ADMIN.PAYMENTS + qs({ page: 1, pageSize: 6, status })
      ),
    staleTime: 30_000,
  });
}

export function usePaymentSummary(status: PaymentStatus) {
  return useQuery({
    queryKey: ['admin', 'payments', 'summary', status],
    queryFn: () =>
      get<PagedResult<ApiPayment>>(
        ENDPOINTS.ADMIN.PAYMENTS + qs({ page: 1, pageSize: 1, status })
      ),
    staleTime: 60_000,
    select: (data) => ({ count: data.totalCount }),
  });
}

export function useLandlordCount() {
  return useQuery({
    queryKey: ['admin', 'landlords', 'count'],
    queryFn: () =>
      get<PagedResult<ApiLandlord>>(
        ENDPOINTS.ADMIN.LANDLORDS + qs({ page: 1, pageSize: 1 })
      ),
    staleTime: 60_000,
    select: (data) => data.totalCount,
  });
}

export function useUnlinkedLandlordCount() {
  return useQuery({
    queryKey: ['admin', 'landlords', 'unlinked'],
    queryFn: () =>
      get<PagedResult<ApiLandlord>>(
        ENDPOINTS.ADMIN.LANDLORDS + qs({ page: 1, pageSize: 1, keycloakLinked: 'false' })
      ),
    staleTime: 60_000,
    select: (data) => data.totalCount,
  });
}

export function useTenantCount() {
  return useQuery({
    queryKey: ['admin', 'tenants', 'count'],
    queryFn: () =>
      get<PagedResult<ApiTenant>>(
        ENDPOINTS.ADMIN.TENANTS + qs({ page: 1, pageSize: 1 })
      ),
    staleTime: 60_000,
    select: (data) => data.totalCount,
  });
}

export function useUnlinkedTenantCount() {
  return useQuery({
    queryKey: ['admin', 'tenants', 'unlinked'],
    queryFn: () =>
      get<PagedResult<ApiTenant>>(
        ENDPOINTS.ADMIN.TENANTS + qs({ page: 1, pageSize: 1, keycloakLinked: 'false' })
      ),
    staleTime: 60_000,
    select: (data) => data.totalCount,
  });
}

export function useActiveLeaseCount() {
  return useQuery({
    queryKey: ['admin', 'leases', 'active'],
    queryFn: () =>
      get<PagedResult<ApiLease>>(
        ENDPOINTS.ADMIN.LEASES + qs({ page: 1, pageSize: 1, status: 'active' })
      ),
    staleTime: 60_000,
    select: (data) => data.totalCount,
  });
}

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: ['admin', 'maintenance', 'recent'],
    queryFn: () =>
      get<PagedResult<ApiMaintenanceRequest>>(
        ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS + qs({ page: 1, pageSize: 3 })
      ),
    staleTime: 30_000,
  });
}

export function useOpenMaintenanceCount() {
  return useQuery({
    queryKey: ['admin', 'maintenance', 'open-count'],
    queryFn: () =>
      get<PagedResult<ApiMaintenanceRequest>>(
        ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS + qs({ page: 1, pageSize: 1, status: 'open' })
      ),
    staleTime: 60_000,
    select: (data) => data.totalCount,
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['admin', 'audit-logs', 'recent'],
    queryFn: () =>
      get<PagedResult<ApiAuditLog>>(
        ENDPOINTS.ADMIN.AUDIT_LOGS + qs({ page: 1, pageSize: 5 })
      ),
    staleTime: 30_000,
  });
}
