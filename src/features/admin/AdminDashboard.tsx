import { useMemo, useState, type ReactNode } from 'react';
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  Wrench,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Home,
  UserCheck,
  UserX,
  Activity,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Download,
  MoreHorizontal,
  Eye,
  type LucideIcon,
} from 'lucide-react';
import { 
   
  // useMaintenance,   
  // useRentSummary, 
  // useTransactions,   
  useDashboardKpi,
  useProperties,
  usePayments,
  usePaymentSummary,
  useMaintenanceRequests,
  useAuditLogs,
  useLandlordCount,
  
} from './hooks/UseAdminDashboard.ts';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(n);

const fmtShort = (n: number) => {
  if (n >= 1_000_000) return `KES ${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `KES ${Math.round(n / 1_000)}K`;
  return fmt(n);
};

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple' | 'indigo';
type PaymentStatus = 'confirmed' | 'pending' | 'failed';
type PaymentTab = 'all' | PaymentStatus;

const badgeClass: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
  warning: 'bg-amber-50 text-amber-700 border border-amber-100',
  danger: 'bg-red-50 text-red-600 border border-red-100',
  info: 'bg-sky-50 text-sky-700 border border-sky-100',
  neutral: 'bg-slate-100 text-slate-500 border border-slate-200',
  purple: 'bg-violet-50 text-violet-700 border border-violet-100',
  indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-100',
};

function Badge({ variant, children }: { variant: BadgeVariant; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${badgeClass[variant]}`}
    >
      {children}
    </span>
  );
}

// const kpis = useDashboardKpi();
// const rent = useRentSummary();
// const properties   = useProperties();
// const payments     = useTransactions();        // for "all" tab
// const auditLogs    = useAuditLogs();
// const maintenance  = useMaintenance();

// export default function AdminDashboardPage() {
//   const kpisQuery = useDashboardKpi()
//   const propertiesQuery = useProperties()
//   const paymentsQuery = usePayments()
//   const auditLogsQuery = useAuditLogs()
//   const maintenanceQuery = useMaintenanceRequests()

//   const properties = propertiesQuery.data?.items ?? []
//   const payments = paymentsQuery.data?.items ?? []
//   const auditLogs = auditLogsQuery.data?.items ?? []
//   const maintenance = maintenanceQuery.data?.items ?? []

//   return (
//     <div>
//       {/* dashboard UI */}
//     </div>
//   )
// }

const rentSummary = [
  { label: 'Total Confirmed', amount: fmtShort(4_820_000), delta: '+12.4% vs Apr', trendUp: true },
  { label: 'Pending Amount', amount: fmt(185_000), delta: '4 payments', trendUp: false },
  { label: 'Failed', amount: fmt(55_000), delta: '1 payment', trendUp: false },
];

const properties = [
  {
    id: 'PROP-014',
    name: 'Kilimani Heights',
    address: 'Kilimani, Nairobi',
    units: 12,
    occupied: 11,
    rent: 45_000,
    photo: 'https://images.unsplash.com/photo-1738007709959-4b029d0c5708?w=480&h=280&fit=crop&auto=format',
  },
  {
    id: 'PROP-013',
    name: 'Westlands Plaza',
    address: 'Westlands, Nairobi',
    units: 8,
    occupied: 8,
    rent: 62_000,
    photo: 'https://images.unsplash.com/photo-1671557938187-1bfbba4c3cfa?w=480&h=280&fit=crop&auto=format',
  },
  {
    id: 'PROP-012',
    name: 'Karen Ridge Estate',
    address: 'Karen, Nairobi',
    units: 6,
    occupied: 4,
    rent: 85_000,
    photo: 'https://images.unsplash.com/photo-1665986127754-25c3100880be?w=480&h=280&fit=crop&auto=format',
  },
];

const recentPayments: Array<{
  id: string;
  tenant: string;
  property: string;
  amount: number;
  chargeDate: string;
  dueDate: string;
  status: PaymentStatus;
}> = [
  { id: 'PAY-8821', tenant: 'James Kariuki', property: 'Kilimani Heights 4B', amount: 45_000, chargeDate: '25 May 2026', dueDate: '1 Jun 2026', status: 'confirmed' },
  { id: 'PAY-8820', tenant: 'Amina Osei', property: 'Westlands Plaza 2A', amount: 62_000, chargeDate: '24 May 2026', dueDate: '1 Jun 2026', status: 'confirmed' },
  { id: 'PAY-8819', tenant: 'Peter Mwangi', property: 'Ngong Hills Estate 7', amount: 38_000, chargeDate: '24 May 2026', dueDate: '1 Jun 2026', status: 'pending' },
  { id: 'PAY-8818', tenant: 'Grace Njoroge', property: 'Karen Ridge 12C', amount: 85_000, chargeDate: '23 May 2026', dueDate: '1 Jun 2026', status: 'confirmed' },
  { id: 'PAY-8817', tenant: 'David Otieno', property: 'Lavington Court 3', amount: 55_000, chargeDate: '22 May 2026', dueDate: '25 May 2026', status: 'failed' },
  { id: 'PAY-8816', tenant: 'Faith Wambui', property: 'South C Terrace 5B', amount: 28_000, chargeDate: '21 May 2026', dueDate: '25 May 2026', status: 'confirmed' },
];

const auditLogs = [
  { time: '25 May 2026, 14:32', user: 'admin@lt.co.ke', action: 'Updated lease', entity: 'Lease', entityId: 'LEASE-441' },
  { time: '25 May 2026, 13:18', user: 'pm@lt.co.ke', action: 'Created maintenance request', entity: 'Maintenance', entityId: 'MNT-991' },
  { time: '25 May 2026, 11:05', user: 'admin@lt.co.ke', action: 'Confirmed payment', entity: 'Payment', entityId: 'PAY-8821' },
  { time: '24 May 2026, 16:44', user: 'admin@lt.co.ke', action: 'Added new tenant', entity: 'Tenant', entityId: 'TNT-204' },
  { time: '24 May 2026, 09:21', user: 'admin@lt.co.ke', action: 'Linked landlord account', entity: 'Landlord', entityId: 'LL-087' },
];

const newApplications = [
  { name: 'Brian Odhiambo', email: 'b.odhiambo@email.com', property: 'Westlands Plaza 3A', date: '25 May 2026', status: 'pending' },
  { name: "Stella Ndung'u", email: 's.ndungu@email.com', property: 'Kilimani Heights 7C', date: '24 May 2026', status: 'approved' },
  { name: 'Emmanuel Kiprop', email: 'e.kiprop@email.com', property: 'Karen Ridge 2B', date: '23 May 2026', status: 'pending' },
];

const maintenanceRequests = [
  { id: 'MNT-991', tenant: 'Grace Njoroge', property: 'Karen Ridge 12C', issue: 'Broken water heater', priority: 'high', status: 'open' },
  { id: 'MNT-990', tenant: 'Peter Mwangi', property: 'Ngong Hills Estate 7', issue: 'Leaking pipe in kitchen', priority: 'high', status: 'in_progress' },
  { id: 'MNT-989', tenant: 'James Kariuki', property: 'Kilimani Heights 4B', issue: 'Faulty electrical socket', priority: 'medium', status: 'open' },
];

function KpiCard({
  label,
  value,
  icon: Icon,
  bg,
  color,
  alert,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  bg: string;
  color: string;
  alert?: boolean;
}) {
  return (
    <article
      className={`relative rounded-2xl border border-slate-100 bg-white p-4 shadow-sm ${
        alert ? 'ring-1 ring-amber-200' : ''
      }`}
    >
      {alert && <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-amber-400" />}
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
          <Icon size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-1 font-mono text-2xl font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </article>
  );
}

function RentCard({
  label,
  amount,
  delta,
  trendUp,
}: {
  label: string;
  amount: string;
  delta: string;
  trendUp: boolean;
}) {
  const TrendIcon = trendUp ? TrendingUp : TrendingDown;

  return (
    <article className="min-w-[190px] flex-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-3 font-mono text-xl font-semibold text-slate-950">{amount}</p>
      <div className={`mt-3 flex items-center gap-1 text-xs font-semibold ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
        <span>{delta}</span>
        <TrendIcon size={14} />
      </div>
    </article>
  );
}

function occupancyVariant(occupancy: number): BadgeVariant {
  if (occupancy === 100) return 'success';
  if (occupancy >= 75) return 'indigo';
  return 'warning';
}

function PropertyCard({ property }: { property: (typeof properties)[number] }) {
  const occupancy = Math.round((property.occupied / property.units) * 100);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="relative h-36 overflow-hidden">
        <img
          src={property.photo}
          alt={property.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 font-mono text-xs font-semibold text-slate-900 backdrop-blur-sm">
          {fmt(property.rent)}/mo
        </span>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-slate-950">{property.name}</p>
            <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
              <Home size={10} />
              <span className="truncate">{property.address}</span>
            </p>
          </div>
          <Badge variant={occupancyVariant(occupancy)}>{occupancy}%</Badge>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            {property.occupied}/{property.units} occupied
          </span>
          <span className="font-mono">{property.id}</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-slate-100">
          <div className="h-1 rounded-full bg-[#006948]" style={{ width: `${occupancy}%` }} />
        </div>
      </div>
    </article>
  );
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  if (status === 'confirmed') {
    return (
      <Badge variant="success">
        <CheckCircle2 size={10} /> Confirmed
      </Badge>
    );
  }

  if (status === 'pending') {
    return (
      <Badge variant="warning">
        <Clock size={10} /> Pending
      </Badge>
    );
  }

  return (
    <Badge variant="danger">
      <XCircle size={10} /> Failed
    </Badge>
  );
}

function TransactionsHistory() {
  const [activeTab, setActiveTab] = useState<PaymentTab>('all');
  const filteredPayments = useMemo(
    () => recentPayments.filter((payment) => activeTab === 'all' || payment.status === activeTab),
    [activeTab]
  );
  const tabs: Array<{ label: string; value: PaymentTab }> = [
    { label: 'All', value: 'all' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Pending', value: 'pending' },
    { label: 'Failed', value: 'failed' },
  ];

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <div className="flex rounded-xl bg-slate-50 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                activeTab === tab.value ? 'bg-[#006948] text-white' : 'text-slate-400 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
          aria-label="Download transactions"
        >
          <Download size={16} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Payment ID</th>
              <th className="px-4 py-3">Tenant Name</th>
              <th className="px-4 py-3">Property</th>
              <th className="px-4 py-3">Charge Date</th>
              <th className="px-4 py-3">Due Date</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredPayments.map((payment) => (
              <tr key={payment.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{payment.id}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{payment.tenant}</td>
                <td className="px-4 py-3 text-slate-500">{payment.property}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{payment.chargeDate}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{payment.dueDate}</td>
                <td className="px-4 py-3 text-right font-mono text-xs font-semibold text-slate-900">{fmt(payment.amount)}</td>
                <td className="px-4 py-3">
                  <PaymentStatusBadge status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4">
        <p className="font-mono text-xs text-slate-400">Showing {filteredPayments.length} of 284 transactions</p>
        <a href="/admin/payments" className="inline-flex items-center gap-1 text-sm font-semibold text-[#006948]">
          View full history <ArrowUpRight size={14} />
        </a>
      </div>
    </section>
  );
}

function entityVariant(entity: string): BadgeVariant {
  const variants: Record<string, BadgeVariant> = {
    Payment: 'success',
    Maintenance: 'warning',
    Lease: 'info',
    Tenant: 'purple',
    Landlord: 'neutral',
  };

  return variants[entity] ?? 'neutral';
}

function AuditActivity() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 p-4">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Recent Audit Activity</h2>
          <p className="text-xs text-slate-400">Latest administrative changes across the platform.</p>
        </div>
        <MoreHorizontal size={18} className="text-slate-300" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Date / Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Entity</th>
              <th className="px-4 py-3">Entity ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <tr key={`${log.time}-${log.entityId}`} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs text-slate-400">{log.time}</td>
                <td className="px-4 py-3 text-slate-600">{log.user}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{log.action}</td>
                <td className="px-4 py-3">
                  <Badge variant={entityVariant(log.entity)}>{log.entity}</Badge>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.entityId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function RightPanel() {
  return (
    <aside className="hidden w-[260px] flex-col gap-4 xl:flex">
      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-950">New Applications</h2>
          <a href="/admin/tenants" className="inline-flex items-center gap-1 text-xs font-semibold text-[#006948]">
            View all <ChevronRight size={12} />
          </a>
        </div>
        <div className="mt-4 space-y-4">
          {newApplications.map((application) => (
            <div key={application.email}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-emerald-500 text-[10px] font-bold text-white">
                    {application.name
                      .split(' ')
                      .map((part) => part[0])
                      .join('')
                      .slice(0, 2)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-slate-800">{application.name}</p>
                    <p className="truncate text-xs text-slate-400">{application.email}</p>
                  </div>
                </div>
                <Badge variant={application.status === 'approved' ? 'success' : 'warning'}>{application.status}</Badge>
              </div>
              <p className="mt-2 truncate pl-9 text-xs text-slate-400">{application.property}</p>
              <p className="mt-1 pl-9 font-mono text-[11px] text-slate-400">{application.date}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-950">Maintenance</h2>
          <Badge variant="danger">{maintenanceRequests.filter((request) => request.status === 'open').length} open</Badge>
        </div>
        <div className="mt-4 space-y-3">
          {maintenanceRequests.map((request) => (
            <div key={request.id} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <span
                  className={`mt-1 h-2 w-2 rounded-full ${
                    request.priority === 'high' ? 'bg-red-500' : request.priority === 'medium' ? 'bg-amber-400' : 'bg-slate-300'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">{request.tenant}</p>
                  <p className="truncate text-xs text-slate-400">{request.issue}</p>
                  <p className="truncate text-[11px] text-slate-400">{request.property}</p>
                </div>
              </div>
              <div className="mt-2 flex gap-2 pl-4">
                <Badge variant={request.status === 'open' ? 'danger' : 'warning'}>{request.status.replace('_', ' ')}</Badge>
                <Badge variant={request.priority === 'high' ? 'danger' : 'warning'}>{request.priority}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-950">Needs Attention</h2>
        <div className="mt-4 space-y-2">
          {[
            { label: 'Unlinked Landlords', count: '2', variant: 'warning' as const, icon: UserX },
            { label: 'Unlinked Tenants', count: '3', variant: 'warning' as const, icon: UserX },
            { label: 'Pending Payments', count: '4', variant: 'warning' as const, icon: Clock },
            { label: 'Open Maintenance', count: '7', variant: 'danger' as const, icon: Wrench },
          ].map(({ label, count, variant, icon: Icon }) => (
            <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-2">
                <Icon size={14} className={variant === 'danger' ? 'text-red-500' : 'text-amber-500'} />
                <span className="text-xs font-semibold text-slate-700">{label}</span>
              </div>
              <Badge variant={variant}>{count}</Badge>
            </div>
          ))}
          <div className="flex items-center justify-between rounded-xl border border-dashed border-slate-200 p-3">
            <span className="text-xs font-semibold text-slate-400">API Health Monitoring</span>
            <Badge variant="neutral">Coming soon</Badge>
          </div>
        </div>
      </section>
    </aside>
  );
}

export default function AdminDashboard() {
  const [showMoreMetrics, setShowMoreMetrics] = useState(false);
  // const visibleKpis = showMoreMetrics ? kpis : kpis.slice(0, 6);

  return (
    <div className="min-h-full bg-[#f4f6fb] font-sans text-slate-900">
      <div className="flex gap-4">
        <main className="min-w-0 flex-1 space-y-5">
          <section className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">Dashboard</h1>
              <p className="mt-1 text-sm text-slate-500">
                Monitor properties, tenants, leases, payments, and platform activity.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Activity size={14} className="text-[#006948]" />
              <span className="font-mono">25 May 2026, 14:45</span>
            </div>
          </section>

          <section>
            {/* <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
              {visibleKpis.map((kpi) => (
                <KpiCard key={kpi.label} {...kpi} />
              ))}
            </div> */}
            <button
              type="button"
              onClick={() => setShowMoreMetrics((value) => !value)}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs font-semibold text-slate-500 shadow-sm hover:text-[#006948]"
            >
              {showMoreMetrics ? 'Show less' : 'Show 6 more metrics'}
              {showMoreMetrics ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <CreditCard size={18} className="text-[#006948]" />
              <h2 className="text-base font-semibold text-slate-950">Rent Collection Summary</h2>
              <Badge variant="neutral">May 2026</Badge>
            </div>
            <div className="flex flex-wrap gap-3">
              {rentSummary.map((item) => (
                <RentCard key={item.label} {...item} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Properties</h2>
                <p className="text-xs text-slate-400">Top monitored properties by rent and occupancy.</p>
              </div>
              <a href="/admin/properties" className="inline-flex items-center gap-1 text-xs font-semibold text-[#006948]">
                View all <Eye size={13} />
              </a>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </section>

          <TransactionsHistory />
          <AuditActivity />
        </main>
        <RightPanel />
      </div>
      <div className="sr-only">
        <AlertTriangle size={1} />
      </div>
    </div>
  );
}
