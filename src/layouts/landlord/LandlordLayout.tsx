import { NavLink } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { ROUTES } from '@/constants/routes/routes';
import { useAuth } from '@/auth/hooks/useAuth';
import {
  LayoutDashboard, User, Building2, Users,
  FileText, CreditCard, Wrench, LogOut,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Dashboard', to: ROUTES.LANDLORD_DASHBOARD, icon: LayoutDashboard },
  { label: 'Profile', to: ROUTES.LANDLORD_PROFILE, icon: User },
  { label: 'Properties', to: ROUTES.LANDLORD_PROPERTIES, icon: Building2 },
  { label: 'Tenants', to: ROUTES.LANDLORD_TENANTS, icon: Users },
  { label: 'Leases', to: ROUTES.LANDLORD_LEASES, icon: FileText },
  { label: 'Payments', to: ROUTES.LANDLORD_PAYMENTS, icon: CreditCard },
  { label: 'Maintenance', to: ROUTES.LANDLORD_MAINTENANCE, icon: Wrench },
];

function LandlordSidebar() {
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Landlord Portal</p>
        <p className="mt-1 text-base font-bold text-gray-900">LandlordTenant</p>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200 px-3 py-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function LandlordLayout() {
  return <DashboardLayout sidebar={<LandlordSidebar />} />;
}
