import type { User } from 'oidc-client-ts';
import { ALL_ROLES, ROLES } from '@/constants/roles/roles';

export type AppRole = 'Admin' | 'Landlord' | 'Tenant' | 'PropertyManager';

interface RoleContainer {
  roles?: unknown;
}

interface ResourceAccess {
  [clientId: string]: RoleContainer | undefined;
}

interface AccessTokenClaims {
  realm_access?: RoleContainer;
  resource_access?: ResourceAccess;
  roles?: unknown;
  role?: unknown;
}

interface ProfileWithRoles {
  realm_access?: RoleContainer;
  resource_access?: ResourceAccess;
  roles?: unknown;
  role?: unknown;
}

export function getUserRoles(user: User | null, clientId?: string): AppRole[] {
  const found = new Set<AppRole>();
  const profile = user?.profile as ProfileWithRoles | undefined;

  addRolesFromContainer(found, profile?.realm_access);

  if (clientId) {
    addRolesFromContainer(found, profile?.resource_access?.[clientId]);
  }

  if (profile?.resource_access) {
    for (const clientRoles of Object.values(profile.resource_access)) {
      addRolesFromContainer(found, clientRoles);
    }
  }

  addFallbackRoles(found, profile?.roles);
  addFallbackRoles(found, profile?.role);
  addDecodedAccessTokenRoles(found, user?.access_token);

  return ALL_ROLES.filter((role) => found.has(role));
}

export function hasRole(user: User | null, allowedRoles: AppRole[], clientId?: string): boolean {
  if (allowedRoles.length === 0) return true;
  return getUserRoles(user, clientId).some((role) => allowedRoles.includes(role));
}

function addFallbackRoles(found: Set<AppRole>, value: unknown) {
  if (Array.isArray(value)) {
    value.forEach((item) => addNormalizedRole(found, item));
    return;
  }

  addNormalizedRole(found, value);
}

function addRolesFromContainer(found: Set<AppRole>, container: RoleContainer | undefined | null) {
  if (!Array.isArray(container?.roles)) return;
  container.roles.forEach((role) => addNormalizedRole(found, role));
}

function addDecodedAccessTokenRoles(found: Set<AppRole>, accessToken: string | undefined) {
  const claims = decodeAccessTokenClaims(accessToken);
  if (!claims) return;

  addRolesFromContainer(found, claims.realm_access);

  if (claims.resource_access) {
    for (const clientRoles of Object.values(claims.resource_access)) {
      addRolesFromContainer(found, clientRoles);
    }
  }

  addFallbackRoles(found, claims.roles);
  addFallbackRoles(found, claims.role);
}

function addNormalizedRole(found: Set<AppRole>, value: unknown) {
  if (typeof value !== 'string') return;

  const normalized = value.trim().replace(/[\s_-]+/g, '').toLowerCase();

  if (normalized === 'admin') {
    found.add(ROLES.ADMIN);
    return;
  }

  if (normalized === 'landlord') {
    found.add(ROLES.LANDLORD);
    return;
  }

  if (normalized === 'tenant') {
    found.add(ROLES.TENANT);
    return;
  }

  if (normalized === 'propertymanager') {
    found.add(ROLES.PROPERTY_MANAGER);
  }
}

function decodeAccessTokenClaims(accessToken: string | undefined): AccessTokenClaims | null {
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

    return JSON.parse(json) as AccessTokenClaims;
  } catch {
    return null;
  }
}
