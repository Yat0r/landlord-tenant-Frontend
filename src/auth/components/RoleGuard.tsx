import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { hasRequiredRole } from '@/auth/utils/authHelpers';
import { ROUTES } from '@/constants/routes/routes';
import { LoadingState } from '@/components/feedback/LoadingState';
import type { AppRole } from '@/constants/roles/roles';

interface RoleGuardProps {
  /** At least one of these roles must be present on the authenticated user. */
  roles: AppRole[];
}

/**
 * Guards a route by role.
 * Must be nested inside a <ProtectedRoute> — it assumes the user is authenticated.
 * Redirects to /unauthorized if the user lacks the required role.
 *
 * Note: Role changes made in Keycloak require the user to sign out and sign in
 * again before they take effect in the frontend session.
 */
export function RoleGuard({ roles }: RoleGuardProps) {
  const { isAuthenticated, isLoading, roles: userRoles } = useAuth();

  if (isLoading) {
    return <LoadingState message="Checking access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!hasRequiredRole(userRoles, roles)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
