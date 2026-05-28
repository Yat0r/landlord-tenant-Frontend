import { PageHeader } from '@/components/ui/PageHeader';
import { PlannedState } from '@/components/feedback/PlannedState';

export default function TenantDashboardPage() {
  return (
    <div>
      <PageHeader
        title="My Dashboard"
        description="View your lease, payment history, and maintenance requests."
      />
      <PlannedState
        feature="Tenant Dashboard"
        description="Your lease summary and recent activity will appear here once data APIs are connected."
      />
    </div>
  );
}
