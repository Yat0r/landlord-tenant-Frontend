import { httpClient } from '@/api/clients/httpClient';
import {
  unwrapApiResponse,
  type ApiResponse,
  type PagedResponse,
} from '@/api/helpers/apiHelpers';
import { normalizePagedResult, type RawPagedResult } from '@/api/helpers/normalizePagedResult';
import { ENDPOINTS } from './endpoints';
import type {
  AuditLogEntity,
  LeaseEntity,
  LandlordEntity,
  MaintenanceRequestEntity,
  PaymentEntity,
  PagedResult,
  PropertyEntity,
  TenantEntity,
  PaymentStatus,
  MaintenanceStatus,
  MaintenancePriority,
  LeaseStatus,
  UnitEntity,
} from '@/types/domain/entities';

export interface CreatePropertyPayload {
  name: string;
  address: string;
  totalUnits: number;
  monthlyRent: number;
  landlordId?: string;
  photoUrl?: string;
}

type QueryValue = string | number | boolean | undefined;

function qs(params: Record<string, QueryValue>): string {
  const parts = Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`);

  return parts.length ? `?${parts.join('&')}` : '';
}

async function get<T>(url: string): Promise<T> {
  const response = await httpClient.get<ApiResponse<T>>(url);
  return unwrapApiResponse(response.data);
}

async function getPaged<T>(url: string): Promise<PagedResult<T>> {
  const raw = await get<RawPagedResult<T> | PagedResponse<T> | T[]>(url);
  return normalizePagedResult(raw);
}

export function fetchLandlords(params: {
  page?: number;
  pageSize?: number;
  keycloakLinked?: boolean;
} = {}) {
  const { page = 1, pageSize = 50, keycloakLinked } = params;
  return getPaged<LandlordEntity>(
    `${ENDPOINTS.ADMIN.LANDLORDS_QUERY}${qs({ pageNumber: page, pageSize, keycloakLinked })}`
  );
}

export function fetchTenants(params: {
  page?: number;
  pageSize?: number;
  keycloakLinked?: boolean;
} = {}) {
  const { page = 1, pageSize = 50, keycloakLinked } = params;
  return getPaged<TenantEntity>(
    `${ENDPOINTS.ADMIN.TENANTS_QUERY}${qs({ pageNumber: page, pageSize, keycloakLinked })}`
  );
}

export function fetchProperties(params: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = 100 } = params;
  return getPaged<PropertyEntity>(
    `${ENDPOINTS.ADMIN.PROPERTIES_QUERY}${qs({ pageNumber: page, pageSize })}`
  );
}

export function fetchUnits(params: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = 100 } = params;
  return getPaged<UnitEntity>(
    `${ENDPOINTS.ADMIN.UNITS_QUERY}${qs({ pageNumber: page, pageSize })}`
  );
}

export function createProperty(payload: CreatePropertyPayload) {
  return httpClient
    .post<ApiResponse<PropertyEntity>>(ENDPOINTS.ADMIN.PROPERTIES, payload)
    .then((response) => unwrapApiResponse(response.data));
}

export function fetchLeases(params: {
  page?: number;
  pageSize?: number;
  status?: LeaseStatus;
} = {}) {
  const { page = 1, pageSize = 100, status } = params;
  return getPaged<LeaseEntity>(
    `${ENDPOINTS.ADMIN.LEASES_QUERY}${qs({ pageNumber: page, pageSize, status })}`
  );
}

export function fetchPayments(params: {
  page?: number;
  pageSize?: number;
  status?: PaymentStatus;
} = {}) {
  const { page = 1, pageSize = 100, status } = params;
  return getPaged<PaymentEntity>(
    `${ENDPOINTS.ADMIN.PAYMENTS_QUERY}${qs({ pageNumber: page, pageSize, status })}`
  );
}

export function fetchMaintenanceRequests(params: {
  page?: number;
  pageSize?: number;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
} = {}) {
  const { page = 1, pageSize = 100, status, priority } = params;
  return getPaged<MaintenanceRequestEntity>(
    `${ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS_QUERY}${qs({ pageNumber: page, pageSize, status, priority })}`
  );
}

export function fetchAuditLogs(params: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = 10 } = params;
  return getPaged<AuditLogEntity>(
    `${ENDPOINTS.ADMIN.AUDIT_LOGS}${qs({ pageNumber: page, pageSize })}`
  );
}
