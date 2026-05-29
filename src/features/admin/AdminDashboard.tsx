import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  HousePlus,
  MapPin,
  ShieldAlert,
  Users,
  Wrench,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui/Badge';
import { ROUTES } from '@/constants/routes/routes';

type Severity = 'danger' | 'warning' | 'success' | 'neutral';
type Tone = 'blue' | 'emerald' | 'amber' | 'violet' | 'rose' | 'slate';

const severityBadgeClass: Record<Severity, string> = {
  danger: 'border-red-100 bg-red-50 text-red-700 dark:border-red-950 dark:bg-red-950/50 dark:text-red-200',
  warning: 'border-amber-100 bg-amber-50 text-amber-700 dark:border-amber-950 dark:bg-amber-950/50 dark:text-amber-200',
  success: 'border-emerald-100 bg-emerald-50 text-emerald-700 dark:border-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-200',
  neutral: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

const KES = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

function formatMoney(value: number): string {
  return KES.format(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-KE').format(value);
}

function CardShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-950 sm:text-base dark:text-slate-100">{title}</h2>
          {description && <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  helper,
  tone,
}: {
  title: string;
  value: string;
  icon: LucideIcon;
  helper?: string;
  tone: Tone;
}) {
  const toneClasses: Record<Tone, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-300',
    rose: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  };

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneClasses[tone]}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">{value}</p>
      {helper && <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{helper}</p>}
    </article>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</p>
          <p className="mt-3 text-xl font-semibold text-slate-950 dark:text-slate-100">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">{subtitle}</p>
    </article>
  );
}

function StatusPill({
  severity,
  children,
}: {
  severity: Severity;
  children: ReactNode;
}) {
  return (
    <Badge
      variant={
        severity === 'danger'
          ? 'danger'
          : severity === 'warning'
            ? 'warning'
            : severity === 'success'
              ? 'success'
              : 'neutral'
      }
      className={severityBadgeClass[severity]}
    >
      {children}
    </Badge>
  );
}

const summaryMetrics = [
  {
    title: 'Total Properties',
    value: '24',
    helper: 'Static snapshot',
    icon: Building2,
    tone: 'blue' as const,
  },
  {
    title: 'Occupied Properties',
    value: '18',
    helper: 'Static snapshot',
    icon: Home,
    tone: 'emerald' as const,
  },
  {
    title: 'Available Properties',
    value: '6',
    helper: 'Static snapshot',
    icon: Building2,
    tone: 'amber' as const,
  },
  {
    title: 'Total Tenants',
    value: '148',
    helper: 'Static snapshot',
    icon: Users,
    tone: 'violet' as const,
  },
  {
    title: 'Confirmed Payments',
    value: '112',
    helper: 'Static snapshot',
    icon: CreditCard,
    tone: 'emerald' as const,
  },
  {
    title: 'Open Maintenance',
    value: '7',
    helper: 'Static snapshot',
    icon: Wrench,
    tone: 'rose' as const,
  },
];

const rentSummary = [
  { title: 'Confirmed Payments Total', value: formatMoney(4820000), subtitle: 'Static payment snapshot', icon: CreditCard },
  { title: 'Pending Payments Count', value: '5', subtitle: 'Static payment snapshot', icon: Clock3 },
  { title: 'Failed Payments Count', value: '2', subtitle: 'Static payment snapshot', icon: XCircle },
];

const properties = [
  {
    id: 'PROP-014',
    name: 'Kilimani Heights',
    address: 'Kilimani, Nairobi',
    landlord: 'Amina Hassan',
    monthlyRent: 30000,
    occupied: true,
    photoUrl: 'https://images.unsplash.com/photo-1738007709959-4b029d0c5708?w=960&h=540&fit=crop&auto=format',
  },
  {
    id: 'PROP-013',
    name: 'Westlands Plaza',
    address: 'Westlands, Nairobi',
    landlord: 'David Otieno',
    monthlyRent: 62000,
    occupied: true,
    photoUrl: 'https://images.unsplash.com/photo-1671557938187-1bfbba4c3cfa?w=960&h=540&fit=crop&auto=format',
  },
  {
    id: 'PROP-012',
    name: 'Karen Ridge Estate',
    address: 'Karen, Nairobi',
    landlord: 'Faith Njeri',
    monthlyRent: 85000,
    occupied: false,
    photoUrl: 'https://images.unsplash.com/photo-1665986127754-25c3100880be?w=960&h=540&fit=crop&auto=format',
  },
];

const maintenanceRequests = [
  {
    id: 'MNT-991',
    title: 'Broken water heater',
    property: 'Karen Ridge Estate',
    tenant: 'Grace Njoroge',
    priority: 'high',
    status: 'open',
    dateReported: '24 May 2026',
  },
  {
    id: 'MNT-990',
    title: 'Leaking pipe in kitchen',
    property: 'Ngong Hills Estate',
    tenant: 'Peter Mwangi',
    priority: 'high',
    status: 'in progress',
    dateReported: '23 May 2026',
  },
  {
    id: 'MNT-989',
    title: 'Faulty electrical socket',
    property: 'Kilimani Heights',
    tenant: 'James Kariuki',
    priority: 'medium',
    status: 'resolved',
    dateReported: '22 May 2026',
  },
];

const auditLogs = [
  { time: '25 May 2026, 14:32', user: 'admin@lt.co.ke', action: 'Updated lease', entity: 'Lease', entityId: 'LEASE-441' },
  { time: '25 May 2026, 13:18', user: 'pm@lt.co.ke', action: 'Created maintenance request', entity: 'Maintenance', entityId: 'MNT-991' },
  { time: '25 May 2026, 11:05', user: 'admin@lt.co.ke', action: 'Confirmed payment', entity: 'Payment', entityId: 'PAY-8821' },
  { time: '24 May 2026, 16:44', user: 'admin@lt.co.ke', action: 'Added new tenant', entity: 'Tenant', entityId: 'TNT-204' },
];

const attentionItems = [
  { title: 'Unlinked landlords', description: '3 landlords are not linked to Keycloak accounts.', severity: 'warning' as const },
  { title: 'Unlinked tenants', description: '2 tenants are not linked to Keycloak accounts.', severity: 'warning' as const },
  { title: 'Pending payments', description: '5 payments are awaiting confirmation.', severity: 'warning' as const },
  { title: 'Failed payments', description: '2 payments need review.', severity: 'danger' as const },
  { title: 'Open maintenance requests', description: '7 maintenance requests are still open.', severity: 'warning' as const },
  { title: 'Expiring leases', description: '2 leases end within the next 30 days.', severity: 'warning' as const },
];

function PropertyCard({
  property,
}: {
  property: {
    id: string;
    name: string;
    address: string;
    landlord: string;
    monthlyRent: number;
    occupied: boolean;
    photoUrl?: string;
  };
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        {property.photoUrl ? (
          <img
            src={property.photoUrl}
            alt={property.name}
            className="h-40 w-full rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950">
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">
              Visual placeholder
            </span>
          </div>
        )}
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{property.name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
              <MapPin size={10} />
              <span className="truncate">{property.address}</span>
            </p>
          </div>
          <Badge variant={property.occupied ? 'success' : 'warning'}>{property.occupied ? 'Occupied' : 'Available'}</Badge>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs text-slate-500">
          <div>
            <p className="text-slate-400 dark:text-slate-500">Monthly rent</p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{formatMoney(property.monthlyRent)}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Landlord</p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{property.landlord}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Active lease</p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{property.occupied ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="text-slate-400 dark:text-slate-500">Status</p>
            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">{property.occupied ? 'Occupied' : 'Available'}</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500">
          <span>{property.id}</span>
          <Badge variant={property.occupied ? 'success' : 'neutral'}>
            {property.occupied ? 'Active lease' : 'Vacant'}
          </Badge>
        </div>
      </div>
    </article>
  );
}

export default function AdminDashboard() {
  return (
    <div className="min-h-full bg-[#f4f6fb] font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex flex-col gap-4 xl:flex-row">
        <main className="min-w-0 flex-1 space-y-5">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-100">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Static dashboard snapshot for layout and UI review.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Activity size={14} className="text-[#006948]" />
              <span className="font-mono">Static data mode</span>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {summaryMetrics.map((metric) => (
              <MetricCard key={metric.title} {...metric} />
            ))}
          </section>

          <CardShell
            title="Rent Collection Summary"
            description="Static values for now."
            action={<Badge variant="neutral">KES only</Badge>}
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {rentSummary.map((item) => (
                <SummaryCard key={item.title} {...item} />
              ))}
            </div>
          </CardShell>

          <CardShell
            title="Properties"
            description="Static property cards for layout review."
            action={<Badge variant="neutral">{formatNumber(properties.length)} total</Badge>}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 2xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </CardShell>

          <CardShell
            title="Maintenance"
            description="Static maintenance snapshot."
            action={<Badge variant="neutral">Real layout only</Badge>}
          >
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MetricCard title="Open" value="4" helper="Static snapshot" icon={AlertTriangle} tone="amber" />
                <MetricCard title="In Progress" value="2" helper="Static snapshot" icon={Clock3} tone="blue" />
                <MetricCard title="Resolved" value="11" helper="Static snapshot" icon={CheckCircle2} tone="emerald" />
                <MetricCard title="High Priority" value="2" helper="Static snapshot" icon={ShieldAlert} tone="rose" />
              </div>

              <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
                {maintenanceRequests.map((request) => (
                  <article key={request.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{request.title}</p>
                        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{request.property}</p>
                      </div>
                      <Badge variant="neutral">{request.status}</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Tenant</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{request.tenant}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Priority</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{request.priority}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Date reported</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{request.dateReported}</p>
                      </div>
                      <div>
                        <p className="text-slate-400 dark:text-slate-500">Request ID</p>
                        <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{request.id}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </CardShell>

          <CardShell
            title="Recent Audit Activity"
            description="Static audit trail snapshot."
            action={<Badge variant="neutral">Admin only</Badge>}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Date / Time</th>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={`${log.time}-${log.entityId}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <td className="px-4 py-3 font-mono text-xs text-slate-400 dark:text-slate-500">{log.time}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{log.user}</td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{log.action}</td>
                      <td className="px-4 py-3">
                        <Badge variant="neutral">{log.entity}</Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">{log.entityId}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardShell>
        </main>

        <aside className="flex w-full flex-col gap-4 xl:w-[340px]">
          <CardShell title="Needs Attention" description="Static admin review queue.">
            <div className="space-y-3">
              {attentionItems.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          item.severity === 'danger'
                            ? 'bg-red-500'
                            : item.severity === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                        }`}
                      />
                      <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">{item.title}</p>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{item.description}</p>
                  </div>
                  <StatusPill severity={item.severity}>
                    {item.severity === 'danger' ? 'High' : 'Watch'}
                  </StatusPill>
                </div>
              ))}
            </div>
          </CardShell>

          <CardShell title="Quick Actions" description="Static navigation and planned admin workflows.">
            <div className="space-y-3">
              <NavLink
                to={ROUTES.ADMIN_LANDLORDS_NEW}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                <span className="inline-flex items-center gap-2">
                  <HousePlus size={14} />
                  Add Landlord
                </span>
                <span className="text-xs uppercase tracking-wider text-[#006948] dark:text-emerald-300">Open</span>
              </NavLink>
              {[
                ['Add Tenant', 'Coming soon'],
                ['Add Property', 'Coming soon'],
                ['Create Lease', 'Coming soon'],
                ['Record Payment', 'Coming soon'],
              ].map(([label, note]) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  className="flex w-full items-center justify-between rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-500"
                >
                  <span>{label}</span>
                  <span className="text-xs uppercase tracking-wider text-slate-400">{note}</span>
                </button>
              ))}
            </div>
          </CardShell>

          <CardShell
            title="Live Status"
            description="Static UI only for now."
            action={<Badge variant="success">Healthy</Badge>}
          >
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <p className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <span>Properties</span>
                <span>Ready</span>
              </p>
              <p className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <span>Payments</span>
                <span>Ready</span>
              </p>
              <p className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-950">
                <span>Maintenance</span>
                <span>Ready</span>
              </p>
            </div>
          </CardShell>
        </aside>
      </div>
      <div className="sr-only">
        <ArrowUpRight size={1} />
      </div>
    </div>
  );
}
