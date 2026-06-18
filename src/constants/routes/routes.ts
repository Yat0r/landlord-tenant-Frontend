export const ROUTES = {
  // Public / Auth
  ONBOARDING: '/onboarding',
  LOGIN: '/login',
  AUTH_CALLBACK: '/auth/callback',
  AUTH_ME: '/auth/me',
  ACCOUNT_PROFILE: '/account/profile',
  SIGNUP_TENANT: '/signup/tenant',
  LANDLORD_ACCESS: '/landlord-access',

  // Errors
  UNAUTHORIZED: '/unauthorized',
  ACCOUNT_NOT_LINKED: '/account-not-linked',
  SESSION_EXPIRED: '/session-expired',

  // Admin portal
  ADMIN: '/admin',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_LANDLORDS: '/admin/landlords',
  ADMIN_LANDLORDS_NEW: '/admin/landlords/new',
  ADMIN_LANDLORDS_EDIT: '/admin/landlords/:id/edit',
  ADMIN_TENANTS: '/admin/tenants',
  ADMIN_PROPERTIES: '/admin/properties',
  ADMIN_LEASES: '/admin/leases',
  ADMIN_PAYMENTS: '/admin/payments',
  ADMIN_MAINTENANCE: '/admin/maintenance',
  ADMIN_AUDIT_LOGS: '/admin/audit-logs',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_USERS_ROLES: '/admin/users-roles',
  ADMIN_SETTINGS: '/admin/settings',

  // PropertyManager portal
  PROPERTY_MANAGER: '/propertymanager',
  PROPERTY_MANAGER_DASHBOARD: '/propertymanager/dashboard',
  PROPERTY_MANAGER_PROPERTIES: '/propertymanager/properties',
  PROPERTY_MANAGER_TENANTS: '/propertymanager/tenants',
  PROPERTY_MANAGER_LEASES: '/propertymanager/leases',
  PROPERTY_MANAGER_MAINTENANCE: '/propertymanager/maintenance',

  // Landlord portal
  LANDLORD: '/landlord',
  LANDLORD_DASHBOARD: '/landlord/dashboard',
  LANDLORD_PROFILE: '/landlord/profile',
  LANDLORD_PROPERTIES: '/landlord/properties',
  LANDLORD_TENANTS: '/landlord/tenants',
  LANDLORD_LEASES: '/landlord/leases',
  LANDLORD_PAYMENTS: '/landlord/payments',
  LANDLORD_MAINTENANCE: '/landlord/maintenance',

  // Tenant portal
  TENANT: '/tenant',
  TENANT_DASHBOARD: '/tenant/dashboard',
  TENANT_PROFILE: '/tenant/profile',
  TENANT_LEASES: '/tenant/leases',
  TENANT_PAYMENTS: '/tenant/payments',
  TENANT_MAINTENANCE: '/tenant/maintenance',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
