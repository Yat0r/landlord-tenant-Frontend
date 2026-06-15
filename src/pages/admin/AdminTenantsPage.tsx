import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  Download,
  Edit3,
  Eye,
  Home,
  Link2,
  RefreshCw,
  Search,
  UserPlus,
  Users,
  Wrench,
  XCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { handleApiError } from '@/api/helpers/apiHelpers';
import { useAdminTenantsData, useCreateTenant, type CreateTenantPayload } from '@/features/admin/tenants/hooks/useAdminTenants';
import { TenantDetailsDrawer } from '@/features/admin/tenants/components/TenantDetailsDrawer';
import { TenantFormModal } from '@/features/admin/tenants/components/TenantFormModal';
import {
  buildTenantRows,
  deriveTenantKpis,
  fmt,
  fmtDate,
  getInitials,
  normalizeStatus,
  rowMatchesSearch,
  statusLabel,
  type TenantRowModel,
} from '@/features/admin/tenants/utils/tenantDerivedData';

type AccountFilter = 'all' | 'linked' | 'unlinked';
type LeaseFilter = 'all' | 'active' | 'expired' | 'terminated' | 'pending_renewal';
type PaymentFilter = 'all' | 'balance_due' | 'cleared';
type MaintenanceFilter = 'all' | 'open' | 'none';
type ModalState = { mode: 'add' | 'edit'; tenant?: TenantRowModel } | null;

const tenantTableHeadings = [
  'Tenant',
  'Contact',
  'Property / Unit',
  'Lease',
  'Rent Balance',
  'Account',
  'Maintenance',
  'Joined',
  'Actions',
];

function ErrorMessage({ status, message }: { status: number; message: string }) {
  if (status === 401) return <>Your session has expired. Please log in again.</>;
  if (status === 403) return <>You don't have permission to view this page.</>;
  return <>{message}</>;
}

function leaseBadgeClass(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === 'active') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (normalized === 'terminated') return 'border-rose-100 bg-rose-50 text-rose-700';
  if (normalized === 'pending' || normalized === 'pending_renewal') return 'border-amber-100 bg-amber-50 text-amber-700';
  if (normalized === 'expired') return 'border-slate-200 bg-slate-100 text-slate-600';
  return 'border-gray-200 bg-gray-100 text-gray-600';
}

function StatusPill({ status, label }: { status?: string | null; label?: string }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', leaseBadgeClass(status))}>
      {label ?? statusLabel(status)}
    </span>
  );
}

function AccountPill({ linked }: { linked: boolean }) {
  return linked ? (
    <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      Linked
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      Unlinked
    </span>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className={clsx('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', tone)}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none text-[#1E293B]">{value}</p>
          <p className="mt-1.5 text-xs font-medium text-[#64748B]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function TableSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100">
          {tenantTableHeadings.map((heading) => (
            <td key={heading} className="px-4 py-3">
              <div className="h-4 rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportRows(rows: TenantRowModel[]) {
  const headers = ['Full Name', 'Email', 'Phone', 'Property', 'Unit', 'Lease Status', 'Account Status', 'Balance'];
  const lines = rows.map((row) =>
    [
      row.fullName,
      row.email,
      row.phone ?? '',
      row.propertyName ?? '',
      row.unit ?? '',
      row.leaseStatus,
      row.isLinked ? 'Linked' : 'Unlinked',
      row.balanceDerivable && typeof row.balance === 'number' ? String(row.balance) : 'N/A',
    ].map(csvEscape).join(',')
  );
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([[headers.map(csvEscape).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `propease-tenants-${today}.csv`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function propertyLabel(row: TenantRowModel) {
  if (!row.propertyName && !row.unit) return '—';
  return (
    <span>
      <span className="block font-semibold text-slate-800">{row.propertyName ?? '—'}</span>
      <span className="block text-xs text-slate-400">{row.unit ? `Unit ${row.unit}` : '—'}</span>
    </span>
  );
}

function tenantSupportsField(rows: TenantRowModel[], keys: string[]) {
  return rows.some((row) => keys.some((key) => key in row.tenant));
}

export default function AdminTenantsPage() {
  const [search, setSearch] = useState('');
  const [accountFilter, setAccountFilter] = useState<AccountFilter>('all');
  const [leaseFilter, setLeaseFilter] = useState<LeaseFilter>('all');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [maintenanceFilter, setMaintenanceFilter] = useState<MaintenanceFilter>('all');
  const [selectedTenant, setSelectedTenant] = useState<TenantRowModel | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [formError, setFormError] = useState<string>();
  const [toast, setToast] = useState<string>();

  const data = useAdminTenantsData(500);
  const createTenant = useCreateTenant();

  const rows = useMemo(
    () =>
      buildTenantRows({
        tenants: data.tenants,
        properties: data.properties,
        leases: data.leases,
        payments: data.payments,
        maintenance: data.maintenance,
      }),
    [data.leases, data.maintenance, data.payments, data.properties, data.tenants]
  );

  const kpis = useMemo(() => deriveTenantKpis(rows, data.leases, data.maintenance), [data.leases, data.maintenance, rows]);
  const canFilterByBalance = rows.some((row) => row.balanceDerivable);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (!rowMatchesSearch(row, search)) return false;
      if (accountFilter === 'linked' && !row.isLinked) return false;
      if (accountFilter === 'unlinked' && row.isLinked) return false;
      if (leaseFilter !== 'all') {
        const status = normalizeStatus(row.lease?.status);
        if (leaseFilter === 'pending_renewal') {
          if (status !== 'pending' && status !== 'pending_renewal') return false;
        } else if (status !== leaseFilter) {
          return false;
        }
      }
      if (canFilterByBalance && paymentFilter === 'balance_due' && !(row.balanceDerivable && (row.balance ?? 0) > 0)) return false;
      if (canFilterByBalance && paymentFilter === 'cleared' && !(row.balanceDerivable && (row.balance ?? 0) <= 0)) return false;
      if (propertyFilter !== 'all' && row.lease?.propertyId !== propertyFilter) return false;
      if (maintenanceFilter === 'open' && row.openMaintenanceCount === 0) return false;
      if (maintenanceFilter === 'none' && row.openMaintenanceCount > 0) return false;
      return true;
    });
  }, [accountFilter, canFilterByBalance, leaseFilter, maintenanceFilter, paymentFilter, propertyFilter, rows, search]);

  const isLoading =
    data.tenantsQuery.isPending ||
    data.propertiesQuery.isPending ||
    data.leasesQuery.isPending ||
    data.paymentsQuery.isPending ||
    data.maintenanceQuery.isPending;

  const firstError =
    data.tenantsQuery.error ??
    data.propertiesQuery.error ??
    data.leasesQuery.error ??
    data.paymentsQuery.error ??
    data.maintenanceQuery.error;
  const apiError = firstError ? handleApiError(firstError) : undefined;

  const filtersActive =
    Boolean(search.trim()) ||
    accountFilter !== 'all' ||
    leaseFilter !== 'all' ||
    paymentFilter !== 'all' ||
    propertyFilter !== 'all' ||
    maintenanceFilter !== 'all';

  const supportsEdit = false;
  const supportsNationalId = tenantSupportsField(rows, ['nationalId', 'idNumber', 'passportNumber']);
  const supportsNotes = tenantSupportsField(rows, ['notes']);

  function refreshAll() {
    void data.tenantsQuery.refetch();
    void data.propertiesQuery.refetch();
    void data.leasesQuery.refetch();
    void data.paymentsQuery.refetch();
    void data.maintenanceQuery.refetch();
  }

  function clearFilters() {
    setSearch('');
    setAccountFilter('all');
    setLeaseFilter('all');
    setPaymentFilter('all');
    setPropertyFilter('all');
    setMaintenanceFilter('all');
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: TenantRowModel) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setSelectedTenant(row);
  }

  async function handleTenantSubmit(payload: CreateTenantPayload) {
    setFormError(undefined);
    try {
      await createTenant.mutateAsync(payload);
      setModal(null);
      setToast(`Tenant ${payload.name} added successfully.`);
      window.setTimeout(() => setToast(undefined), 3500);
      refreshAll();
    } catch (error) {
      setFormError(handleApiError(error).message);
    }
  }

  return (
    <div className="min-h-full bg-[#F9FAFB] px-5 py-5 text-slate-900">
      {toast && (
        <div className="fixed right-5 top-5 z-[60] rounded-xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Tenants</h1>
          <p className="mt-1 max-w-3xl text-sm text-[#64748B]">
            Track tenant accounts, leases, payments, and maintenance activity across all properties.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => setModal({ mode: 'add' })} className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover">
            <UserPlus className="h-4 w-4" />
            Add Tenant
          </Button>
          <Button type="button" variant="ghost" onClick={refreshAll} className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" variant="ghost" onClick={() => exportRows(filteredRows)} className="rounded-xl">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        <KpiCard label="Total Tenants" value={isLoading ? '—' : kpis.totalTenants} icon={<Users className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Linked to Keycloak" value={isLoading ? '—' : kpis.linkedToKeycloak} icon={<Link2 className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Unlinked" value={isLoading ? '—' : kpis.unlinked} icon={<XCircle className="h-5 w-5" />} tone="bg-amber-50 text-amber-600" />
        <KpiCard label="Active Leases" value={isLoading ? '—' : kpis.activeLeases} icon={<CalendarClock className="h-5 w-5" />} tone="bg-slate-50 text-slate-600" />
        <KpiCard label="Tenants with Balance" value={isLoading ? '—' : kpis.tenantsWithBalance ?? 'N/A'} icon={<AlertTriangle className="h-5 w-5" />} tone="bg-amber-50 text-amber-600" />
        <KpiCard label="Open Maintenance" value={isLoading ? '—' : kpis.openMaintenance} icon={<Wrench className="h-5 w-5" />} tone="bg-rose-50 text-rose-600" />
      </div>

      <div className="sticky top-0 z-20 mt-5 rounded-xl border border-slate-100 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.2fr)_repeat(5,minmax(150px,auto))_auto]">
          <label className="relative">
            <span className="sr-only">Search tenants</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone, ID, property, unit"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:bg-white"
            />
          </label>
          <select value={accountFilter} onChange={(event) => setAccountFilter(event.target.value as AccountFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            <option value="all">All accounts</option>
            <option value="linked">Linked</option>
            <option value="unlinked">Unlinked</option>
          </select>
          <select value={leaseFilter} onChange={(event) => setLeaseFilter(event.target.value as LeaseFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            <option value="all">All leases</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
            <option value="pending_renewal">Pending Renewal</option>
          </select>
          {canFilterByBalance && (
            <select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as PaymentFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
              <option value="all">All payments</option>
              <option value="balance_due">Balance Due</option>
              <option value="cleared">Cleared</option>
            </select>
          )}
          <select value={propertyFilter} onChange={(event) => setPropertyFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            <option value="all">All properties</option>
            {data.properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          <select value={maintenanceFilter} onChange={(event) => setMaintenanceFilter(event.target.value as MaintenanceFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            <option value="all">All maintenance</option>
            <option value="open">Has open request</option>
            <option value="none">No open request</option>
          </select>
          {filtersActive && (
            <button type="button" onClick={clearFilters} className="h-10 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-brand-primary hover:bg-brand-panel">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {apiError ? (
        <div className="mt-5 rounded-xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm font-semibold text-slate-800">
            <ErrorMessage status={apiError.status} message={apiError.message} />
          </p>
          <Button type="button" variant="secondary" onClick={refreshAll} className="mt-4 rounded-xl">
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80">
                <tr>
                  {tenantTableHeadings.map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <TableSkeleton />
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={tenantTableHeadings.length} className="px-4 py-12 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center">
                        <Home className="h-12 w-12 text-slate-300" />
                        <p className="mt-3 text-base font-semibold text-slate-800">
                          {rows.length === 0 ? 'No tenants yet' : 'No tenants match your filters'}
                        </p>
                        {rows.length === 0 ? (
                          <Button type="button" onClick={() => setModal({ mode: 'add' })} className="mt-4 rounded-xl bg-brand-primary hover:bg-brand-primary-hover">
                            <UserPlus className="h-4 w-4" />
                            Add Tenant
                          </Button>
                        ) : (
                          <button type="button" onClick={clearFilters} className="mt-3 text-sm font-semibold text-brand-primary hover:underline">
                            Clear Filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.tenant.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedTenant(row)}
                      onKeyDown={(event) => handleRowKeyDown(event, row)}
                      className="min-h-12 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                            {getInitials(row.fullName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{row.fullName}</p>
                            <p className="truncate text-xs text-slate-500">{row.email || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="max-w-[220px] truncate text-slate-700">
                          {row.phone ?? '—'} <span className="text-slate-300">•</span> {row.email || '—'}
                        </p>
                      </td>
                      <td className="px-4 py-3">{propertyLabel(row)}</td>
                      <td className="px-4 py-3">
                        <StatusPill status={row.lease?.status ?? 'none'} label={row.lease ? statusLabel(row.lease.status) : 'None'} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {row.balanceDerivable ? fmt(row.balance) : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <AccountPill linked={row.isLinked} />
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('font-semibold', row.openMaintenanceCount > 0 ? 'text-rose-600' : 'text-slate-500')}>
                          {row.openMaintenanceCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{fmtDate(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedTenant(row);
                            }}
                            className="rounded-lg p-2 text-slate-400 hover:bg-brand-panel hover:text-brand-primary"
                            aria-label={`View ${row.fullName}`}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setFormError(undefined);
                              setModal({ mode: 'edit', tenant: row });
                            }}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            aria-label={`Edit ${row.fullName}`}
                            title="Edit"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TenantDetailsDrawer row={selectedTenant} onClose={() => setSelectedTenant(null)} />
      {modal && (
        <TenantFormModal
          key={`${modal.mode}-${modal.tenant?.tenant.id ?? 'new'}`}
          isOpen
          mode={modal.mode}
          tenant={modal.tenant}
          properties={data.properties}
          supportsEdit={supportsEdit}
          supportsNationalId={supportsNationalId}
          supportsNotes={supportsNotes}
          isSaving={createTenant.isPending}
          error={formError}
          onClose={() => {
            setModal(null);
            setFormError(undefined);
          }}
          onSubmit={(payload) => void handleTenantSubmit(payload)}
        />
      )}
    </div>
  );
}
