import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { PlannedState } from '@/components/feedback/PlannedState';
import { Building2, Users, CreditCard, Wrench } from 'lucide-react';

export default function LandlordDashboardPage() {
  return (
    <div>
      <PageHeader
        title="My Dashboard"
        description="An overview of your properties and tenants."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="My Properties" value="—" icon={<Building2 className="h-5 w-5" />} />
        <StatCard title="Active Tenants" value="—" icon={<Users className="h-5 w-5" />} />
        <StatCard title="Payments This Month" value="—" icon={<CreditCard className="h-5 w-5" />} />
        <StatCard title="Open Maintenance" value="—" icon={<Wrench className="h-5 w-5" />} />
      </div>
      <div className="mt-8">
        <PlannedState
          feature="Dashboard Summary"
          description="Live data will be fetched from /api/landlord/me/dashboard-summary."
        />
      </div>
    </div>
  );
}
