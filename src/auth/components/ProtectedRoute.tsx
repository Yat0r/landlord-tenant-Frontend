import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes/routes';
import { LoadingState } from '@/components/feedback/LoadingState';

interface ProtectedRouteProps {
  /** If true, only checks authentication (any authenticated user passes). */
  requireAuth?: boolean;
}

/**
 * Guards any route that requires authentication.
 * Redirects unauthenticated users to /login.
 * Shows a loading state while the OIDC session is being restored.
 */
export function ProtectedRoute({ requireAuth = true }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Verifying session..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
