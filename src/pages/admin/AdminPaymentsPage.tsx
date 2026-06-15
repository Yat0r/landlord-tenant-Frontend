import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowDownToLine,
  BadgeDollarSign,
  Banknote,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FilterX,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { handleApiError } from '@/api/helpers/apiHelpers';
import { useAdminPaymentsData, useRecordPayment, type RecordPaymentPayload } from '@/features/admin/payments/hooks/useAdminPayments';
import { PaymentDetailsDrawer } from '@/features/admin/payments/components/PaymentDetailsDrawer';
import { PaymentFormModal } from '@/features/admin/payments/components/PaymentFormModal';
import { PaymentActionModal } from '@/features/admin/payments/components/PaymentActionModal';
import { PaymentAllocationModal } from '@/features/admin/payments/components/PaymentAllocationModal';
import {
  allocationLabel,
  buildPaymentRows,
  calculatePaymentSummary,
  filterPayments,
  fmtDateTime,
  formatKesAmount,
  getInitials,
  getPaymentMethodIcon,
  getPaymentMethodLabel,
  getPaymentStatusColor,
  normalizeStatus,
  receiptLabel,
  statusLabel,
  type PaymentFilters,
  type PaymentRowModel,
  type PaymentStatus,
} from '@/features/admin/payments/utils/paymentDerivedData';

type ModalState =
  | { type: 'record' }
  | { type: 'confirm'; payment: PaymentRowModel }
  | { type: 'refund'; payment: PaymentRowModel }
  | { type: 'allocate'; payment: PaymentRowModel }
  | { type: 'receipt'; payment: PaymentRowModel }
  | null;

const defaultFilters: PaymentFilters = {
  search: '',
  status: 'all',
  method: 'all',
  dateFrom: '',
  dateTo: '',
  propertyId: 'all',
  tenantId: 'all',
  minAmount: '',
  maxAmount: '',
};

const statusTabs: Array<{ value: PaymentStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
];

function ErrorMessage({ status, message }: { status: number; message: string }) {
  if (status === 401) return <>Your session has expired. Please sign in again.</>;
  if (status === 403) return <>You do not have permission to view payments.</>;
  return <>{message}</>;
}

function StatusBadge({ status, label }: { status?: string | null; label?: string }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', getPaymentStatusColor(status))}>
      {label ?? statusLabel(status)}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  className,
}: {
  label: string;
  value: ReactNode;
  detail: ReactNode;
  icon: ReactNode;
  className: string;
}) {
  return (
    <div className={clsx('relative overflow-hidden rounded-3xl border border-white/70 bg-white/75 p-5 shadow-sm shadow-slate-200/70 backdrop-blur', className)}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-white/30 blur-2xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-3 text-2xl font-bold text-[#1E293B]">{value}</p>
          <p className="mt-2 text-sm font-medium text-slate-500">{detail}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-slate-700 shadow-sm">
          {icon}
        </span>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={index} className="border-b border-slate-100">
          {Array.from({ length: 9 }).map((__, cellIndex) => (
            <td key={cellIndex} className="px-4 py-3">
              <div className="h-4 rounded-full bg-slate-100" />
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

function exportRows(rows: PaymentRowModel[]) {
  const headers = ['reference', 'tenant', 'property', 'unit', 'method', 'amount', 'status', 'payment date', 'allocation status', 'receipt status'];
  const lines = rows.map((row) =>
    [
      row.reference,
      row.tenantName,
      row.propertyName ?? '',
      row.unitLabel ?? '',
      getPaymentMethodLabel(row.method),
      String(row.amount),
      statusLabel(row.status),
      row.paymentDate ?? '',
      allocationLabel(row.allocationStatus),
      receiptLabel(row.receiptStatus),
    ].map(csvEscape).join(',')
  );
  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([[headers.map(csvEscape).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `propease-payments-${today}.csv`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

function methodOptions(rows: PaymentRowModel[]) {
  const labels = new Set(rows.map((row) => getPaymentMethodLabel(row.method)).filter((label) => label !== 'Not available yet'));
  return ['all', ...Array.from(labels)];
}

function supportsNotes(rows: PaymentRowModel[]) {
  return rows.some((row) => 'notes' in row.payment);
}

export default function AdminPaymentsPage() {
  const [filters, setFilters] = useState<PaymentFilters>(defaultFilters);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRowModel | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [formError, setFormError] = useState<string>();
  const [toast, setToast] = useState<string>();

  const data = useAdminPaymentsData(500);
  const recordPayment = useRecordPayment();

  const rows = useMemo(
    () =>
      buildPaymentRows({
        payments: data.payments,
        tenants: data.tenants,
        leases: data.leases,
        properties: data.properties,
        auditEvents: data.auditEvents,
      }),
    [data.auditEvents, data.leases, data.payments, data.properties, data.tenants]
  );

  const summary = useMemo(() => calculatePaymentSummary(rows), [rows]);
  const filteredRows = useMemo(() => filterPayments(rows, filters), [filters, rows]);
  const methods = useMemo(() => methodOptions(rows), [rows]);
  const notesSupported = supportsNotes(rows);
  const supportsConfirm = false;
  const supportsRefund = false;
  const supportsAllocation = false;
  const supportsReceiptGeneration = false;
  const supportsReconcile = false;

  const isLoading =
    data.paymentsQuery.isPending ||
    data.tenantsQuery.isPending ||
    data.leasesQuery.isPending ||
    data.propertiesQuery.isPending ||
    data.auditQuery.isPending;
  const firstError =
    data.paymentsQuery.error ??
    data.tenantsQuery.error ??
    data.leasesQuery.error ??
    data.propertiesQuery.error ??
    data.auditQuery.error;
  const apiError = firstError ? handleApiError(firstError) : undefined;
  const filtersActive = JSON.stringify(filters) !== JSON.stringify(defaultFilters);

  const pipelineCounts = useMemo(() => {
    const counts = new Map<PaymentStatus, number>();
    statusTabs.forEach((tab) => counts.set(tab.value, tab.value === 'all' ? rows.length : rows.filter((row) => normalizeStatus(row.status) === tab.value).length));
    return counts;
  }, [rows]);

  function setFilter<K extends keyof PaymentFilters>(key: K, value: PaymentFilters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function refreshAll() {
    void data.paymentsQuery.refetch();
    void data.tenantsQuery.refetch();
    void data.leasesQuery.refetch();
    void data.propertiesQuery.refetch();
    void data.auditQuery.refetch();
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, row: PaymentRowModel) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    setSelectedPayment(row);
  }

  async function handleRecordPayment(payload: RecordPaymentPayload) {
    setFormError(undefined);
    try {
      await recordPayment.mutateAsync(payload);
      setModal(null);
      setToast('Payment recorded successfully.');
      window.setTimeout(() => setToast(undefined), 3500);
      refreshAll();
    } catch (error) {
      setFormError(handleApiError(error).message);
    }
  }

  return (
    <div className="min-h-full bg-[#F9FAFB] px-5 py-5 text-slate-900">
      {toast && (
        <div className="fixed right-5 top-5 z-[60] rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1E293B]">Payments</h1>
          <p className="mt-1 max-w-3xl text-sm text-[#64748B]">
            Track rent payments, confirmations, failed transactions, allocations, refunds, and receipts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => setModal({ type: 'record' })} className="rounded-2xl bg-brand-primary shadow-sm hover:bg-brand-primary-hover">
            <CreditCard className="h-4 w-4" />
            Record Payment
          </Button>
          <Button type="button" variant="ghost" onClick={refreshAll} className="rounded-2xl">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" variant="ghost" onClick={() => exportRows(filteredRows)} className="rounded-2xl">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          {supportsReconcile && (
            <Button type="button" variant="outline" className="rounded-2xl">
              <ShieldCheck className="h-4 w-4" />
              Reconcile Payments
            </Button>
          )}
        </div>
      </div>

      <section className="mt-6 rounded-[2rem] border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(11,124,193,0.16),transparent_32%),linear-gradient(135deg,#ffffff_0%,#f8fbff_52%,#EAF2FF_100%)] p-4 shadow-sm shadow-slate-200/70">
        <div className="grid gap-4 xl:grid-cols-4">
          <MetricCard
            label="Total Confirmed"
            value={isLoading ? '—' : formatKesAmount(summary.confirmedTotal)}
            detail="Confirmed rent inflows"
            icon={<Banknote className="h-5 w-5" />}
            className="bg-emerald-50/60"
          />
          <MetricCard
            label="Pending Verification"
            value={isLoading ? '—' : summary.pendingCount}
            detail={isLoading ? '—' : summary.pendingAmount === null ? 'Not available yet' : formatKesAmount(summary.pendingAmount)}
            icon={<Clock3 className="h-5 w-5" />}
            className="bg-amber-50/70"
          />
          <MetricCard
            label="Failed Payments"
            value={isLoading ? '—' : summary.failedCount}
            detail={isLoading ? '—' : summary.failedAmount === null ? 'Not available yet' : formatKesAmount(summary.failedAmount)}
            icon={<XCircle className="h-5 w-5" />}
            className="bg-rose-50/70"
          />
          <MetricCard
            label="Refunded Payments"
            value={isLoading ? '—' : summary.refundedAmount === null ? 'Not available yet' : formatKesAmount(summary.refundedAmount)}
            detail={isLoading ? '—' : `${summary.refundedCount} payment${summary.refundedCount === 1 ? '' : 's'}`}
            icon={<ArrowDownToLine className="h-5 w-5" />}
            className="bg-brand-info/70"
          />
        </div>
      </section>

      <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(320px,0.9fr)_1.4fr]">
        <section className="overflow-hidden rounded-3xl border border-slate-100 bg-[#111827] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-info">Collection Health</p>
              <h2 className="mt-2 text-xl font-bold">Payment intelligence</h2>
            </div>
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-brand-info">
              <Sparkles className="h-5 w-5" />
            </span>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/10 p-3">
              <dt className="text-xs text-slate-300">Confirmation rate</dt>
              <dd className="mt-1 text-lg font-bold">{summary.confirmationRate === null ? 'Not available yet' : `${Math.round(summary.confirmationRate * 100)}%`}</dd>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <dt className="text-xs text-slate-300">Pending amount</dt>
              <dd className="mt-1 text-lg font-bold">{summary.pendingAmount === null ? 'Not available yet' : formatKesAmount(summary.pendingAmount)}</dd>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <dt className="text-xs text-slate-300">Failed amount</dt>
              <dd className="mt-1 text-lg font-bold">{summary.failedAmount === null ? 'Not available yet' : formatKesAmount(summary.failedAmount)}</dd>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <dt className="text-xs text-slate-300">This month collection</dt>
              <dd className="mt-1 text-lg font-bold">{summary.thisMonthCollection === null ? 'Not available yet' : formatKesAmount(summary.thisMonthCollection)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-[#1E293B]">Payment status pipeline</h2>
              <p className="text-sm text-[#64748B]">Click a stage to filter the ledger.</p>
            </div>
            <BadgeDollarSign className="h-5 w-5 text-brand-primary" />
          </div>
          <div className="grid gap-3 sm:grid-cols-5">
            {statusTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setFilter('status', tab.value)}
                className={clsx(
                  'rounded-2xl border px-4 py-3 text-left transition-all',
                  filters.status === tab.value
                    ? 'border-brand-info-border bg-brand-info shadow-sm'
                    : 'border-slate-100 bg-slate-50/60 hover:border-slate-200 hover:bg-white'
                )}
              >
                <span className="block text-xs font-semibold text-slate-500">{tab.label}</span>
                <span className="mt-1 block text-2xl font-bold text-slate-900">{pipelineCounts.get(tab.value) ?? 0}</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="sticky top-0 z-20 mt-5 rounded-3xl border border-slate-100 bg-white/95 p-4 shadow-sm backdrop-blur">
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.2fr)_repeat(5,minmax(145px,auto))_auto]">
          <label className="relative">
            <span className="sr-only">Search payments</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <input
              type="search"
              value={filters.search}
              onChange={(event) => setFilter('search', event.target.value)}
              placeholder="Search tenant, phone, email, reference, lease, property, unit"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-primary focus:bg-white"
            />
          </label>
          <select value={filters.status} onChange={(event) => setFilter('status', event.target.value as PaymentStatus)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            {statusTabs.map((tab) => <option key={tab.value} value={tab.value}>{tab.label}</option>)}
          </select>
          <select value={filters.method} onChange={(event) => setFilter('method', event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            {methods.map((method) => <option key={method} value={method}>{method === 'all' ? 'All methods' : method}</option>)}
          </select>
          <select value={filters.propertyId} onChange={(event) => setFilter('propertyId', event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            <option value="all">All properties</option>
            {data.properties.map((property) => <option key={property.id} value={property.id}>{property.name}</option>)}
          </select>
          <select value={filters.tenantId} onChange={(event) => setFilter('tenantId', event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary">
            <option value="all">All tenants</option>
            {data.tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.name}</option>)}
          </select>
          <div className="flex gap-2">
            <input type="date" value={filters.dateFrom} onChange={(event) => setFilter('dateFrom', event.target.value)} className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary" />
            <input type="date" value={filters.dateTo} onChange={(event) => setFilter('dateTo', event.target.value)} className="h-11 min-w-0 rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none focus:border-brand-primary" />
          </div>
          {filtersActive && (
            <button type="button" onClick={() => setFilters(defaultFilters)} className="inline-flex h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl px-3 text-sm font-semibold text-brand-primary hover:bg-brand-panel">
              <FilterX className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3">
          <input
            type="number"
            min={0}
            value={filters.minAmount}
            onChange={(event) => setFilter('minAmount', event.target.value)}
            placeholder="Min amount"
            className="h-11 w-40 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-brand-primary focus:bg-white"
          />
          <input
            type="number"
            min={0}
            value={filters.maxAmount}
            onChange={(event) => setFilter('maxAmount', event.target.value)}
            placeholder="Max amount"
            className="h-11 w-40 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none focus:border-brand-primary focus:bg-white"
          />
        </div>
      </section>

      {apiError ? (
        <div className="mt-5 rounded-3xl border border-rose-100 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-rose-500" />
          <p className="mt-3 text-sm font-semibold text-slate-800">
            <ErrorMessage status={apiError.status} message={apiError.message} />
          </p>
          <Button type="button" variant="secondary" onClick={refreshAll} className="mt-4 rounded-2xl">
            Retry
          </Button>
        </div>
      ) : (
        <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1240px] text-left text-sm">
              <thead className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 backdrop-blur">
                <tr>
                  {['Payment', 'Tenant', 'Property / Unit', 'Lease', 'Amount', 'Status', 'Allocation', 'Receipt', 'Actions'].map((heading) => (
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
                    <td colSpan={9} className="px-4 py-14 text-center">
                      <Receipt className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-3 text-base font-semibold text-slate-800">{rows.length === 0 ? 'No payments found' : 'No payments match your filters'}</p>
                      {rows.length > 0 && (
                        <button type="button" onClick={() => setFilters(defaultFilters)} className="mt-3 text-sm font-semibold text-brand-primary hover:underline">
                          Clear filters
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.payment.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPayment(row)}
                      onKeyDown={(event) => handleRowKeyDown(event, row)}
                      className="min-h-12 cursor-pointer hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-[11px] font-bold text-white">
                            {getPaymentMethodIcon(row.method)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{row.reference}</p>
                            <p className="truncate text-xs text-slate-500">{getPaymentMethodLabel(row.method)} · {fmtDateTime(row.paymentDate)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-xs font-bold text-white">
                            {getInitials(row.tenantName)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">{row.tenantName}</p>
                            <p className="truncate text-xs text-slate-500">{row.tenantEmail ?? row.tenantPhone ?? 'Not available yet'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">{row.propertyName ?? 'Not available yet'}</p>
                        <p className="text-xs text-slate-400">{row.unitLabel ?? 'Not available yet'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-xs font-semibold text-slate-700">{row.leaseLabel ?? 'Not available yet'}</p>
                        <p className="mt-1">{row.leaseStatus ? <StatusBadge status={row.leaseStatus} /> : <span className="text-xs text-slate-400">Not available yet</span>}</p>
                      </td>
                      <td className="px-4 py-3 text-base font-bold text-slate-950">{formatKesAmount(row.amount)}</td>
                      <td className="px-4 py-3"><StatusBadge status={row.status} /></td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600">{allocationLabel(row.allocationStatus)}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600">{receiptLabel(row.receiptStatus)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedPayment(row);
                            }}
                            className="rounded-xl p-2 text-slate-400 hover:bg-brand-panel hover:text-brand-primary"
                            aria-label={`View payment ${row.reference}`}
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {supportsConfirm && normalizeStatus(row.status) === 'pending' && (
                            <button type="button" onClick={(event) => { event.stopPropagation(); setModal({ type: 'confirm', payment: row }); }} className="rounded-xl p-2 text-slate-400 hover:bg-brand-panel hover:text-brand-primary" title="Confirm">
                              <CheckCircle2 className="h-4 w-4" />
                            </button>
                          )}
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

      <PaymentDetailsDrawer row={selectedPayment} onClose={() => setSelectedPayment(null)} />
      {modal?.type === 'record' && (
        <PaymentFormModal
          isOpen
          tenants={data.tenants}
          leases={data.leases}
          supportsNotes={notesSupported}
          isSaving={recordPayment.isPending}
          error={formError}
          onClose={() => {
            setModal(null);
            setFormError(undefined);
          }}
          onSubmit={(payload) => void handleRecordPayment(payload)}
        />
      )}
      {(modal?.type === 'confirm' || modal?.type === 'refund' || modal?.type === 'receipt') && (
        <PaymentActionModal
          isOpen
          action={modal.type}
          payment={modal.payment}
          supportsAction={modal.type === 'confirm' ? supportsConfirm : modal.type === 'refund' ? supportsRefund : supportsReceiptGeneration}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.type === 'allocate' && (
        <PaymentAllocationModal
          isOpen
          payment={modal.payment}
          supportsAllocation={supportsAllocation}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
