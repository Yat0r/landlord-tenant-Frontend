import { useCallback, useEffect } from 'react';
import { useAuth as useOidcAuth } from 'react-oidc-context';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { setupApiInterceptors } from '@/api/setupApiInterceptors';
import { ROUTES } from '@/constants/routes/routes';
import { ROLES } from '@/constants/roles/roles';

// Auth guards
import { RequireAuth } from '@/auth/components/RequireAuth';
import { RequireRole } from '@/auth/components/RequireRole';

// Layouts
import { AuthLayout } from '@/layouts/auth/AuthLayout';
import { AdminLayout } from '@/layouts/admin/AdminLayout';
import { LandlordLayout } from '@/layouts/landlord/LandlordLayout';
import { TenantLayout } from '@/layouts/tenant/TenantLayout';
import { PropertyManagerLayout } from '@/layouts/propertymanager/PropertyManagerLayout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import AuthCallbackPage from '@/pages/auth/AuthCallbackPage';
import AuthMePage from '@/pages/auth/AuthMePage';
import TenantSignupPage from '@/pages/auth/TenantSignupPage';
import LandlordAccessPage from '@/pages/auth/LandlordAccessPage';
import AccountProfilePage from '@/pages/account/AccountProfilePage';
import OnboardingPage from '@/pages/public/OnboardingPage';

// Error pages
import UnauthorizedPage from '@/pages/errors/UnauthorizedPage';
import AccountNotLinkedPage from '@/pages/errors/AccountNotLinkedPage';
import SessionExpiredPage from '@/auth/components/SessionExpiredPage';

// Portal pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminLeasesPage from '@/pages/admin/AdminLeasesPage';
import AdminPaymentsPage from '@/pages/admin/AdminPaymentsPage';
import AdminPropertiesPage from '@/pages/admin/AdminPropertiesPage';
import AdminTenantsPage from '@/pages/admin/AdminTenantsPage';
import LandlordsPage from '@/features/admin/landlords/LandlordsPage';
import AddLandlordPage from '@/features/admin/landlords/AddLandlordPage';
import EditLandlordPage from '@/features/admin/landlords/EditLandlordPage';
import PropertyManagerDashboardPage from '@/pages/propertymanager/PropertyManagerDashboardPage';
import LandlordDashboardPage from '@/pages/landlord/LandlordDashboardPage';
import LandlordPropertiesPage from '@/features/landlord/properties/LandlordPropertiesPage';
import TenantDashboardPage from '@/pages/tenant/TenantDashboardPage';
import { PlannedState } from '@/components/feedback/PlannedState';

function AuthApiSetup() {
  const { user, removeUser } = useOidcAuth();
  const navigate = useNavigate();

  const handleUnauthorized = useCallback(async () => {
    await removeUser();
    navigate(ROUTES.SESSION_EXPIRED, { replace: true });
  }, [navigate, removeUser]);

  useEffect(() => {
    return setupApiInterceptors({
      getAccessToken: () => user?.access_token ?? null,
      onUnauthorized: handleUnauthorized,
    });
  }, [handleUnauthorized, user]);

  return null;
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AuthApiSetup />
      <Routes>
        {/* ── Public routes ───────────────────────────────────────────── */}
        <Route path={ROUTES.ONBOARDING} element={<OnboardingPage />} />

        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
          <Route path={ROUTES.SIGNUP_TENANT} element={<TenantSignupPage />} />
          <Route path={ROUTES.LANDLORD_ACCESS} element={<LandlordAccessPage />} />
        </Route>

        <Route path={ROUTES.AUTH_CALLBACK} element={<AuthCallbackPage />} />
        <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />
        <Route path={ROUTES.ACCOUNT_NOT_LINKED} element={<AccountNotLinkedPage />} />
        <Route path={ROUTES.SESSION_EXPIRED} element={<SessionExpiredPage />} />

        {/* ── Protected (any authenticated user) ──────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route path={ROUTES.AUTH_ME} element={<AuthMePage />} />
          <Route path={ROUTES.ACCOUNT_PROFILE} element={<AccountProfilePage />} />
        </Route>

        {/* ── Admin portal ─────────────────────────────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole roles={[ROLES.ADMIN]} />}>
            <Route element={<AdminLayout />}>
              <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminDashboardPage />} />
              <Route path={ROUTES.ADMIN_LANDLORDS} element={<LandlordsPage />} />
              <Route path={ROUTES.ADMIN_LANDLORDS_NEW} element={<AddLandlordPage />} />
              <Route path={ROUTES.ADMIN_LANDLORDS_EDIT} element={<EditLandlordPage />} />
              <Route path={ROUTES.ADMIN_TENANTS} element={<AdminTenantsPage />} />
              <Route path={ROUTES.ADMIN_PROPERTIES} element={<AdminPropertiesPage />} />
              <Route path={ROUTES.ADMIN_LEASES} element={<AdminLeasesPage />} />
              <Route path={ROUTES.ADMIN_PAYMENTS} element={<AdminPaymentsPage />} />
              <Route path={ROUTES.ADMIN_MAINTENANCE} element={<PlannedState feature="Maintenance" />} />
              <Route path={ROUTES.ADMIN_AUDIT_LOGS} element={<PlannedState feature="Audit Logs" />} />
              <Route path={ROUTES.ADMIN_REPORTS} element={<PlannedState feature="Reports" />} />
              <Route path={ROUTES.ADMIN_USERS_ROLES} element={<PlannedState feature="Users & Roles" />} />
              <Route path={ROUTES.ADMIN_SETTINGS} element={<PlannedState feature="Settings" />} />
              <Route path={ROUTES.ADMIN} element={<Navigate to={ROUTES.ADMIN_DASHBOARD} replace />} />
            </Route>
          </Route>
        </Route>

        {/* ── PropertyManager portal ───────────────────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole roles={[ROLES.PROPERTY_MANAGER]} />}>
            <Route element={<PropertyManagerLayout />}>
              <Route path={ROUTES.PROPERTY_MANAGER_DASHBOARD} element={<PropertyManagerDashboardPage />} />
              <Route path={ROUTES.PROPERTY_MANAGER_PROPERTIES} element={<PlannedState feature="Properties" />} />
              <Route path={ROUTES.PROPERTY_MANAGER_TENANTS} element={<PlannedState feature="Tenants" />} />
              <Route path={ROUTES.PROPERTY_MANAGER_LEASES} element={<PlannedState feature="Leases" />} />
              <Route path={ROUTES.PROPERTY_MANAGER_MAINTENANCE} element={<PlannedState feature="Maintenance" />} />
              <Route path={ROUTES.PROPERTY_MANAGER} element={<Navigate to={ROUTES.PROPERTY_MANAGER_DASHBOARD} replace />} />
            </Route>
          </Route>
        </Route>

        {/* ── Landlord portal ──────────────────────────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole roles={[ROLES.LANDLORD]} />}>
            <Route element={<LandlordLayout />}>
              <Route path={ROUTES.LANDLORD_DASHBOARD} element={<LandlordDashboardPage />} />
              <Route path={ROUTES.LANDLORD_PROFILE} element={<AccountProfilePage />} />
              <Route path={ROUTES.LANDLORD_PROPERTIES} element={<LandlordPropertiesPage />} />
              <Route path={ROUTES.LANDLORD_TENANTS} element={<PlannedState feature="My Tenants" />} />
              <Route path={ROUTES.LANDLORD_LEASES} element={<PlannedState feature="My Leases" />} />
              <Route path={ROUTES.LANDLORD_PAYMENTS} element={<PlannedState feature="Payments" />} />
              <Route path={ROUTES.LANDLORD_MAINTENANCE} element={<PlannedState feature="Maintenance" />} />
              <Route path={ROUTES.LANDLORD} element={<Navigate to={ROUTES.LANDLORD_DASHBOARD} replace />} />
            </Route>
          </Route>
        </Route>

        {/* ── Tenant portal ────────────────────────────────────────────── */}
        <Route element={<RequireAuth />}>
          <Route element={<RequireRole roles={[ROLES.TENANT]} />}>
            <Route element={<TenantLayout />}>
              <Route path={ROUTES.TENANT_DASHBOARD} element={<TenantDashboardPage />} />
              <Route path={ROUTES.TENANT_PROFILE} element={<AccountProfilePage />} />
              <Route path={ROUTES.TENANT_LEASES} element={<PlannedState feature="My Lease" />} />
              <Route path={ROUTES.TENANT_PAYMENTS} element={<PlannedState feature="My Payments" />} />
              <Route path={ROUTES.TENANT_MAINTENANCE} element={<PlannedState feature="Maintenance Requests" />} />
              <Route path={ROUTES.TENANT} element={<Navigate to={ROUTES.TENANT_DASHBOARD} replace />} />
            </Route>
          </Route>
        </Route>

        {/* ── Fallback ─────────────────────────────────────────────────── */}
        <Route path="/" element={<Navigate to={ROUTES.ONBOARDING} replace />} />
        <Route path="*" element={<Navigate to={ROUTES.UNAUTHORIZED} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
