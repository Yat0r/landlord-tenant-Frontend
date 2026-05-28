import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export default function LoginPage() {
  const { isAuthenticated, isLoading, signIn, redirectPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, redirectPath, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <Card>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900">Sign in to your account</h2>
        <p className="mt-2 text-sm text-gray-500">
          You will be redirected to your organisation's identity provider.
        </p>
      </div>
      <div className="mt-6">
        <Button className="w-full" onClick={() => signIn()} size="lg">
          Continue with Keycloak
        </Button>
      </div>
      <p className="mt-4 text-center text-xs text-gray-400">
        Access is role-based. Contact your administrator if you cannot sign in.
      </p>
    </Card>
  );
}
