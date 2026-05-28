import { useAuth } from '@/auth/hooks/useAuth';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageHeader } from '@/components/ui/PageHeader';

export default function AuthMePage() {
  const { user, roles } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <PageHeader title="My Auth Info" description="Your current session details." />
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
        </CardHeader>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Username</dt>
            <dd className="text-gray-900">{user?.profile?.preferred_username ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Email</dt>
            <dd className="text-gray-900">{user?.profile?.email ?? '—'}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="font-medium text-gray-500">Name</dt>
            <dd className="text-gray-900">{user?.profile?.name ?? '—'}</dd>
          </div>
          <div className="flex items-start justify-between gap-4">
            <dt className="font-medium text-gray-500">Roles</dt>
            <dd className="flex flex-wrap justify-end gap-1">
              {roles.length === 0 ? (
                <span className="text-gray-400">No roles assigned</span>
              ) : (
                roles.map((role) => (
                  <Badge key={role} variant="info">{role}</Badge>
                ))
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-gray-400">
          Raw tokens are never displayed. If your roles have changed in Keycloak, sign out and sign in again.
        </p>
      </Card>
    </div>
  );
}
