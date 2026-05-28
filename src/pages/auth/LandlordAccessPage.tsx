import { Card } from '@/components/ui/Card';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes/routes';

/**
 * Landlord access information page.
 * Landlord accounts require administrator activation — no self-service creation.
 * This page is honest: it does not fake landlord creation or activation.
 */
export default function LandlordAccessPage() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Landlord Account Access</h2>
        <Alert variant="info" title="Administrator activation required">
          Landlord accounts are created and activated by a system administrator. You cannot
          self-register as a landlord through this platform.
        </Alert>
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <p>To request a landlord account:</p>
          <ol className="ml-4 list-decimal space-y-1">
            <li>Contact your system administrator</li>
            <li>Your account will be created and assigned the Landlord role in Keycloak</li>
            <li>You will receive login credentials once your account is activated</li>
          </ol>
        </div>
        <Button
          className="mt-6 w-full"
          variant="secondary"
          onClick={() => navigate(ROUTES.LOGIN)}
        >
          Back to Sign In
        </Button>
      </Card>
    </div>
  );
}
