import { NavLink } from 'react-router-dom';
import { type FC, useEffect, useState } from 'react';
import { DashboardLayout } from '@/layouts/dashboard/DashboardLayout';
import { ROUTES } from '@/constants/routes/routes';
import { useAuth } from '@/auth/hooks/useAuth';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wrench,
  LogOut,
  Search,
  Bell,
  ChevronDown,
  Sun,
  Moon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { RoleBadge } from '../shared/SidebarNavItem';

const propertyManagerNavItems: Array<{ label: string; to: string; icon: FC<{ className?: string }>; planned?: boolean }> = [
  { label: 'Dashboard', to: ROUTES.PROPERTY_MANAGER_DASHBOARD, icon: LayoutDashboard },
  { label: 'Properties', to: ROUTES.PROPERTY_MANAGER_PROPERTIES, icon: Building2, planned: true },
  { label: 'Tenants', to: ROUTES.PROPERTY_MANAGER_TENANTS, icon: Users, planned: true },
  { label: 'Leases', to: ROUTES.PROPERTY_MANAGER_LEASES, icon: FileText, planned: true },
  { label: 'Maintenance', to: ROUTES.PROPERTY_MANAGER_MAINTENANCE, icon: Wrench, planned: true },
];

type ClaimMap = Record<string, unknown>;

function getString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function getInitials(name: string, fallback: string): string {
  const source = name.trim() || fallback.trim() || 'Manager';
  const parts = source.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return initials || 'PM';
}

function BrandLogo() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary shadow-lg shadow-brand-primary/25">
        <span className="text-lg font-bold text-white">LT</span>
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-white">LandlordTenant</p>
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Manager portal</p>
      </div>
    </div>
  );
}

function PropertyManagerSidebar() {
  const { signOut, roles } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-800/50 px-5 py-5">
        <BrandLogo />
        <div className="mt-3">
          <RoleBadge role={roles[0] ?? 'PropertyManager'} />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {propertyManagerNavItems.map(({ label, to, icon: Icon, planned }) => (
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
                        ? 'bg-brand-primary text-white shadow-sm shadow-brand-primary/20'
                        : 'text-slate-300 hover:bg-white/10 hover:text-slate-100'
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
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-slate-100"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );
}

function PropertyManagerTopbar() {
  const { user, roles, signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('propertymanager-theme');
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDarkMode);
    root.style.colorScheme = isDarkMode ? 'dark' : 'light';
    window.localStorage.setItem('propertymanager-theme', isDarkMode ? 'dark' : 'light');
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
          placeholder="Search properties, tenants..."
          className="h-10 w-full rounded-full border border-brand-border bg-brand-panel pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:bg-white"
        />
      </label>

      <button
        type="button"
        aria-pressed={isDarkMode}
        aria-label="Toggle dark mode"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-muted hover:bg-brand-panel"
        title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      <button
        type="button"
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-brand-border text-brand-muted hover:bg-brand-panel"
      >
        <Bell className="h-4 w-4" />
      </button>

      <div className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={isUserMenuOpen}
          onClick={() => setIsUserMenuOpen((open: boolean) => !open)}
          className="flex items-center gap-2 rounded-full border border-brand-border bg-brand-panel py-1 pl-1 pr-2 transition hover:bg-slate-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
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
              <p className="truncate text-xs text-slate-500">{email || roles[0]}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsUserMenuOpen(false);
                void signOut();
              }}
              className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-2.5 text-left text-sm text-brand-danger hover:bg-slate-50"
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

export function PropertyManagerLayout() {
  return <DashboardLayout sidebar={<PropertyManagerSidebar />} topbar={<PropertyManagerTopbar />} />;
}
