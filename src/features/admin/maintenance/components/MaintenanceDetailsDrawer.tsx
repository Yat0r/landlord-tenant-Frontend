import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { ROUTES } from '@/constants/routes/routes';
import {
  fmt,
  fmtDate,
  fmtDateTime,
  getMaintenanceAge,
  getMaintenancePriorityColor,
  getMaintenanceStatusColor,
  getTimelineLabel,
  statusLabel,
  type MaintenanceRowModel,
} from '../utils/maintenanceDerivedData';

type DrawerTab = 'overview' | 'tenantLease' | 'propertyUnit' | 'timeline' | 'assignment' | 'activity';

const tabs: Array<{ id: DrawerTab; label: string }> = [
  { id: 'overview', label: 'Overview' },
  { id: 'tenantLease', label: 'Tenant & Lease' },
  { id: 'propertyUnit', label: 'Property / Unit' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'assignment', label: 'Assignment' },
  { id: 'activity', label: 'Audit / Activity' },
];

function Badge({ status, label, colorClass }: { status?: string | null; label?: string; colorClass: string }) {
  return (
    <span className={clsx('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold', colorClass)}>
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
    <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function EmptyMessage({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm font-medium text-slate-500">
      {children}
    </div>
  );
}

export function MaintenanceDetailsDrawer({
  row,
  onClose,
}: {
  row: MaintenanceRowModel | null;
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

  const age = getMaintenanceAge(row.request.createdAt ?? null);
  const resolvedDate = row.resolvedAt ?? row.request.resolvedAt ?? null;
  const closedDate = row.closedAt ?? row.request.closedAt ?? null;
  const timeline = row.timeline.length > 0 ? row.timeline : row.audit;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close maintenance details"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-sm"
        onClick={onClose}
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col bg-[#F9FAFB] shadow-2xl">
        <div className="border-b border-slate-100 bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <Badge status={row.status} colorClass={getMaintenanceStatusColor(row.status)} />
              <h2 className="mt-2 truncate text-lg font-semibold text-[#1E293B]">{row.title}</h2>
              <p className="mt-1 truncate text-sm text-[#64748B]">
                {row.propertyName ?? 'Not available yet'} · {row.unitLabel ?? 'Not available yet'}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
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
                  activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {activeTab === 'overview' && (
            <Section title="Request Overview">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Request Title" value={row.title} />
                <Info label="Description" value={row.summary} />
                <Info label="Status" value={<Badge status={row.status} colorClass={getMaintenanceStatusColor(row.status)} />} />
                <Info label="Priority" value={<Badge status={row.priority} colorClass={getMaintenancePriorityColor(row.priority)} />} />
                <Info label="Category / Type" value={row.category ?? row.issueType ?? 'Not available yet'} />
                <Info label="Created Date" value={fmtDateTime(row.request.createdAt)} />
                <Info label="Updated Date" value={fmtDateTime(row.updatedAt ?? row.request.updatedAt)} />
                <Info label="Resolved Date" value={resolvedDate ? fmtDateTime(resolvedDate) : 'Not available yet'} />
                <Info label="Closed Date" value={closedDate ? fmtDateTime(closedDate) : 'Not available yet'} />
                <Info label="Notes" value={row.hasNotesSupport ? (row.request.notes ?? 'Not available yet') : 'Not available yet'} />
                <Info label="Attachments" value={row.hasAttachmentSupport ? `${row.request.attachmentCount ?? 0}` : 'Attachments require backend support.'} />
                <Info label="Age" value={age === null ? 'Not available yet' : `${age} day${age === 1 ? '' : 's'}`} />
              </dl>
            </Section>
          )}

          {activeTab === 'tenantLease' && (
            row.tenant ? (
              <Section title="Tenant & Lease">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info label="Tenant Name" value={row.tenantName} />
                  <Info label="Email" value={row.tenantEmail ?? 'Not available yet'} />
                  <Info label="Phone" value={row.tenantPhone ?? 'Not available yet'} />
                  <Info label="Lease Status" value={row.lease ? <Badge status={row.lease.status} colorClass={getMaintenanceStatusColor(row.lease.status)} /> : 'Not available yet'} />
                  <Info label="Lease Period" value={row.lease ? `${fmtDate(row.lease.startDate)} to ${fmtDate(row.lease.endDate)}` : 'Not available yet'} />
                  <Info label="Monthly Rent" value={row.lease?.monthlyRent ? fmt(row.lease.monthlyRent) : 'Not available yet'} />
                </dl>
                <Link
                  to={`${ROUTES.ADMIN_TENANTS}?tenantId=${encodeURIComponent(row.tenant.id)}`}
                  className="mt-4 inline-flex text-sm font-semibold text-brand-primary hover:underline"
                >
                  Open tenant details
                </Link>
              </Section>
            ) : (
              <EmptyMessage>Tenant details not available.</EmptyMessage>
            )
          )}

          {activeTab === 'propertyUnit' && (
            <Section title="Property / Unit">
              <dl className="grid gap-4 sm:grid-cols-2">
                <Info label="Property Name" value={row.propertyName ?? 'Not available yet'} />
                <Info label="Property Address" value={row.propertyAddress ?? 'Not available yet'} />
                <Info label="Unit Number" value={row.unitLabel ?? 'Not available yet'} />
                <Info label="Landlord" value={row.landlord?.name ?? 'Not available yet'} />
                <Info label="Property Manager" value="Not available yet" />
                <Info label="Occupancy Status" value={row.lease ? <Badge status={row.lease.status} colorClass={getMaintenanceStatusColor(row.lease.status)} /> : 'Not available yet'} />
              </dl>
            </Section>
          )}

          {activeTab === 'timeline' && (
            timeline.length > 0 ? (
              <Section title="Timeline">
                <div className="space-y-3">
                  {timeline.map((event) => (
                    <div key={event.id} className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500" />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900">{getTimelineLabel(event.action)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {fmtDateTime(event.timestamp)} · {event.userEmail}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            ) : (
              <EmptyMessage>Timeline requires backend support.</EmptyMessage>
            )
          )}

          {activeTab === 'assignment' && (
            row.hasAssignmentSupport ? (
              <Section title="Assignment">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Info label="Assigned Manager / Caretaker" value={row.assignedName ?? 'Not available yet'} />
                  <Info label="Assigned Date" value={row.assignmentDate ? fmtDateTime(row.assignmentDate) : 'Not available yet'} />
                  <Info label="Assignment Notes" value={row.assignmentNotes ?? 'Not available yet'} />
                </dl>
              </Section>
            ) : (
              <EmptyMessage>Manager assignment requires backend support.</EmptyMessage>
            )
          )}

          {activeTab === 'activity' && (
            row.audit.length > 0 ? (
              <Section title="Audit / Activity">
                <div className="space-y-3">
                  {row.audit.map((event) => (
                    <div key={event.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <p className="font-semibold text-slate-900">{event.action}</p>
                      <p className="mt-1 text-xs text-slate-500">{fmtDateTime(event.timestamp)} · {event.userEmail}</p>
                    </div>
                  ))}
                </div>
              </Section>
            ) : (
              <EmptyMessage>Audit activity requires backend support.</EmptyMessage>
            )
          )}
        </div>
      </aside>
    </div>
  );
}
