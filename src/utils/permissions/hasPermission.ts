import type { AppRole } from '@/constants/roles/roles';

/**
 * Returns true if the user holds at least one of the permitted roles.
 *
 * Usage:
 *   const { roles } = useAuth();
 *   hasPermission(roles, [ROLES.ADMIN, ROLES.PROPERTY_MANAGER])
 */
export function hasPermission(userRoles: AppRole[], permittedRoles: AppRole[]): boolean {
  if (permittedRoles.length === 0) return true;
  return permittedRoles.some((r) => userRoles.includes(r));
}
