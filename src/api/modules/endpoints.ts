/**
 * API endpoint constants for LandlordTenant.
 * These are the ONLY correct routes for the admin dashboard.
 */

export const ENDPOINTS = {
  ADMIN: {
    LANDLORDS: '/api/landlords',
    LANDLORDS_QUERY: '/api/landlords/query',
    TENANTS: '/api/tenants',
    TENANTS_QUERY: '/api/tenants/query',
    PROPERTIES: '/api/properties',
    PROPERTIES_QUERY: '/api/properties/query',
    UNITS: '/api/units',
    UNITS_QUERY: '/api/units/query',
    LEASES: '/api/leases',
    LEASES_QUERY: '/api/leases/query',
    PAYMENTS: '/api/payments',
    PAYMENTS_QUERY: '/api/payments/query',
    MAINTENANCE_REQUESTS: '/api/maintenance-requests',
    MAINTENANCE_REQUESTS_QUERY: '/api/maintenance-requests/query',
    AUDIT_LOGS: '/api/audit-logs',
  },

  ME: {
    PROFILE: '/api/me/profile',
  },

  SYSTEM: {
    HEALTH: '/health',
  },

  TENANT: {
    PROFILE: '/api/tenant/me/profile',
    LEASES: '/api/tenant/me/leases',
    PAYMENTS: '/api/tenant/me/payments',
    MAINTENANCE_REQUESTS: '/api/tenant/me/maintenance-requests',
  },

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

export const adminQuery = {
  properties: (qs?: string) => `${ENDPOINTS.ADMIN.PROPERTIES}${qs ? `?${qs}` : ''}`,
  payments: (qs?: string) => `${ENDPOINTS.ADMIN.PAYMENTS}${qs ? `?${qs}` : ''}`,
  maintenance: (qs?: string) => `${ENDPOINTS.ADMIN.MAINTENANCE_REQUESTS}${qs ? `?${qs}` : ''}`,
  leases: (qs?: string) => `${ENDPOINTS.ADMIN.LEASES}${qs ? `?${qs}` : ''}`,
  landlords: (qs?: string) => `${ENDPOINTS.ADMIN.LANDLORDS}${qs ? `?${qs}` : ''}`,
  tenants: (qs?: string) => `${ENDPOINTS.ADMIN.TENANTS}${qs ? `?${qs}` : ''}`,
  auditLogs: (qs?: string) => `${ENDPOINTS.ADMIN.AUDIT_LOGS}${qs ? `?${qs}` : ''}`,
};
