import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { ROUTES } from '@/constants/routes/routes';
import {
  detailedExpiryLabel,
  fmt,
  fmtDate,
  fmtDateTime,
  formatLeasePeriod,
  getInitials,
  getLeaseStatusColor,
  leaseDuration,
  maintenanceTitle,
  paymentDate,
  paymentMethod,
  paymentSummary,
  statusLabel,
  type LeaseRowModel,
} from '../utils/leaseDerivedData';

type DrawerTab = 'overview' | 'tenant' | 'payments' | 'rentCharges' | 'maintenance' | 'activity';

const tabs: Array<{ id: DrawerTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'payments', label: 'Payments' },
  { id: 'rentCharges', label: 'Rent Charges' },
  { id: 'maintenance', label: 'Maintenance' },
  { id: 'activity', label: 'Activity' },
];

function StatusBadge({ status, label }: { status?: string | null; label?: string }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', getLeaseStatusColor(status))}>
      {label ?? statusLabel(status)}
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

function accountBadge(row: LeaseRowModel) {
  if (!row.tenant || !('keycloakUserId' in row.tenant)) return '—';
  return row.tenant.keycloakUserId ? (
    <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
      Linked
    </span>
  ) : (
    <span className="inline-flex rounded-full border border-amber-100 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
      Unlinked
    </span>
  );
}

export function LeaseDetailsDrawer({
  row,
  onClose,
}: {
  row: LeaseRowModel | null;
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
  const propertyUnitLine = [row.propertyName, row.unitLabel].filter(Boolean).join(' / ') || '—';

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close lease details"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <StatusBadge status={row.status} />
              <h2 className="mt-2 truncate text-lg font-semibold text-[#1E293B]">{row.tenantName}</h2>
              <p className="mt-1 truncate text-sm text-[#64748B]">{propertyUnitLine}</p>
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
            <Section title="Lease Overview">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Status" value={<StatusBadge status={row.status} />} />
                <Info label="Tenant" value={row.tenantName} />
                <Info label="Property" value={row.propertyName ?? '—'} />
                <Info label="Unit" value={row.unitLabel ?? '—'} />
                <Info label="Lease Period" value={formatLeasePeriod(row.lease.startDate, row.lease.endDate)} />
                <Info label="Duration" value={leaseDuration(row.lease.startDate, row.lease.endDate)} />
                <Info label="Days Remaining" value={detailedExpiryLabel(row.daysUntilExpiry)} />
                <Info label="Monthly Rent" value={row.monthlyRent === undefined ? '—' : fmt(row.monthlyRent)} />
                <Info label="Deposit" value={row.deposit === undefined ? '—' : fmt(row.deposit)} />
                <Info label="Created" value={fmtDateTime(row.lease.createdAt)} />
                <Info label="Last Updated" value={fmtDateTime(row.lease.updatedAt)} />
                {'notes' in row.lease && <Info label="Notes" value={row.lease.notes || '—'} />}
              </dl>
            </Section>
          )}

          {activeTab === 'tenant' && (
            row.tenant ? (
              <Section title="Tenant Details">
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981] text-xs font-bold text-white">
                    {getInitials(row.tenant.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{row.tenant.name}</p>
                    <p className="truncate text-sm text-slate-500">{row.tenant.email}</p>
                  </div>
                </div>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info label="Full Name" value={row.tenant.name} />
                  <Info label="Email" value={row.tenant.email} />
                  <Info label="Phone" value={row.tenantPhone ?? '—'} />
                  <Info label="Keycloak" value={accountBadge(row)} />
                </dl>
                <Link
                  to={`${ROUTES.ADMIN_TENANTS}?tenantId=${encodeURIComponent(row.tenant.id)}`}
                  className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Open tenant record
                </Link>
              </Section>
            ) : (
              <EmptyMessage>Tenant details not available.</EmptyMessage>
            )
          )}

          {activeTab === 'payments' && (
            row.payments.length > 0 ? (
              <>
                <Section title="Payment Summary">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <Info label="Confirmed" value={fmt(summary.confirmed)} />
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
                            <p className="font-semibold text-slate-900">{fmt(payment.amount)}</p>
                            <p className="mt-1 text-xs text-slate-500">{fmtDateTime(paymentDate(payment))}</p>
                          </div>
                          <StatusBadge status={payment.status} />
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

          {activeTab === 'rentCharges' && (
            <EmptyMessage>Rent charge data requires backend support.</EmptyMessage>
          )}

          {activeTab === 'maintenance' && (
            row.maintenance.length > 0 ? (
              <Section title="Maintenance Requests">
                <div className="space-y-3">
                  {row.maintenance.map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{maintenanceTitle(request)}</p>
                          {request.description && <p className="mt-1 text-sm text-slate-500">{request.description}</p>}
                        </div>
                        <StatusBadge status={request.status} />
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                        <StatusBadge status={request.priority ?? 'priority'} label={statusLabel(request.priority ?? 'Priority N/A')} />
                        <span>Created {fmtDate(request.createdAt)}</span>
                        <span>Updated {fmtDateTime(request.updatedAt ?? request.lastUpdatedAt ?? request.resolvedAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            ) : (
              <EmptyMessage>No maintenance requests for this lease.</EmptyMessage>
            )
          )}

          {activeTab === 'activity' && (
            row.activity.length > 0 ? (
              <Section title="Audit Activity">
                <div className="space-y-3">
                  {row.activity.map((event) => (
                    <div key={event.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <p className="font-semibold text-slate-900">{event.action}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {fmtDateTime(event.timestamp)} · {event.userEmail}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : (
              <EmptyMessage>No audit activity found for this lease.</EmptyMessage>
            )
          )}
        </div>
      </aside>
    </div>
  );
}
