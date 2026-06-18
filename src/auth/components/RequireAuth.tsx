import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ROUTES } from '@/constants/routes/routes';

interface RequireAuthProps {
  requireAuth?: boolean;
}

export function RequireAuth({ requireAuth = true }: RequireAuthProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Verifying session..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <Outlet />;
}
