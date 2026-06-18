import { Navigate, Outlet } from 'react-router-dom';
import { appEnv } from '@/app/config/env';
import { LoadingState } from '@/components/feedback/LoadingState';
import { hasRole, type AppRole } from '@/auth/utils/roles';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes/routes';

interface RequireRoleProps {
  roles: AppRole[];
}

export function RequireRole({ roles }: RequireRoleProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingState message="Checking access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (!hasRole(user ?? null, roles, appEnv.oidcClientId)) {
    return <Navigate to={ROUTES.UNAUTHORIZED} replace />;
  }

  return <Outlet />;
}
