/**
 * API endpoint constants for LandlordTenant.
 * These are the ONLY correct routes — do not use /api/admin/tenants,
 * /api/admin/landlords, /api/maintenance, /api/landlord/profile, etc.
 */

export const ENDPOINTS = {
  // ─── Admin ────────────────────────────────────────────────────────────────
  ADMIN: {
    DASHBOARD_SUMMARY: '/api/admin/dashboard-summary',    
    LANDLORDS: '/api/landlords',
    TENANTS: '/api/tenants',
    PROPERTIES: '/api/properties',
    LEASES: '/api/leases',
    PAYMENTS: '/api/payments',
    MAINTENANCE_REQUESTS: '/api/maintenance-requests',
    AUDIT_LOGS: '/api/audit-logs',
  },

  // ─── Tenant (self-service) ─────────────────────────────────────────────────
  TENANT: {
    PROFILE: '/api/tenant/me/profile',
    LEASES: '/api/tenant/me/leases',
    PAYMENTS: '/api/tenant/me/payments',
    MAINTENANCE_REQUESTS: '/api/tenant/me/maintenance-requests',
  },

  // ─── Landlord (self-service) ───────────────────────────────────────────────
  LANDLORD: {
    PROFILE: '/api/landlord/me/profile',
    PROPERTIES: '/api/landlord/me/properties',
    TENANTS: '/api/landlord/me/tenants',
    LEASES: '/api/landlord/me/leases',
    PAYMENTS: '/api/landlord/me/payments',
    MAINTENANCE_REQUESTS: '/api/landlord/me/maintenance-requests',
    DASHBOARD_SUMMARY: '/api/landlord/me/dashboard-summary',
  },
} as const;

export const adminQuery ={
  properties:  (qs?: string) => `${ENDPOINTS.ADMIN.PROPERTIES}${qs ? `?${qs}` : ""}`,
  payments:    (qs?: string) => `${ENDPOINTS.ADMIN.PAYMENTS}${qs ? `?${qs}` : ""}`,
  maintenance: (qs?: string) => `${ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS}${qs ? `?${qs}` : ""}`,
  leases:      (qs?: string) => `${ENDPOINTS.ADMIN.LEASES}${qs ? `?${qs}` : ""}`,
  landlords:   (qs?: string) => `${ENDPOINTS.ADMIN.LANDLORDS}${qs ? `?${qs}` : ""}`,
  tenants:     (qs?: string) => `${ENDPOINTS.ADMIN.TENANTS}${qs ? `?${qs}` : ""}`,
  auditLogs:   (qs?: string) => `${ENDPOINTS.ADMIN.AUDIT_LOGS}${qs ? `?${qs}` : ""}`,
};
