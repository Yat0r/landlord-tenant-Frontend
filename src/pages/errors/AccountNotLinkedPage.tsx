import { LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/auth/hooks/useAuth';

export default function AccountNotLinkedPage() {
  const { signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <LinkIcon className="h-16 w-16 text-yellow-400" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Account Not Linked</h1>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Your Keycloak account is authenticated but has not been linked to a profile in
          LandlordTenant. Please contact your administrator to complete account setup.
        </p>
      </div>
      <Button variant="secondary" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}
