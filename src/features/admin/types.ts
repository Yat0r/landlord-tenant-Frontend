// Standard paginated envelope — adjust field names to match your actual API
export interface PagedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

// /api/properties
export interface Property {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRent: number;
  photoUrl: string;
  status: "available" | "fully_occupied" | "partially_occupied";
}

// /api/payments
export interface Payment {
  id: string;
  tenantName: string;
  propertyUnit: string;
  amount: number;
  chargeDate: string;   // ISO date
  dueDate: string;
  status: "confirmed" | "pending" | "failed";
}

// /api/leases
export interface Lease {
  id: string;
  tenantId: string;
  propertyId: string;
  startDate: string;
  endDate: string;
  status: "active" | "expired" | "terminated";
}

// /api/landlords
export interface Landlord {
  id: string;
  name: string;
  email: string;
  keycloakLinked: boolean;
}

// /api/tenants
export interface Tenant {
  id: string;
  name: string;
  email: string;
  keycloakLinked: boolean;
}

// /api/maintenance-requests
export interface MaintenanceRequest {
  id: string;
  tenantName: string;
  propertyUnit: string;
  issueSummary: string;
  priority: "high" | "medium" | "low";
  status: "open" | "in_progress" | "resolved";
  createdAt: string;
}

// /api/audit-logs
export interface AuditLog {
  timestamp: string;
  userEmail: string;
  action: string;
  entityType: "Payment" | "Maintenance" | "Lease" | "Tenant" | "Landlord";
  entityId: string;
}

// Shape we derive client-side from the above until a real endpoint exists
export interface DashboardKpi {
  totalProperties: number;
  propertiesRented: number;
  available: number;
  totalTenants: number;
  totalLandlords: number;
  activeLeases: number;
  confirmedPaymentsAmount: number;
  pendingPaymentsCount: number;
  openMaintenance: number;
  unlinkedLandlords: number;
  unlinkedTenants: number;
  failedPaymentsCount: number;
}