import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { isNonRetryableStatus } from '@/api/helpers/apiHelpers';
import {
  createProperty,
  fetchLandlords,
  fetchLeases,
  fetchMaintenanceRequests,
  fetchPayments,
  fetchProperties,
  fetchTenants,
  type CreatePropertyPayload,
} from '@/api/modules/adminApi';
import type {
  LeaseEntity,
  LandlordEntity,
  MaintenancePriority,
  MaintenanceRequestEntity,
  MaintenanceStatus,
  PaymentEntity,
  PaymentStatus,
  PagedResult,
  PropertyEntity,
  TenantEntity,
} from '@/types/domain/entities';

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

export function useAdminProperties(pageSize = 100) {
  return useQuery({
    queryKey: ['admin', 'properties', 'list', pageSize],
    queryFn: () => fetchProperties({ pageSize }),
    ...queryOptions,
  });
}

export function useAdminLandlords(pageSize = 100) {
  return useQuery({
    queryKey: ['admin', 'landlords', 'list', pageSize],
    queryFn: () => fetchLandlords({ pageSize }),
    ...queryOptions,
  });
}

export function useAdminLeases(pageSize = 200) {
  return useQuery({
    queryKey: ['admin', 'leases', 'list', pageSize],
    queryFn: () => fetchLeases({ pageSize }),
    ...queryOptions,
  });
}

export function useAdminTenants(pageSize = 200) {
  return useQuery({
    queryKey: ['admin', 'tenants', 'list', pageSize],
    queryFn: () => fetchTenants({ pageSize }),
    ...queryOptions,
  });
}

export function useAdminPayments(pageSize = 200) {
  return useQuery({
    queryKey: ['admin', 'payments', 'list', pageSize],
    queryFn: () => fetchPayments({ pageSize }),
    ...queryOptions,
  });
}

export function useAdminMaintenanceRequests(pageSize = 200) {
  return useQuery({
    queryKey: ['admin', 'maintenance', 'list', pageSize],
    queryFn: () => fetchMaintenanceRequests({ pageSize }),
    ...queryOptions,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePropertyPayload) => createProperty(payload),
    onSuccess: (createdProperty) => {
      queryClient.setQueriesData<PagedResult<PropertyEntity>>(
        { queryKey: ['admin', 'properties', 'list'] },
        (current) => {
          if (!current) return current;
          if (current.items.some((property) => property.id === createdProperty.id)) return current;

          return {
            ...current,
            items: [...current.items, createdProperty],
            totalCount: current.totalCount + 1,
          };
        }
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties', 'list'] });
    },
  });
}

export type {
  LeaseEntity,
  LandlordEntity,
  MaintenancePriority,
  MaintenanceRequestEntity,
  MaintenanceStatus,
  PaymentEntity,
  PaymentStatus,
  PropertyEntity,
  TenantEntity,
};
