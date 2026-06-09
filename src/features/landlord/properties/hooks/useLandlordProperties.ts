import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { isNonRetryableStatus } from '@/api/helpers/apiHelpers';
import {
  fetchLandlordLeases,
  fetchLandlordMaintenanceRequests,
  fetchLandlordPayments,
  fetchLandlordProperties,
  fetchLandlordTenants,
} from '@/api/modules/landlordApi';

const queryOptions = {
  staleTime: 60_000,
  refetchOnWindowFocus: false,
  retry: (failureCount: number, error: unknown) => {
    if (error instanceof AxiosError && error.response && isNonRetryableStatus(error.response.status)) {
      return false;
    }

    return failureCount < 2;
  },
} as const;

export function useLandlordProperties() {
  return useQuery({
    queryKey: ['landlord', 'properties'],
    queryFn: fetchLandlordProperties,
    ...queryOptions,
  });
}

export function useLandlordTenants() {
  return useQuery({
    queryKey: ['landlord', 'tenants'],
    queryFn: fetchLandlordTenants,
    ...queryOptions,
  });
}

export function useLandlordLeases() {
  return useQuery({
    queryKey: ['landlord', 'leases'],
    queryFn: fetchLandlordLeases,
    ...queryOptions,
  });
}

export function useLandlordPayments() {
  return useQuery({
    queryKey: ['landlord', 'payments'],
    queryFn: fetchLandlordPayments,
    ...queryOptions,
  });
}

export function useLandlordMaintenanceRequests() {
  return useQuery({
    queryKey: ['landlord', 'maintenance-requests'],
    queryFn: fetchLandlordMaintenanceRequests,
    ...queryOptions,
  });
}
