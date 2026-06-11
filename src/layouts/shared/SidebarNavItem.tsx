import { type FC } from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';

export interface SidebarNavItemProps {
  label: string;
  to: string;
  icon: FC<{ className?: string }>;
  isPlanned?: boolean;
}

export function SidebarNavItem({ label, to, icon: Icon, isPlanned }: SidebarNavItemProps) {
  if (isPlanned) {
    return (
      <li>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 opacity-60">
          <Icon className="h-5 w-5 shrink-0" />
          <span className="truncate">{label}</span>
          <span className="ml-auto text-[10px] font-semibold uppercase text-slate-500">Soon</span>
        </div>
      </li>
    );
  }

  return (
    <li>
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
    </li>
  );
}

export interface RoleBadgeProps {
  role: string;
}

const roleStyles: Record<string, string> = {
  Admin: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white',
  Landlord: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
  Tenant: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white',
  PropertyManager: 'bg-gradient-to-r from-sky-500 to-blue-500 text-white',
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const style = roleStyles[role] ?? 'bg-slate-600 text-slate-200';
  return (
    <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', style)}>
      {role}
    </span>
  );
}