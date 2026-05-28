export const roles = {
  admin: 'Admin',
  propertyManager: 'PropertyManager',
  landlord: 'Landlord',
  tenant: 'Tenant',
} as const;

export type AppRole = (typeof roles)[keyof typeof roles];

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
