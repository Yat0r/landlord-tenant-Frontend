import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { isNonRetryableStatus } from '@/api/helpers/apiHelpers';
import {
  fetchAuditLogs,
  fetchLandlords,
  fetchLeases,
  fetchMaintenanceRequests,
  fetchPayments,
  fetchProperties,
  fetchTenants,
} from '@/api/modules/adminApi';
import { fetchHealth } from '@/api/modules/systemApi';
import type {
  AuditLogEntity,
  LeaseEntity,
  LandlordEntity,
  MaintenancePriority,
  MaintenanceRequestEntity,
  MaintenanceStatus,
  PaymentEntity,
  PaymentStatus,
  PropertyEntity,
  TenantEntity,
  LeaseStatus,
} from '@/types/domain/entities';
import type { QueryKey } from '@tanstack/react-query';

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

type CollectionParams = {
  page?: number;
  pageSize?: number;
};

function collectionKey(name: string, params: Record<string, unknown>): QueryKey {
  return ['admin', name, params];
}

export function useHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: fetchHealth,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: queryOptions.retry,
  });
}

export function useLandlords(params: CollectionParams & { keycloakLinked?: boolean } = {}) {
  return useQuery({
    queryKey: collectionKey('landlords', params),
    queryFn: () => fetchLandlords(params),
    ...queryOptions,
  });
}

export function useTenants(params: CollectionParams & { keycloakLinked?: boolean } = {}) {
  return useQuery({
    queryKey: collectionKey('tenants', params),
    queryFn: () => fetchTenants(params),
    ...queryOptions,
  });
}

export function useProperties(params: CollectionParams = {}) {
  return useQuery({
    queryKey: collectionKey('properties', params),
    queryFn: () => fetchProperties(params),
    ...queryOptions,
  });
}

export function useLeases(params: CollectionParams & { status?: LeaseStatus } = {}) {
  return useQuery({
    queryKey: collectionKey('leases', params),
    queryFn: () => fetchLeases(params),
    ...queryOptions,
  });
}

export function usePayments(params: CollectionParams & { status?: PaymentStatus } = {}) {
  return useQuery({
    queryKey: collectionKey('payments', params),
    queryFn: () => fetchPayments(params),
    ...queryOptions,
  });
}

export function useMaintenanceRequests(
  params: CollectionParams & { status?: MaintenanceStatus; priority?: MaintenancePriority } = {}
) {
  return useQuery({
    queryKey: collectionKey('maintenance-requests', params),
    queryFn: () => fetchMaintenanceRequests(params),
    ...queryOptions,
  });
}

export function useAuditLogs(params: CollectionParams = {}) {
  return useQuery({
    queryKey: collectionKey('audit-logs', params),
    queryFn: () => fetchAuditLogs(params),
    ...queryOptions,
  });
}

export type {
  AuditLogEntity,
  LeaseEntity,
  LandlordEntity,
  MaintenanceRequestEntity,
  PaymentEntity,
  PropertyEntity,
  TenantEntity,
};
