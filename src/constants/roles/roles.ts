import type { AppRole } from '@/auth/utils/roles';

export const roles = {
  admin: 'Admin',
  propertyManager: 'PropertyManager',
  landlord: 'Landlord',
  tenant: 'Tenant',
} as const satisfies Record<string, AppRole>;

export type { AppRole } from '@/auth/utils/roles';

export const ROLES = {
  ADMIN: roles.admin,
  PROPERTY_MANAGER: roles.propertyManager,
  LANDLORD: roles.landlord,
  TENANT: roles.tenant,
} as const;

export const ALL_ROLES: AppRole[] = [
  roles.admin,
  roles.propertyManager,
  roles.landlord,
  roles.tenant,
];
