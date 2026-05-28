import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes/routes';

/**
 * Tenant self-registration page.
 * Self-registration is NOT yet supported by the backend.
 * This page is honest about that — it does not fake a signup flow.
 */
export default function TenantSignupPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Tenant Registration</h2>
        <Alert variant="warning" title="Self-registration not yet available">
          Tenant accounts cannot be created through this form at this time. Your landlord or
          property manager must register you through the system and provide your login credentials.
        </Alert>
        <p className="mt-4 text-sm text-gray-600">
          If you have already been registered, please sign in using your provided credentials.
        </p>
        <Button
          className="mt-6 w-full"
          variant="secondary"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Go to Sign In
        </Button>
      </Card>
    </div>
  );
}
