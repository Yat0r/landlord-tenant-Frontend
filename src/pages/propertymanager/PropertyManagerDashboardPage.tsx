import { PageHeader } from '@/components/ui/PageHeader';
import { PlannedState } from '@/components/feedback/PlannedState';

export default function PropertyManagerDashboardPage() {
  return (
    <div>
      <PageHeader
        title="Property Manager Dashboard"
        description="Manage properties, tenants, leases and maintenance requests."
      />
      <PlannedState
        feature="Dashboard Summary"
        description="Property manager dashboard widgets will be implemented in the next phase."
      />
    </div>
  );
}
