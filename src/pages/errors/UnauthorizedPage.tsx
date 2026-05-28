import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/hooks/useAuth';

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { redirectPath, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <ShieldX className="h-16 w-16 text-red-400" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          You do not have permission to view this page. If you believe this is an error,
          contact your administrator.
        </p>
        <p className="mt-2 text-xs text-gray-400">
          If your role was recently changed in Keycloak, sign out and sign in again.
        </p>
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(redirectPath)}>
          Go to my dashboard
        </Button>
        <Button variant="ghost" onClick={() => signOut()}>
          Sign out
        </Button>
      </div>
    </div>
  );
}
