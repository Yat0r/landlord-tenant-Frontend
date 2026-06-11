import { NavLink } from 'react-router-dom';
import { type FC, useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { ROUTES } from '@/constants/routes/routes';
import { useAuth } from '@/auth/hooks/useAuth';
import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  CreditCard,
  Wrench,
  ScrollText,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  KeyRound,
  UserCircle,
  Sun,
  Moon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { RoleBadge } from '../shared/SidebarNavItem';

const adminNavItems: Array<{ label: string; to: string; icon: FC<{ className?: string }>; planned?: boolean }> = [
  { label: 'Dashboard', to: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
  { label: 'Landlords', to: ROUTES.ADMIN_LANDLORDS, icon: Users },
  { label: 'Properties', to: ROUTES.ADMIN_PROPERTIES, icon: Building2 },
  { label: 'Tenants', to: ROUTES.ADMIN_TENANTS, icon: Users },
  { label: 'Leases', to: ROUTES.ADMIN_LEASES, icon: FileText },
  { label: 'Payments', to: ROUTES.ADMIN_PAYMENTS, icon: CreditCard },
  { label: 'Maintenance', to: ROUTES.ADMIN_MAINTENANCE, icon: Wrench, planned: true },
  { label: 'Audit Logs', to: ROUTES.ADMIN_AUDIT_LOGS, icon: ScrollText, planned: true },
  { label: 'Reports', to: ROUTES.ADMIN_REPORTS, icon: BarChart3, planned: true },
  { label: 'Settings', to: ROUTES.ADMIN_SETTINGS, icon: Settings, planned: true },
];

type ClaimMap = Record<string, unknown>;

function getString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getInitials(name: string, fallback: string): string {
  const source = name.trim() || fallback.trim() || 'Admin';
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return initials || 'AD';
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 shadow-lg shadow-emerald-500/25">
        <span className="text-lg font-bold text-white">LT</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-white">LandlordTenant</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Property OS</p>
      </div>
    </div>
  );
}

function AdminSidebar() {
  const { signOut, roles } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800/50 px-5 py-5">
        <BrandLogo />
        <div className="mt-3">
          <RoleBadge role={roles[0] ?? 'Admin'} />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {adminNavItems.map(({ label, to, icon: Icon, planned }) => (
            <li key={to}>
              {planned ? (
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 opacity-60">
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{label}</span>
                  <span className="ml-auto text-[10px] font-semibold uppercase text-slate-500">Soon</span>
                </div>
              ) : (
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-slate-800/50 px-3 py-4">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-slate-100"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function AdminTopbar() {
  const { user, roles, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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

  const profile = user?.profile as ClaimMap | undefined;
  const username = getString(profile?.preferred_username);
  const email = getString(profile?.email);
  const displayName = getString(profile?.name) || username || 'Current user';
  const initials = getInitials(displayName, username || email);

  return (
    <div className="flex min-w-0 items-center justify-end gap-3">
      <label className="relative hidden min-w-0 flex-1 sm:block max-w-md">
        <span className="sr-only">Search</span>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Search properties, tenants, leases..."
          className="h-10 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white"
        />
      </label>

      <button
        type="button"
        aria-pressed={isDarkMode}
        aria-label="Toggle dark mode"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <button
        type="button"
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
      </button>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          onClick={() => setIsUserMenuOpen((open: boolean) => !open)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 transition hover:bg-slate-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-white">
            {initials}
          </span>
          <span className="hidden min-w-0 leading-tight text-left md:block">
            <span className="block max-w-36 truncate text-xs font-semibold text-slate-900">{displayName}</span>
            <span className="block max-w-36 truncate text-[11px] text-slate-500">{email || roles[0]}</span>
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {isUserMenuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-40 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="truncate text-xs text-slate-500">{email || username || roles[0]}</p>
            </div>
            <NavLink
              to={ROUTES.ACCOUNT_PROFILE}
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <UserCircle className="h-4 w-4" />
              My profile
            </NavLink>
            <NavLink
              to={ROUTES.AUTH_ME}
              onClick={() => setIsUserMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              <KeyRound className="h-4 w-4" />
              Auth details
            </NavLink>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-rose-600 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminLayout() {
  return <DashboardLayout sidebar={<AdminSidebar />} topbar={<AdminTopbar />} />;
}