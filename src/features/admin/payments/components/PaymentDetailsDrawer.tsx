import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { ROUTES } from '@/constants/routes/routes';
import {
  allocationLabel,
  fmtDate,
  fmtDateTime,
  formatKesAmount,
  getInitials,
  getPaymentMethodLabel,
  getPaymentStatusColor,
  receiptLabel,
  statusLabel,
  type PaymentRowModel,
} from '../utils/paymentDerivedData';

type DrawerTab = 'overview' | 'tenantLease' | 'allocation' | 'receipt' | 'activity';

const tabs: Array<{ id: DrawerTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'tenantLease', label: 'Tenant & Lease' },
  { id: 'allocation', label: 'Allocation' },
  { id: 'receipt', label: 'Receipt' },
  { id: 'activity', label: 'Audit / Activity' },
];

function StatusBadge({ status, label }: { status?: string | null; label?: string }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', getPaymentStatusColor(status))}>
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
    <section className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm shadow-slate-200/60">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-5 text-center text-sm font-medium text-slate-500">
      {children}
    </div>
  );
}

export function PaymentDetailsDrawer({
  row,
  onClose,
}: {
  row: PaymentRowModel | null;
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

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close payment details"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-[#F9FAFB] shadow-2xl">
        <div className="border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <StatusBadge status={row.status} />
              <h2 className="mt-2 truncate text-lg font-semibold text-[#1E293B]">{row.reference}</h2>
              <p className="mt-1 truncate text-sm text-[#64748B]">
                {row.tenantName} · {formatKesAmount(row.amount)}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
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
                  'rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors',
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

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {activeTab === 'overview' && (
            <Section title="Payment Overview">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Reference" value={row.reference} />
                <Info label="Amount" value={formatKesAmount(row.amount)} />
                <Info label="Status" value={<StatusBadge status={row.status} />} />
                <Info label="Method" value={getPaymentMethodLabel(row.method)} />
                <Info label="Payment Date" value={fmtDateTime(row.paymentDate)} />
                <Info label="Transaction Ref" value={row.transactionReference ?? 'Not available yet'} />
                <Info label="Created" value={fmtDateTime(row.payment.createdAt)} />
                <Info label="Updated" value={fmtDateTime(row.payment.updatedAt)} />
                {'notes' in row.payment && <Info label="Notes" value={row.payment.notes || 'Not available yet'} />}
              </dl>
            </Section>
          )}

          {activeTab === 'tenantLease' && (
            <Section title="Tenant & Lease">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-white">
                  {getInitials(row.tenantName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-900">{row.tenantName}</p>
                  <p className="truncate text-sm text-slate-500">{row.tenantEmail ?? row.tenantPhone ?? 'Not available yet'}</p>
                </div>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Tenant Name" value={row.tenantName} />
                <Info label="Email / Phone" value={row.tenantEmail ?? row.tenantPhone ?? 'Not available yet'} />
                <Info label="Property" value={row.propertyName ?? 'Not available yet'} />
                <Info label="Unit" value={row.unitLabel ?? 'Not available yet'} />
                <Info label="Lease" value={row.leaseLabel ?? 'Not available yet'} />
                <Info label="Lease Status" value={row.leaseStatus ? <StatusBadge status={row.leaseStatus} /> : 'Not available yet'} />
                <Info label="Monthly Rent" value={formatKesAmount(row.monthlyRent)} />
                <Info label="Lease Period" value={row.lease ? `${fmtDate(row.lease.startDate)} to ${fmtDate(row.lease.endDate)}` : 'Not available yet'} />
              </dl>
              {row.tenant && (
                <Link
                  to={`${ROUTES.ADMIN_TENANTS}?tenantId=${encodeURIComponent(row.tenant.id)}`}
                  className="mt-4 inline-flex text-sm font-semibold text-emerald-700 hover:underline"
                >
                  Open tenant details
                </Link>
              )}
            </Section>
          )}

          {activeTab === 'allocation' && (
            row.allocationStatus === 'requires_support' ? (
              <EmptyMessage>Payment allocation requires backend support.</EmptyMessage>
            ) : (
              <Section title="Allocation">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info label="Status" value={allocationLabel(row.allocationStatus)} />
                  <Info label="Amount Applied" value={formatKesAmount(row.payment.allocatedAmount)} />
                  <Info label="Rent Charge" value="Not available yet" />
                  <Info label="Remaining Balance" value="Not available yet" />
                </dl>
              </Section>
            )
          )}

          {activeTab === 'receipt' && (
            row.receiptStatus === 'requires_support' ? (
              <EmptyMessage>Receipt generation requires backend support.</EmptyMessage>
            ) : (
              <Section title="Receipt">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info label="Receipt Status" value={receiptLabel(row.receiptStatus)} />
                  <Info label="Receipt Number" value={row.payment.receiptNumber ?? 'Not available yet'} />
                  <Info label="Receipt Amount" value={formatKesAmount(row.amount)} />
                  <Info label="Download PDF" value="Requires backend support" />
                </dl>
              </Section>
            )
          )}

          {activeTab === 'activity' && (
            row.auditEvents.length > 0 ? (
              <Section title="Payment Timeline">
                <div className="space-y-3">
                  {row.auditEvents.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <p className="font-semibold text-slate-900">{event.action}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {fmtDateTime(event.timestamp)} · {event.userEmail}
                      </p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : (
              <EmptyMessage>No audit activity found for this payment.</EmptyMessage>
            )
          )}
        </div>
      </aside>
    </div>
  );
}
