import { NavLink } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { ROUTES } from '@/constants/routes/routes';
import { useAuth } from '@/auth/hooks/useAuth';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Wrench, ScrollText, LogOut, Search, Bell,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Landlords', to: ROUTES.ADMIN_LANDLORDS, icon: Users },
  { label: 'Tenants', to: ROUTES.ADMIN_TENANTS, icon: Users },
  { label: 'Properties', to: ROUTES.ADMIN_PROPERTIES, icon: Building2 },
  { label: 'Leases', to: ROUTES.ADMIN_LEASES, icon: FileText },
  { label: 'Payments', to: ROUTES.ADMIN_PAYMENTS, icon: CreditCard },
  { label: 'Maintenance', to: ROUTES.ADMIN_MAINTENANCE, icon: Wrench },
  { label: 'Audit Logs', to: ROUTES.ADMIN_AUDIT_LOGS, icon: ScrollText },
];

function AdminSidebar() {
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Admin Portal</p>
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
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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

function AdminTopbar() {
  return (
    <div className="flex min-w-0 items-center justify-end gap-3">
      <label className="relative hidden min-w-0 flex-1 sm:block lg:max-w-sm">
        <span className="sr-only">Search</span>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
        <input
          type="search"
          placeholder="Search properties, tenants, leases..."
          className="h-10 w-full rounded-xl border border-slate-100 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-[#006948] focus:bg-white"
        />
      </label>

      <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Healthy
      </div>

      <p className="hidden font-mono text-xs text-slate-400 md:block">Refreshed 25 May 2026, 14:45</p>

      <button
        type="button"
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 text-slate-500 hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
      </button>

      <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white py-1 pl-1 pr-3 shadow-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#006948] to-[#6366f1] text-xs font-bold text-white">
          AD
        </span>
        <div className="hidden leading-tight md:block">
          <p className="text-xs font-semibold text-slate-900">Admin</p>
          <p className="text-[11px] text-slate-400">admin@lt.co.ke</p>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return <DashboardLayout sidebar={<AdminSidebar />} topbar={<AdminTopbar />} />;
}
