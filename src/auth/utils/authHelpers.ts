import type { User } from 'oidc-client-ts';
import { appEnv } from '@/app/config/env';
import { getUserRoles, hasRole, type AppRole } from '@/auth/utils/roles';
import { ROUTES } from '@/constants/routes/routes';
import { ALL_ROLES, ROLES } from '@/constants/roles/roles';

/**
 * Extracts application roles from a Keycloak user.
 */
export function extractRolesFromUser(user: User | null): AppRole[] {
  return getUserRoles(user, appEnv.oidcClientId);
}

/**
 * Returns the primary redirect path for a given set of roles.
 * Priority: Admin > PropertyManager > Landlord > Tenant
 */
export function getRoleRedirectPath(roles: AppRole[]): string {
  if (roles.includes(ROLES.ADMIN)) return ROUTES.ADMIN_DASHBOARD;
  if (roles.includes(ROLES.PROPERTY_MANAGER)) return ROUTES.PROPERTY_MANAGER_DASHBOARD;
  if (roles.includes(ROLES.LANDLORD)) return ROUTES.LANDLORD_DASHBOARD;
  if (roles.includes(ROLES.TENANT)) return ROUTES.TENANT_DASHBOARD;
  return ROUTES.UNAUTHORIZED;
}

/**
 * Returns true if the user has at least one of the required roles.
 */
export function hasRequiredRole(userRoles: AppRole[], requiredRoles: AppRole[]): boolean {
  if (requiredRoles.length === 0) return true;
  return requiredRoles.some((role) => userRoles.includes(role));
}

export { ALL_ROLES, ROLES, hasRole };
