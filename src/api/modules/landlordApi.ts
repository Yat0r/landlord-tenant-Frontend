import { httpClient } from '@/api/clients/httpClient';
import { unwrapApiResponse, type ApiResponse, type PagedResponse } from '@/api/helpers/apiHelpers';
import { normalizePagedResult, type RawPagedResult } from '@/api/helpers/normalizePagedResult';
import { ENDPOINTS } from '@/api/modules/endpoints';
import type {
  LeaseEntity,
  MaintenanceRequestEntity,
  PaymentEntity,
  PropertyEntity,
  TenantEntity,
} from '@/types/domain/entities';

type CollectionResponse<T> = T[] | RawPagedResult<T> | PagedResponse<T>;

function normalizeCollection<T>(raw: CollectionResponse<T>): T[] {
  return normalizePagedResult(raw).items;
}

async function getCollection<T>(url: string): Promise<T[]> {
  const response = await httpClient.get<ApiResponse<CollectionResponse<T>>>(url);
  return normalizeCollection(unwrapApiResponse(response.data));
}

export function fetchLandlordProperties() {
  return getCollection<PropertyEntity>(ENDPOINTS.LANDLORD.PROPERTIES);
}

export function fetchLandlordTenants() {
  return getCollection<TenantEntity>(ENDPOINTS.LANDLORD.TENANTS);
}

export function fetchLandlordLeases() {
  return getCollection<LeaseEntity>(ENDPOINTS.LANDLORD.LEASES);
}

export function fetchLandlordPayments() {
  return getCollection<PaymentEntity>(ENDPOINTS.LANDLORD.PAYMENTS);
}

export function fetchLandlordMaintenanceRequests() {
  return getCollection<MaintenanceRequestEntity>(ENDPOINTS.LANDLORD.MAINTENANCE_REQUESTS);
}
