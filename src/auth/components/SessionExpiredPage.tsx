import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/auth/hooks/useAuth';
import { ROUTES } from '@/constants/routes/routes';
import { useNavigate } from 'react-router-dom';

export default function SessionExpiredPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="max-w-md">
        <div className="space-y-6 text-center">
          <Alert variant="warning" title="Session expired">
            Your session has expired or is no longer valid. Sign in again to continue.
          </Alert>
          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={() => signIn()}>
              Sign in again
            </Button>
            <Button className="w-full" variant="secondary" onClick={() => navigate(ROUTES.ONBOARDING)}>
              Back to home
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
