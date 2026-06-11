import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  Banknote,
  Ban,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FilePlus2,
  FileText,
  Home,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { ENDPOINTS } from '@/api/endpoints';
import { handleApiError } from '@/api/helpers/apiHelpers';
import { useAdminLeasesData, useCreateLease, type CreateLeasePayload } from '@/features/admin/leases/hooks/useAdminLeases';
import { LeaseDetailsDrawer } from '@/features/admin/leases/components/LeaseDetailsDrawer';
import { LeaseFormModal } from '@/features/admin/leases/components/LeaseFormModal';
import {
  buildLeaseRows,
  deriveLeaseKpis,
  expiryLabel,
  fmt,
  formatLeasePeriod,
  getInitials,
  getLeaseStatusColor,
  normalizeStatus,
  rowMatchesSearch,
  statusLabel,
  type LeaseRowModel,
  type UnitRecord,
} from '@/features/admin/leases/utils/leaseDerivedData';

type LeaseFilter = 'all' | 'active' | 'expired' | 'terminated' | 'pending_renewal';
type ExpiryFilter = 'all' | '7' | '30' | 'expired';
type ModalState = { mode: 'create' | 'edit'; lease?: LeaseRowModel } | null;

const headings = [
  'Tenant',
  'Property / Unit',
  'Lease Period',
  'Status',
  'Monthly Rent',
  'Deposit',
  'Balance',
  'Expiry',
  'Actions',
];

function ErrorMessage({ status, message }: { status: number; message: string }) {
  if (status === 401) return <>Your session has expired. Please log in again.</>;
  if (status === 403) return <>You don't have permission to view this page.</>;
  return <>{message}</>;
}

function StatusBadge({ status, label }: { status?: string | null; label?: string }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', getLeaseStatusColor(status))}>
      {label ?? statusLabel(status)}
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
          <p className="truncate text-2xl font-bold leading-none text-[#1E293B]">{value}</p>
          <p className="mt-1.5 text-xs font-medium text-[#64748B]">{label}</p>
        </div>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <tr key={rowIndex} className="border-b border-slate-100">
          {headings.map((heading) => (
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

function exportRows(rows: LeaseRowModel[]) {
  const headers = [
    'Tenant Name',
    'Email',
    'Phone',
    'Property',
    'Unit',
    'Status',
    'Start Date',
    'End Date',
    'Monthly Rent (KES)',
    'Deposit (KES)',
    'Balance',
    'Expiry State',
  ];
  const lines = rows.map((row) =>
    [
      row.tenantName,
      row.tenantEmail ?? '',
      row.tenantPhone ?? '',
      row.propertyName ?? '',
      row.unitLabel ?? '',
      statusLabel(row.status),
      row.lease.startDate ?? '',
      row.lease.endDate ?? '',
      row.monthlyRent === undefined ? '' : String(row.monthlyRent),
      row.deposit === undefined ? '' : String(row.deposit),
      row.balance === null ? 'N/A' : String(row.balance),
      expiryLabel(row.daysUntilExpiry, row.lease.endDate),
    ].map(csvEscape).join(',')
  );
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([[headers.map(csvEscape).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `propease-leases-${today}.csv`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function unitValue(unit: UnitRecord) {
  return unit.id ?? unit.unitNumber ?? unit.number ?? unit.roomNumber ?? unit.name ?? '';
}

function expiryClass(row: LeaseRowModel) {
  if (row.daysUntilExpiry === null) return 'text-slate-500';
  if (row.daysUntilExpiry < 0) return 'text-rose-600';
  if (row.daysUntilExpiry <= 30) return 'text-amber-600';
  return 'text-slate-600';
}

function supportsLeaseNotes(rows: LeaseRowModel[]) {
  return rows.some((row) => 'notes' in row.lease);
}

export default function AdminLeasesPage() {
  const [search, setSearch] = useState('');
  const [leaseFilter, setLeaseFilter] = useState<LeaseFilter>('all');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [tenantFilter, setTenantFilter] = useState('all');
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('all');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [selectedLease, setSelectedLease] = useState<LeaseRowModel | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [formError, setFormError] = useState<string>();
  const [toast, setToast] = useState<string>();

  const data = useAdminLeasesData(500);
  const createLease = useCreateLease();

  const rows = useMemo(
    () =>
      buildLeaseRows({
        leases: data.leases,
        tenants: data.tenants,
        properties: data.properties,
        payments: data.payments,
        maintenance: data.maintenance,
        activity: data.activity,
      }),
    [data.activity, data.leases, data.maintenance, data.payments, data.properties, data.tenants]
  );

  const kpis = useMemo(() => deriveLeaseKpis(rows), [rows]);
  const rentDataAvailable = rows.some((row) => typeof row.monthlyRent === 'number');
  const supportsCreateLease = Boolean(ENDPOINTS.ADMIN.LEASES);
  const supportsEditLease = false;
  const supportsNotes = supportsLeaseNotes(rows);

  const propertyUnits = useMemo(() => {
    if (propertyFilter === 'all') {
      return Array.from(new Map(rows.filter((row) => row.unitLabel).map((row) => [row.unitLabel, row.unitLabel])).values());
    }
    const property = data.properties.find((item) => item.id === propertyFilter);
    if (property?.units?.length) return property.units.map((unit) => unitValue(unit)).filter(Boolean);
    return Array.from(new Map(rows.filter((row) => row.lease.propertyId === propertyFilter && row.unitLabel).map((row) => [row.unitLabel, row.unitLabel])).values());
  }, [data.properties, propertyFilter, rows]);

  const filteredRows = useMemo(() => {
    const min = minRent ? Number(minRent) : undefined;
    const max = maxRent ? Number(maxRent) : undefined;

    return rows.filter((row) => {
      if (!rowMatchesSearch(row, search)) return false;
      const status = normalizeStatus(row.status);
      if (leaseFilter !== 'all') {
        if (leaseFilter === 'pending_renewal') {
          if (status !== 'pending_renewal' && status !== 'pendingrenewal' && status !== 'pending') return false;
        } else if (status !== leaseFilter) {
          return false;
        }
      }
      if (propertyFilter !== 'all' && row.lease.propertyId !== propertyFilter) return false;
      if (unitFilter !== 'all' && row.unitLabel !== unitFilter && row.unit?.id !== unitFilter) return false;
      if (tenantFilter !== 'all' && row.lease.tenantId !== tenantFilter) return false;
      if (expiryFilter === '7' && !(row.daysUntilExpiry !== null && row.daysUntilExpiry >= 0 && row.daysUntilExpiry <= 7)) return false;
      if (expiryFilter === '30' && !(row.daysUntilExpiry !== null && row.daysUntilExpiry >= 0 && row.daysUntilExpiry <= 30)) return false;
      if (expiryFilter === 'expired' && !(row.daysUntilExpiry !== null && row.daysUntilExpiry < 0)) return false;
      if (min !== undefined && Number.isFinite(min) && !((row.monthlyRent ?? -Infinity) >= min)) return false;
      if (max !== undefined && Number.isFinite(max) && !((row.monthlyRent ?? Infinity) <= max)) return false;
      return true;
    });
  }, [expiryFilter, leaseFilter, maxRent, minRent, propertyFilter, rows, search, tenantFilter, unitFilter]);

  const isLoading =
    data.leasesQuery.isPending ||
    data.tenantsQuery.isPending ||
    data.propertiesQuery.isPending ||
    data.paymentsQuery.isPending ||
    data.maintenanceQuery.isPending ||
    data.auditQuery.isPending;

  const firstError =
    data.leasesQuery.error ??
    data.tenantsQuery.error ??
    data.propertiesQuery.error ??
    data.paymentsQuery.error ??
    data.maintenanceQuery.error ??
    data.auditQuery.error;
  const apiError = firstError ? handleApiError(firstError) : undefined;

  const filtersActive =
    Boolean(search.trim()) ||
    leaseFilter !== 'all' ||
    propertyFilter !== 'all' ||
    unitFilter !== 'all' ||
    tenantFilter !== 'all' ||
    expiryFilter !== 'all' ||
    Boolean(minRent) ||
    Boolean(maxRent);

  function refreshAll() {
    void data.leasesQuery.refetch();
    void data.tenantsQuery.refetch();
    void data.propertiesQuery.refetch();
    void data.paymentsQuery.refetch();
    void data.maintenanceQuery.refetch();
    void data.auditQuery.refetch();
  }

  function clearFilters() {
    setSearch('');
    setLeaseFilter('all');
    setPropertyFilter('all');
    setUnitFilter('all');
    setTenantFilter('all');
    setExpiryFilter('all');
    setMinRent('');
    setMaxRent('');
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: LeaseRowModel) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setSelectedLease(row);
  }

  async function handleCreateLease(payload: CreateLeasePayload) {
    setFormError(undefined);
    try {
      await createLease.mutateAsync(payload);
      setModal(null);
      setToast('Lease created successfully.');
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
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Leases</h1>
          <p className="mt-1 max-w-3xl text-sm text-[#64748B]">
            Monitor active agreements, catch expiring leases before they lapse, and manage the full tenant occupancy lifecycle.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {supportsCreateLease && (
            <Button type="button" onClick={() => setModal({ mode: 'create' })} className="rounded-xl bg-[#10B981] hover:bg-emerald-600">
              <FilePlus2 className="h-4 w-4" />
              Create Lease
            </Button>
          )}
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8">
        <KpiCard label="Total Leases" value={isLoading ? '—' : kpis.totalLeases} icon={<FileText className="h-5 w-5" />} tone="bg-slate-50 text-slate-600" />
        <KpiCard label="Active" value={isLoading ? '—' : kpis.active} icon={<CheckCircle className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Expiring in 30 Days" value={isLoading ? '—' : kpis.expiring30Days} icon={<Clock className="h-5 w-5" />} tone="bg-amber-50 text-amber-600" />
        <KpiCard label="Expired" value={isLoading ? '—' : kpis.expired} icon={<XCircle className="h-5 w-5" />} tone="bg-slate-50 text-slate-500" />
        <KpiCard label="Pending Renewal" value={isLoading ? '—' : kpis.pendingRenewal} icon={<RefreshCw className="h-5 w-5" />} tone="bg-amber-50 text-amber-600" />
        <KpiCard label="Terminated" value={isLoading ? '—' : kpis.terminated} icon={<Ban className="h-5 w-5" />} tone="bg-rose-50 text-rose-600" />
        <KpiCard label="Monthly Rent Value" value={isLoading ? '—' : kpis.monthlyRentValue === null ? 'N/A' : fmt(kpis.monthlyRentValue)} icon={<Banknote className="h-5 w-5" />} tone="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Units Occupied" value={isLoading ? '—' : kpis.unitsOccupied} icon={<Home className="h-5 w-5" />} tone="bg-slate-50 text-slate-600" />
      </div>

      <div className="sticky top-0 z-20 mt-5 rounded-xl border border-slate-100 bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-3 xl:grid-cols-[minmax(220px,1.2fr)_repeat(5,minmax(150px,auto))_auto]">
          <label className="relative">
            <span className="sr-only">Search leases</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search tenant, property, unit, lease ID"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#10B981] focus:bg-white"
            />
          </label>
          <select value={leaseFilter} onChange={(event) => setLeaseFilter(event.target.value as LeaseFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#10B981]">
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
            <option value="pending_renewal">Pending Renewal</option>
          </select>
          <select
            value={propertyFilter}
            onChange={(event) => {
              setPropertyFilter(event.target.value);
              setUnitFilter('all');
            }}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#10B981]"
          >
            <option value="all">All properties</option>
            {data.properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name}
              </option>
            ))}
          </select>
          <select value={unitFilter} onChange={(event) => setUnitFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#10B981]">
            <option value="all">All units</option>
            {propertyUnits.map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </select>
          <select value={tenantFilter} onChange={(event) => setTenantFilter(event.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#10B981]">
            <option value="all">All tenants</option>
            {data.tenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name}
              </option>
            ))}
          </select>
          <select value={expiryFilter} onChange={(event) => setExpiryFilter(event.target.value as ExpiryFilter)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-[#10B981]">
            <option value="all">All expiry windows</option>
            <option value="7">Expiring in 7 days</option>
            <option value="30">Expiring in 30 days</option>
            <option value="expired">Already expired</option>
          </select>
          {filtersActive && (
            <button type="button" onClick={clearFilters} className="h-10 whitespace-nowrap rounded-xl px-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
              Clear filters
            </button>
          )}
        </div>
        {rentDataAvailable && (
          <div className="mt-3 flex flex-wrap gap-3">
            <input
              type="number"
              min={0}
              value={minRent}
              onChange={(event) => setMinRent(event.target.value)}
              placeholder="Min KES"
              className="h-10 w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#10B981] focus:bg-white"
            />
            <input
              type="number"
              min={0}
              value={maxRent}
              onChange={(event) => setMaxRent(event.target.value)}
              placeholder="Max KES"
              className="h-10 w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-[#10B981] focus:bg-white"
            />
          </div>
        )}
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
            <table className="w-full min-w-[1180px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80">
                <tr>
                  {headings.map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <SkeletonRows />
                ) : filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={headings.length} className="px-4 py-12 text-center">
                      <div className="mx-auto flex max-w-md flex-col items-center">
                        <FileText className="h-12 w-12 text-slate-300" />
                        <p className="mt-3 text-base font-semibold text-slate-800">
                          {rows.length === 0 ? 'No leases recorded yet' : 'No leases match your filters'}
                        </p>
                        {rows.length === 0 && supportsCreateLease ? (
                          <Button type="button" onClick={() => setModal({ mode: 'create' })} className="mt-4 rounded-xl bg-[#10B981] hover:bg-emerald-600">
                            <FilePlus2 className="h-4 w-4" />
                            Create Lease
                          </Button>
                        ) : rows.length > 0 ? (
                          <button type="button" onClick={clearFilters} className="mt-3 text-sm font-semibold text-emerald-700 hover:underline">
                            Clear Filters
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.lease.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedLease(row)}
                      onKeyDown={(event) => handleRowKeyDown(event, row)}
                      className="min-h-12 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      <td className="px-4 py-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-xs font-bold text-white">
                            {getInitials(row.tenantName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{row.tenantName}</p>
                            <p className="truncate text-xs text-slate-500">{row.tenantEmail ?? row.tenantPhone ?? '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{row.propertyName ?? '—'}</p>
                        <p className="text-xs text-slate-400">{row.unitLabel ? `Unit ${row.unitLabel}` : '—'}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{formatLeasePeriod(row.lease.startDate, row.lease.endDate)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.status} />
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{row.monthlyRent === undefined ? '—' : fmt(row.monthlyRent)}</td>
                      <td className="px-4 py-3 text-slate-700">{row.deposit === undefined ? '—' : fmt(row.deposit)}</td>
                      <td className="px-4 py-3 text-slate-700">{row.balance === null ? 'N/A' : fmt(row.balance)}</td>
                      <td className={clsx('px-4 py-3 font-semibold', expiryClass(row))}>{expiryLabel(row.daysUntilExpiry, row.lease.endDate)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedLease(row);
                            }}
                            className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700"
                            aria-label={`View lease ${row.reference}`}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
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

      <LeaseDetailsDrawer row={selectedLease} onClose={() => setSelectedLease(null)} />
      {modal && (
        <LeaseFormModal
          key={`${modal.mode}-${modal.lease?.lease.id ?? 'new'}`}
          isOpen
          mode={modal.mode}
          lease={modal.lease}
          tenants={data.tenants}
          properties={data.properties}
          supportsEdit={supportsEditLease}
          supportsNotes={supportsNotes}
          isSaving={createLease.isPending}
          error={formError}
          onClose={() => {
            setModal(null);
            setFormError(undefined);
          }}
          onSubmit={(payload) => void handleCreateLease(payload)}
        />
      )}
    </div>
  );
}
