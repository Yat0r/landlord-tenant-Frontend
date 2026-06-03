import { httpClient } from '@/api/clients/httpClient';
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
  const response = await httpClient.get<T>(url);
  return response.data;
}

async function getPaged<T>(url: string): Promise<PagedResult<T>> {
  const raw = await get<RawPagedResult<T>>(url);
  return normalizePagedResult(raw);
}

export function fetchLandlords(params: {
  page?: number;
  pageSize?: number;
  keycloakLinked?: boolean;
} = {}) {
  const { page = 1, pageSize = 50, keycloakLinked } = params;
  return getPaged<LandlordEntity>(
    `${ENDPOINTS.ADMIN.LANDLORDS}${qs({ page, pageSize, keycloakLinked })}`
  );
}

export function fetchTenants(params: {
  page?: number;
  pageSize?: number;
  keycloakLinked?: boolean;
} = {}) {
  const { page = 1, pageSize = 50, keycloakLinked } = params;
  return getPaged<TenantEntity>(
    `${ENDPOINTS.ADMIN.TENANTS}${qs({ page, pageSize, keycloakLinked })}`
  );
}

export function fetchProperties(params: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = 100 } = params;
  return getPaged<PropertyEntity>(`${ENDPOINTS.ADMIN.PROPERTIES}${qs({ page, pageSize })}`);
}

export function createProperty(payload: CreatePropertyPayload) {
  return httpClient.post<PropertyEntity>(ENDPOINTS.ADMIN.PROPERTIES, payload).then((response) => response.data);
}

export function fetchLeases(params: {
  page?: number;
  pageSize?: number;
  status?: LeaseStatus;
} = {}) {
  const { page = 1, pageSize = 100, status } = params;
  return getPaged<LeaseEntity>(`${ENDPOINTS.ADMIN.LEASES}${qs({ page, pageSize, status })}`);
}

export function fetchPayments(params: {
  page?: number;
  pageSize?: number;
  status?: PaymentStatus;
} = {}) {
  const { page = 1, pageSize = 100, status } = params;
  return getPaged<PaymentEntity>(`${ENDPOINTS.ADMIN.PAYMENTS}${qs({ page, pageSize, status })}`);
}

export function fetchMaintenanceRequests(params: {
  page?: number;
  pageSize?: number;
  status?: MaintenanceStatus;
  priority?: MaintenancePriority;
} = {}) {
  const { page = 1, pageSize = 100, status, priority } = params;
  return getPaged<MaintenanceRequestEntity>(
    `${ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS}${qs({ page, pageSize, status, priority })}`
  );
}

export function fetchAuditLogs(params: { page?: number; pageSize?: number } = {}) {
  const { page = 1, pageSize = 10 } = params;
  return getPaged<AuditLogEntity>(`${ENDPOINTS.ADMIN.AUDIT_LOGS}${qs({ page, pageSize })}`);
}
