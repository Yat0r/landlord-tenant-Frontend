// Shared

/** Standard paginated envelope returned by every collection endpoint. */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// /api/properties

export interface ApiProperty {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRent: number;
  /** Full URL supplied by the backend - may be null if no photo uploaded yet. */
  photoUrl: string | null;
}

// /api/payments

export type PaymentStatus = 'confirmed' | 'pending' | 'failed';

export interface ApiPayment {
  id: string;
  tenantName: string;
  propertyUnit: string;
  amount: number;
  chargeDate: string;
  dueDate: string;
  status: PaymentStatus;
}

// /api/landlords

export interface ApiLandlord {
  id: string;
  name: string;
  email: string;
  /** True when the landlord record is linked to a Keycloak account. */
  keycloakLinked: boolean;
}

// /api/tenants

export interface ApiTenant {
  id: string;
  name: string;
  email: string;
  keycloakLinked: boolean;
}

// /api/leases

export interface ApiLease {
  id: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'expired' | 'terminated';
}

// /api/maintenance-requests

export type MaintenancePriority = 'high' | 'medium' | 'low';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved';

export interface ApiMaintenanceRequest {
  id: string;
  tenantName: string;
  propertyUnit: string;
  issueSummary: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  createdAt: string;
}

// /api/audit-logs

export type AuditEntityType = 'Payment' | 'Maintenance' | 'Lease' | 'Tenant' | 'Landlord';

export interface ApiAuditLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  entityType: AuditEntityType;
  entityId: string;
}
