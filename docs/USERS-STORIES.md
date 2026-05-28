# LandlordTenant — Frontend User Stories

## Authentication

- As any user, I can click "Continue with Keycloak" on the login page and be redirected to Keycloak to authenticate.
- As any authenticated user, I am automatically redirected to my role-specific dashboard after sign-in.
- As any authenticated user, I can view my assigned roles on the `/auth/me` page without seeing raw tokens.
- As any authenticated user, I can sign out and be redirected to the login page.
- As a user whose role was changed in Keycloak, I must sign out and sign in again for changes to take effect.

## Route Protection & RBAC

- As an unauthenticated user, accessing any protected route redirects me to `/login`.
- As an authenticated user without a matching role, I am redirected to `/unauthorized`.
- As an Admin, I can access `/admin/*` routes.
- As a PropertyManager, I can access `/propertymanager/*` routes.
- As a Landlord, I can access `/landlord/*` routes.
- As a Tenant, I can access `/tenant/*` routes.
- As a user with no Keycloak role, I see `/unauthorized` with a clear explanation.

## Truthful UI Behaviour

- As a visitor to `/signup/tenant`, I am clearly told that self-registration is not yet available.
- As a visitor to `/landlord-access`, I am clearly told that landlord accounts require administrator activation.
- No page fakes a successful signup or account creation.
- All "coming soon" sections use PlannedState, not mock data.

## Admin Workflows

- As an Admin, I can view a dashboard with system-wide stats.
- As an Admin, I can navigate to Landlords, Tenants, Properties, Leases, Payments, Maintenance, and Audit Logs.
- As an Admin, I can view planned sections with a clear "coming soon" indicator.

## Landlord Workflows

- As a Landlord, I can view my dashboard with summaries of my properties, tenants, payments, and maintenance.
- As a Landlord, I can navigate to My Profile, Properties, Tenants, Leases, Payments, and Maintenance.
- As a Landlord, I can see truthful empty states when no data is yet loaded.

## Tenant Workflows

- As a Tenant, I can view my dashboard.
- As a Tenant, I can navigate to My Profile, My Lease, Payments, and Maintenance Requests.
- As a Tenant, I can submit maintenance requests (once the feature is implemented).

## PropertyManager Workflows

- As a PropertyManager, I can view a dashboard.
- As a PropertyManager, I can navigate to Properties, Tenants, Leases, and Maintenance.

## UX & Error Handling

- As any user, I see a loading spinner while auth state is being restored.
- As any user, if my session cannot be restored, I am sent to the login page.
- As any user, if an API call fails, I see an error state with a retry option.
- As any user, if a section has no data, I see a meaningful empty state.
- As any user, if a feature is not yet built, I see a PlannedState — not a broken page.
- As any user on `/account-not-linked`, I am told to contact my administrator and offered a sign-out option.
