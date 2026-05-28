# LandlordTenant — API Routes Reference

## Correct Admin Routes
These routes are accessible by users with the `Admin` role.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/landlords` | List or create landlords |
| GET/POST | `/api/tenants` | List or create tenants |
| GET/POST | `/api/properties` | List or create properties |
| GET/POST | `/api/leases` | List or create leases |
| GET/POST | `/api/payments` | List or query payments |
| GET/POST | `/api/maintenance-requests` | List or manage all maintenance requests |
| GET | `/api/audit-logs` | Retrieve audit logs |

## Correct Tenant (Self-service) Routes
These routes are scoped to the currently authenticated tenant (`me`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/tenant/me/profile` | View or update own profile |
| GET | `/api/tenant/me/leases` | View own lease(s) |
| GET | `/api/tenant/me/payments` | View own payment history |
| GET | `/api/tenant/me/maintenance-requests` | View own maintenance requests |
| POST | `/api/tenant/me/maintenance-requests` | Submit a maintenance request |

## Correct Landlord (Self-service) Routes
These routes are scoped to the currently authenticated landlord (`me`).

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PUT | `/api/landlord/me/profile` | View or update own profile |
| GET | `/api/landlord/me/properties` | View own properties |
| GET | `/api/landlord/me/tenants` | View tenants in own properties |
| GET | `/api/landlord/me/leases` | View own leases |
| GET | `/api/landlord/me/payments` | View payment records |
| GET | `/api/landlord/me/maintenance-requests` | View maintenance requests |
| GET | `/api/landlord/me/dashboard-summary` | Dashboard summary stats |

---

## ❌ Wrong Routes — Do NOT Use

These routes do NOT exist in the backend and must never be used in frontend code:

| Wrong Route | Why It's Wrong |
|-------------|----------------|
| `/api/admin/tenants` | Admin uses `/api/tenants` directly |
| `/api/admin/landlords` | Admin uses `/api/landlords` directly |
| `/api/maintenance` | Use `/api/maintenance-requests` |
| `/api/landlord/profile` | Use `/api/landlord/me/profile` |
| `/api/landlord/properties` | Use `/api/landlord/me/properties` |

All endpoint constants are defined in `src/api/modules/endpoints.ts`.
