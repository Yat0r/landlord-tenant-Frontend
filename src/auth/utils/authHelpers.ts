import type { User } from 'oidc-client-ts';
import { ALL_ROLES, ROLES, type AppRole } from '@/constants/roles/roles';
import { ROUTES } from '@/constants/routes/routes';

interface KeycloakRoleContainer {
  roles?: unknown;
}

interface KeycloakAccessTokenClaims {
  realm_access?: KeycloakRoleContainer;
  resource_access?: Record<string, KeycloakRoleContainer>;
}

/**
 * Extracts application roles from a Keycloak access token.
 *
 * Supports realm roles, known frontend/API client roles, and every
 * resource_access client role collection while retaining only app roles.
 */
export function extractRolesFromUser(user: User | null): AppRole[] {
  const claims = decodeAccessTokenClaims(user?.access_token);
  if (!claims) return [];

  const found = new Set<AppRole>();

  addRolesFromContainer(found, claims.realm_access);

  const resourceAccess = claims.resource_access;
  if (resourceAccess && typeof resourceAccess === 'object') {
    addRolesFromContainer(found, resourceAccess['landlord-tenant-frontend']);
    addRolesFromContainer(found, resourceAccess['landlord-tenant-api']);

    for (const client of Object.values(resourceAccess)) {
      addRolesFromContainer(found, client);
    }
  }

  return ALL_ROLES.filter((role) => found.has(role));
}

function isAppRole(value: string): value is AppRole {
  return (ALL_ROLES as string[]).includes(value);
}

function addRolesFromContainer(found: Set<AppRole>, container: KeycloakRoleContainer | undefined) {
  if (!Array.isArray(container?.roles)) return;

  for (const role of container.roles) {
    if (typeof role === 'string' && isAppRole(role)) {
      found.add(role);
    }
  }
}

function decodeAccessTokenClaims(accessToken: string | undefined): KeycloakAccessTokenClaims | null {
  if (!accessToken) return null;

  const [, payload] = accessToken.split('.');
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );

    return JSON.parse(json) as KeycloakAccessTokenClaims;
  } catch {
    return null;
  }
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
