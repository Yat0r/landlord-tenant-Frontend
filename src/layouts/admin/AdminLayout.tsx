import { NavLink } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { ROUTES } from '@/constants/routes/routes';
import { useAuth } from '@/auth/hooks/useAuth';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard, Users, Building2, FileText,
  CreditCard, Wrench, ScrollText, LogOut, Search, Bell, Settings, Moon, Sun,
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
  { label: 'Settings', to: ROUTES.ADMIN_SETTINGS, icon: Settings },
];

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#006948_0%,#0f766e_48%,#6366f1_100%)] shadow-[0_10px_30px_rgba(15,118,110,0.24)]">
        <svg viewBox="0 0 48 48" className="h-7 w-7" aria-hidden="true">
          <path
            d="M11 21.5 24 11l13 10.5"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <path
            d="M15.5 20.5V34h17"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
          <path
            d="M31.5 18.5v13"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeWidth="2.4"
          />
          <circle cx="24" cy="35.5" r="1.8" fill="white" />
        </svg>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900 dark:text-slate-100">LandlordTenant</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400 dark:text-slate-500">Admin portal</p>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const { signOut } = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-200 px-5 py-5 dark:border-slate-800">
        <BrandLogo />
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
                  ? 'bg-emerald-50 text-[#006948] dark:bg-emerald-950/60 dark:text-emerald-300'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200 px-3 py-4 dark:border-slate-800">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function AdminTopbar() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;

    const stored = window.localStorage.getItem('admin-theme');
    if (stored) return stored === 'dark';

    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
    window.localStorage.setItem('admin-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="flex min-w-0 items-center justify-end gap-3">
      <label className="relative hidden min-w-0 flex-1 sm:block lg:max-w-sm">
        <span className="sr-only">Search</span>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300 dark:text-slate-500" />
        <input
          type="search"
          placeholder="Search properties, tenants, leases..."
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#006948] focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:bg-slate-950"
        />
      </label>

      <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:flex dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        Healthy
      </div>

      <button
        type="button"
        aria-pressed={isDarkMode}
        aria-label="Toggle dark mode"
        onClick={() => setIsDarkMode((value) => !value)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <p className="hidden font-mono text-xs text-slate-400 md:block">Live dashboard data</p>

      <button
        type="button"
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
      </button>

      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#006948] to-[#6366f1] text-xs font-bold text-white">
          AD
        </span>
        <div className="hidden leading-tight md:block">
          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Admin</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">admin@lt.co.ke</p>
        </div>
      </div>
    </div>
  );
}

export function AdminLayout() {
  return <DashboardLayout sidebar={<AdminSidebar />} topbar={<AdminTopbar />} />;
}
