export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export type PaymentStatus = 'confirmed' | 'pending' | 'failed';
export type LeaseStatus = 'active' | 'expired' | 'terminated';
export type MaintenancePriority = 'high' | 'medium' | 'low' | 'urgent';
export type MaintenanceStatus = 'open' | 'in_progress' | 'resolved';
export type AuditEntityType = 'Payment' | 'Maintenance' | 'Lease' | 'Tenant' | 'Landlord';

export interface PropertyEntity {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRent: number;
  photoUrl: string | null;
  landlordId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentEntity {
  id: string;
  leaseId?: string;
  tenantId?: string;
  tenantName?: string;
  propertyUnit?: string;
  amount: number;
  chargeDate?: string;
  dueDate?: string;
  paidDate?: string;
  status: PaymentStatus;
  createdAt?: string;
}

export interface LandlordEntity {
  id: string;
  name: string;
  email: string;
  keycloakLinked: boolean;
}

export interface TenantEntity {
  id: string;
  name: string;
  email: string;
  keycloakLinked: boolean;
}

export interface LeaseEntity {
  id: string;
  propertyId: string;
  tenantId: string;
  landlordId?: string;
  startDate: string;
  endDate: string;
  monthlyRent?: number;
  status: LeaseStatus;
  createdAt?: string;
}

export interface MaintenanceRequestEntity {
  id: string;
  propertyId?: string;
  propertyUnit?: string;
  propertyName?: string;
  tenantId?: string;
  tenantName?: string;
  title?: string;
  description?: string;
  issueSummary?: string;
  priority?: MaintenancePriority;
  status: MaintenanceStatus | string;
  createdAt?: string;
  resolvedAt?: string;
}

export interface AuditLogEntity {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  entityType: AuditEntityType | string;
  entityId: string;
}

export interface HealthResponse {
  healthy?: boolean;
  status?: string;
  message?: string;
}
