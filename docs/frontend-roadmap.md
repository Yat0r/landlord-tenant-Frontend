# LandlordTenant — Frontend Roadmap

## Phase 1: Auth and Access Pages ✅ (Current)
- Login page with Keycloak redirect
- OIDC callback handler
- Role extraction from realm_access and resource_access
- ProtectedRoute and RoleGuard components
- /unauthorized, /account-not-linked pages
- Truthful /signup/tenant and /landlord-access pages
- /auth/me identity viewer

## Phase 2: RBAC Hardening
- Verify Keycloak login end-to-end in development
- Test all four role flows (Admin, PropertyManager, Landlord, Tenant)
- Confirm token attachment via setAuthToken() on API client
- Add silent token renewal handling
- Add session expiry UX

## Phase 3: API Client Stability
- Wire setAuthToken() from auth context to httpClient
- Add global 401 handler to redirect to /login on token expiry
- Add request/response logging in development
- Implement and test normalizePagedResult helper
- Establish error handling patterns across all portals

## Phase 4: Shared Design System
- Finalize Button, Card, Badge, Input, Select, Modal, Alert
- Build reusable Table component with sorting and pagination
- Build reusable Form components with react-hook-form + zod
- Establish consistent loading, error, and empty state patterns
- Document component API in JSDoc

## Phase 5: Admin Portal
- Admin Dashboard with live stats from API
- Landlords list and detail views (/api/landlords)
- Tenants list and detail views (/api/tenants)
- Properties list and detail (/api/properties)
- Leases management (/api/leases)
- Payments overview (/api/payments)
- Maintenance requests (/api/maintenance-requests)
- Audit Logs viewer (/api/audit-logs)

## Phase 6: Tenant Portal
- Tenant profile view and edit (/api/tenant/me/profile)
- My Lease view (/api/tenant/me/leases)
- Payment history (/api/tenant/me/payments)
- Maintenance requests list and submission (/api/tenant/me/maintenance-requests)

## Phase 7: Landlord Portal
- Landlord Dashboard with live summary (/api/landlord/me/dashboard-summary)
- Profile view and edit (/api/landlord/me/profile)
- My Properties (/api/landlord/me/properties)
- My Tenants (/api/landlord/me/tenants)
- Leases (/api/landlord/me/leases)
- Payments (/api/landlord/me/payments)
- Maintenance (/api/landlord/me/maintenance-requests)

## Phase 8: PropertyManager Portal
- Dashboard
- Properties view
- Tenants view
- Leases view
- Maintenance request management

## Phase 9: Reports & Planned States
- Admin reports section (PlannedState until backend supports it)
- Admin settings (PlannedState)
- Replace all remaining PlannedState components with real implementations

## Phase 10: QA and Production Readiness
- End-to-end tests for auth flows
- Role-based access test coverage
- API error boundary testing
- Accessibility audit (keyboard navigation, ARIA)
- Performance review (bundle size, lazy loading routes)
- Environment variable validation on startup
- Production build and deployment checklist
