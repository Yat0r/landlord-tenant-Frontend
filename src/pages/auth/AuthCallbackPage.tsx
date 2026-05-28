import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import { useAuth as useAppAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes/routes';
import { LoadingState } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';

/**
 * Handles the OIDC redirect callback from Keycloak.
 * After the OIDC library processes the callback, extracts roles and redirects.
 */
export default function AuthCallbackPage() {
  const auth = useAuth();
  const { redirectPath } = useAppAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isLoading) return;

    if (auth.error) return; // Stay on page to show error below

    if (auth.isAuthenticated) {
      navigate(redirectPath, { replace: true });
    } else {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.error, redirectPath, navigate]);

  if (auth.isLoading) {
    return <LoadingState message="Completing sign-in..." />;
  }

  if (auth.error) {
    return (
      <ErrorState
        message={`Authentication failed: ${auth.error.message}`}
        onRetry={() => navigate(ROUTES.LOGIN, { replace: true })}
      />
    );
  }

  return <LoadingState message="Redirecting..." />;
}
