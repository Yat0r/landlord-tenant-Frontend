# LandlordTenant — Project Overview

## Product Purpose
LandlordTenant is a real-world property management platform for the Kenyan market.
It enables landlords to manage properties, leases, tenants, and payments, while giving
tenants self-service access to their lease and maintenance requests. Administrators and
property managers have elevated access for system-wide oversight.

This is not a demo or portfolio project. All UI must be truthful, functional, and
connected to real backend APIs.

## Roles

| Role | Portal | Description |
|------|--------|-------------|
| Admin | `/admin/*` | Full system access — manages landlords, tenants, properties, leases, payments, maintenance, audit logs |
| PropertyManager | `/propertymanager/*` | Manages a subset of properties on behalf of landlords |
| Landlord | `/landlord/*` | Manages own properties, tenants, leases, and payments |
| Tenant | `/tenant/*` | Views own lease, payments, and submits maintenance requests |

## Backend API
- Framework: ASP.NET Core Web API
- Base URL: `http://localhost:5235` (development)
- Authentication: Keycloak JWT Bearer tokens

All API route constants are defined in `src/api/modules/endpoints.ts`.
See `docs/api-routes.md` for the full reference.

## Authentication
- Provider: Keycloak (OIDC / OAuth 2.0)
- Authority: `http://localhost:8080/realms/landlord-tenant`
- Library: `react-oidc-context` + `oidc-client-ts`
- Flow: Authorization Code Flow with PKCE

See `docs/auth-flow.md` for full details.

## Frontend Architecture

```
src/
  app/          → OIDC config, providers, query client, router
  auth/         → useAuth hook, ProtectedRoute, RoleGuard, authHelpers
  api/          → Axios client, endpoint constants, API helpers
  layouts/      → AuthLayout, DashboardLayout, AdminLayout, LandlordLayout, TenantLayout, PropertyManagerLayout
  components/   → Shared UI: Button, Card, Badge, Input, Alert, Modal, Spinner, StatCard, PageHeader, feedback components
  features/     → Future: role-scoped feature modules (not yet implemented)
  pages/        → Route-level page components per portal
  types/        → TypeScript interfaces for API responses, auth, domain models
  utils/        → formatCurrency (KES), formatDate, handleApiError, getStatusBadgeVariant, hasPermission
  constants/    → ROLES, ROUTES, ENDPOINTS
  hooks/        → Reusable hooks (api, ui)
```

## Real-world UX Rules
- Never show fake data, fake success states, or fake workflows.
- Unimplemented features use `PlannedState` — never a broken or empty page.
- Self-registration is not supported; pages say so clearly.
- Landlord accounts require admin activation; the UI says so clearly.
- Role changes in Keycloak require a sign-out/sign-in cycle; users are informed.
- Raw tokens are never exposed in the UI.
- All currency is formatted as KES using `formatCurrency()`.
- API errors show an `ErrorState` with a retry option, not a blank page.
