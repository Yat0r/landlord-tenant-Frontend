import { useEffect, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import {
  fmt,
  fmtDate,
  fmtDateTime,
  getInitials,
  normalizeStatus,
  paymentSummary,
  statusLabel,
  type MaintenanceRecord,
  type PaymentRecord,
  type TenantRowModel,
} from '../utils/tenantDerivedData';

type DrawerTab = 'overview' | 'lease' | 'payments' | 'maintenance' | 'account';

const tabs: Array<{ id: DrawerTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'lease', label: 'Lease' },
  { id: 'payments', label: 'Payments' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'account', label: 'Account' },
];

function badgeClass(value?: string | null) {
  const status = normalizeStatus(value);
  if (status === 'active' || status === 'confirmed' || status === 'linked' || status === 'resolved') {
    return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  }
  if (status === 'expired' || status === 'none' || status === 'cleared') {
    return 'border-slate-200 bg-slate-100 text-slate-600';
  }
  if (status === 'terminated' || status === 'failed' || status === 'overdue') {
    return 'border-rose-100 bg-rose-50 text-rose-700';
  }
  return 'border-amber-100 bg-amber-50 text-amber-700';
}

function StatusBadge({ value, label }: { value?: string | null; label?: string }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', badgeClass(value))}>
      {label ?? statusLabel(value)}
    </span>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-500">
      {children}
    </div>
  );
}

function maskedKeycloakId(value?: string) {
  if (!value) return 'Not linked';
  return `${value.slice(0, 8)}…`;
}

function paymentDate(payment: PaymentRecord) {
  return payment.paidDate ?? payment.createdAt ?? payment.chargeDate ?? payment.dueDate;
}

function paymentMethod(payment: PaymentRecord) {
  return payment.method ?? payment.paymentMethod ?? payment.reference ?? '—';
}

function maintenanceTitle(request: MaintenanceRecord) {
  return request.title ?? request.issueSummary ?? request.description ?? 'Maintenance request';
}

export function TenantDetailsDrawer({
  row,
  onClose,
}: {
  row: TenantRowModel | null;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DrawerTab>('overview');

  useEffect(() => {
    if (!row) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, row]);

  if (!row) return null;

  const summary = paymentSummary(row.payments);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close tenant details"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">
                {getInitials(row.fullName)}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-lg font-semibold text-[#1E293B]">{row.fullName}</h2>
                  <StatusBadge value={row.isLinked ? 'linked' : 'unlinked'} label={row.isLinked ? 'Linked' : 'Unlinked'} />
                </div>
                <p className="mt-1 truncate text-sm text-[#64748B]">
                  {[row.propertyName, row.unit].filter(Boolean).join(' / ') || '—'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  activeTab === tab.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-[#F9FAFB] px-5 py-4">
          {activeTab === 'overview' && (
            <Section title="Tenant Overview">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Name" value={row.fullName} />
                <Info label="Email" value={row.email || '—'} />
                <Info label="Phone" value={row.phone ?? '—'} />
                <Info label="Account" value={<StatusBadge value={row.isLinked ? 'linked' : 'unlinked'} label={row.isLinked ? 'Linked' : 'Unlinked'} />} />
                <Info label="Property" value={row.propertyName ?? '—'} />
                <Info label="Unit" value={row.unit ?? '—'} />
                <Info label="Lease Status" value={<StatusBadge value={row.lease?.status ?? 'none'} label={row.lease ? statusLabel(row.lease.status) : 'None'} />} />
                <Info label="Monthly Rent" value={row.monthlyRent === undefined ? '—' : fmt(row.monthlyRent)} />
                <Info label="Balance" value={row.balanceDerivable ? fmt(row.balance) : 'N/A'} />
                <Info label="Open Maintenance" value={row.openMaintenanceCount} />
              </dl>
            </Section>
          )}

          {activeTab === 'lease' && (
            row.lease ? (
              <Section title="Lease Details">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info label="Lease ID / Reference" value={row.lease.reference ?? row.lease.leaseReference ?? row.lease.id} />
                  <Info label="Status" value={<StatusBadge value={row.lease.status} />} />
                  <Info label="Start Date" value={fmtDate(row.lease.startDate)} />
                  <Info label="End Date" value={fmtDate(row.lease.endDate)} />
                  <Info label="Monthly Rent" value={row.monthlyRent === undefined ? '—' : fmt(row.monthlyRent)} />
                  <Info label="Deposit" value={row.deposit === undefined ? '—' : fmt(row.deposit)} />
                  <Info label="Property" value={row.propertyName ?? '—'} />
                  <Info label="Unit" value={row.unit ?? '—'} />
                </dl>
              </Section>
            ) : (
              <EmptyMessage>No lease record found for this tenant.</EmptyMessage>
            )
          )}

          {activeTab === 'payments' && (
            row.payments.length > 0 ? (
              <>
                <Section title="Payment Summary">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <Info label="Total Confirmed" value={fmt(summary.confirmed)} />
                    <Info label="Pending" value={fmt(summary.pending)} />
                    <Info label="Failed" value={fmt(summary.failed)} />
                    <Info label="Last Payment" value={fmtDate(summary.lastPaymentDate)} />
                  </dl>
                </Section>
                <Section title="Payment History">
                  <div className="space-y-3">
                    {row.payments.map((payment) => (
                      <div key={payment.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{fmt(payment.amount)}</p>
                            <p className="mt-1 text-xs text-slate-500">{fmtDateTime(paymentDate(payment))}</p>
                          </div>
                          <StatusBadge value={payment.status} />
                        </div>
                        <p className="mt-2 text-xs text-slate-500">Method: {paymentMethod(payment)}</p>
                      </div>
                    ))}
                  </div>
                </Section>
              </>
            ) : (
              <EmptyMessage>Payment data not available yet.</EmptyMessage>
            )
          )}

          {activeTab === 'maintenance' && (
            row.maintenance.length > 0 ? (
              <Section title="Maintenance Requests">
                <div className="space-y-3">
                  {row.maintenance.map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">{maintenanceTitle(request)}</p>
                          {request.description && (
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">{request.description}</p>
                          )}
                        </div>
                        <StatusBadge value={request.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <StatusBadge value={request.priority ?? 'priority'} label={statusLabel(request.priority ?? 'Priority N/A')} />
                        <span>Created {fmtDate(request.createdAt)}</span>
                        <span>Updated {fmtDateTime(request.updatedAt ?? request.lastUpdatedAt ?? request.resolvedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            ) : (
              <EmptyMessage>No maintenance requests from this tenant.</EmptyMessage>
            )
          )}

          {activeTab === 'account' && (
            <>
              <Section title="Account Link">
                <dl className="grid gap-4">
                  <Info label="Keycloak User ID" value={maskedKeycloakId(row.keycloakUserId)} />
                  <Info label="Status" value={<StatusBadge value={row.isLinked ? 'linked' : 'unlinked'} label={row.isLinked ? 'Linked' : 'Unlinked'} />} />
                </dl>
              </Section>
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                Tenant portal access requires a linked Keycloak account. Linking is managed via the backend admin.
              </div>
              <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-500">
                Account linking requires backend support.
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
