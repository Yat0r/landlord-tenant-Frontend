# LandlordTenant — Auth Flow

## Overview
Authentication is handled via Keycloak using the OIDC Authorization Code Flow,
implemented with `react-oidc-context` and `oidc-client-ts`.

## Flow Steps

### 1. User visits a protected route
`ProtectedRoute` checks `isAuthenticated`. If false, redirect to `/login`.

### 2. Login Page (`/login`)
User clicks "Continue with Keycloak". `auth.signinRedirect()` sends the user to
Keycloak's login page.

### 3. Keycloak authentication
Keycloak handles credential verification (username/password, MFA, SSO, etc.).

### 4. Callback (`/auth/callback`)
Keycloak redirects back to `VITE_KEYCLOAK_REDIRECT_URI` with an authorization code.
`react-oidc-context` exchanges this for tokens automatically.

### 5. Role extraction
`extractRolesFromUser()` in `src/auth/utils/authHelpers.ts` reads roles from:
- `realm_access.roles` — Keycloak realm-level roles
- `resource_access.<clientId>.roles` — client-specific roles

Only roles matching `Admin | PropertyManager | Landlord | Tenant` are recognised.

### 6. Role-based redirect
`getRoleRedirectPath()` selects the portal based on role priority:
```
Admin → /admin/dashboard
PropertyManager → /propertymanager/dashboard
Landlord → /landlord/dashboard
Tenant → /tenant/dashboard
(none matched) → /unauthorized
```

### 7. Route protection
`RoleGuard` enforces role requirements on every protected route group.
If a user navigates to a portal they don't have access to, they are redirected to `/unauthorized`.

## Unauthorized Behaviour
- `/unauthorized` is displayed when a user is authenticated but lacks the required role.
- Users are offered a link back to their own dashboard and a sign-out option.

## Account Not Linked
- `/account-not-linked` is shown when a Keycloak user is authenticated but has no
  matching profile record in the LandlordTenant backend.
- The frontend navigates here when the backend returns a profile-not-found error.

## Role Change Behaviour
Keycloak role changes **do not take effect immediately** in an active session.
The OIDC access token is cached. After a role change in Keycloak:
1. The user must sign out via the LandlordTenant UI.
2. Sign in again to receive a new token containing updated roles.

The `/auth/me` page reminds users of this behaviour.

## Token Safety
- Raw access tokens and ID tokens are **never displayed** in the UI.
- `useAuth()` only exposes: `isAuthenticated`, `isLoading`, `roles`, `redirectPath`, `signIn`, `signOut`.
- Token attachment to API requests is handled in `src/api/clients/httpClient.ts` via `setAuthToken()`.
