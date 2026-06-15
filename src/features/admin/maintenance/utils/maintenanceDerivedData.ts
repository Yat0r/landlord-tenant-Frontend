import type {
  AuditLogEntity,
  LeaseEntity,
  MaintenanceRequestEntity,
  PropertyEntity,
  TenantEntity,
} from '@/types/domain/entities';

export type MaintenanceStatusKey = 'all' | 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled' | 'unknown';

export type MaintenanceRecord = MaintenanceRequestEntity & {
  title?: string | null;
  issueType?: string | null;
  category?: string | null;
  notes?: string | null;
  updatedAt?: string | null;
  closedAt?: string | null;
  dueDate?: string | null;
  slaDueAt?: string | null;
  tenantId?: string | null;
  tenantEmail?: string | null;
  tenantPhone?: string | null;
  unitId?: string | null;
  unitNumber?: string | null;
  propertyUnit?: string | null;
  propertyName?: string | null;
  propertyAddress?: string | null;
  assignedManagerId?: string | null;
  assignedManagerName?: string | null;
  assignedAt?: string | null;
  assignedNotes?: string | null;
  attachmentCount?: number | null;
};

export type TenantRecord = TenantEntity & {
  phone?: string | null;
  phoneNumber?: string | null;
};

export type PropertyRecord = PropertyEntity & {
  landlordId?: string | null;
};

export type LeaseRecord = LeaseEntity & {
  monthlyRent?: number | null;
  unitNumber?: string | null;
  unitId?: string | null;
  propertyUnit?: string | null;
  propertyName?: string | null;
  reference?: string | null;
  leaseReference?: string | null;
};

export type AuditRecord = AuditLogEntity;

export type LandlordRecord = {
  id: string;
  name: string;
  email: string;
  keycloakLinked: boolean;
};

export interface MaintenanceRowModel {
  request: MaintenanceRecord;
  tenant?: TenantRecord;
  lease?: LeaseRecord;
  property?: PropertyRecord;
  landlord?: LandlordRecord;
  title: string;
  summary: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  propertyName?: string;
  propertyAddress?: string;
  unitLabel?: string;
  issueType?: string;
  category?: string;
  priority: string;
  status: string;
  ageDays: number | null;
  updatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  assignedName?: string;
  assignmentDate?: string;
  assignmentNotes?: string;
  timeline: AuditRecord[];
  audit: AuditRecord[];
  hasAssignmentSupport: boolean;
  hasNotesSupport: boolean;
  hasCategorySupport: boolean;
  hasAttachmentSupport: boolean;
  overdue: boolean | null;
}

export interface MaintenanceSummary {
  openRequests: number;
  inProgress: number;
  urgentIssues: number;
  resolvedThisMonth: number;
  averageResolutionTime: string | null;
  overdueRequests: number | null;
  overdueSupported: boolean;
}

export interface MaintenanceFilters {
  search: string;
  status: MaintenanceStatusKey;
  priority: 'all' | 'low' | 'medium' | 'high' | 'urgent';
  propertyId: string;
  unit: string;
  tenantId: string;
  dateFrom: string;
  dateTo: string;
}

const moneyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  minimumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat('en-KE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-KE', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function fmt(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? moneyFormatter.format(value) : 'Not available yet';
}

export function fmtDate(value?: string | null) {
  if (!value) return 'Not available yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available yet' : dateFormatter.format(date);
}

export function fmtDateTime(value?: string | null) {
  if (!value) return 'Not available yet';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not available yet' : dateTimeFormatter.format(date);
}

export function normalizeStatus(value?: string | null) {
  return value?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? 'unknown';
}

export function statusLabel(value?: string | null) {
  const normalized = normalizeStatus(value);
  if (normalized === 'unknown') return 'Unknown';
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getMaintenanceStatusColor(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === 'open') return 'border-amber-100 bg-amber-50 text-amber-700';
  if (normalized === 'in_progress') return 'border-blue-100 bg-blue-50 text-blue-700';
  if (normalized === 'resolved') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (normalized === 'closed') return 'border-slate-200 bg-slate-100 text-slate-600';
  if (normalized === 'cancelled') return 'border-rose-100 bg-rose-50 text-rose-700';
  return 'border-slate-200 bg-slate-100 text-slate-600';
}

export function getMaintenancePriorityColor(priority?: string | null) {
  const normalized = priority?.trim().toLowerCase() ?? 'unknown';
  if (normalized === 'urgent') return 'border-rose-100 bg-rose-50 text-rose-700';
  if (normalized === 'high') return 'border-orange-100 bg-orange-50 text-orange-700';
  if (normalized === 'medium') return 'border-amber-100 bg-amber-50 text-amber-700';
  if (normalized === 'low') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  return 'border-slate-200 bg-slate-100 text-slate-600';
}

export function getMaintenanceAge(createdAt?: string | null) {
  if (!createdAt) return null;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return Math.max(0, Math.floor(diff / 86_400_000));
}

function getComparable(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

export function deriveMaintenanceTenant(request: MaintenanceRecord, tenants: TenantRecord[]) {
  return (
    (request.tenantId ? tenants.find((tenant) => tenant.id === request.tenantId) : undefined) ??
    tenants.find((tenant) => request.tenantName && getComparable(tenant.name) === getComparable(request.tenantName))
  );
}

export function deriveMaintenancePropertyUnit(
  request: MaintenanceRecord,
  properties: PropertyRecord[],
  leases: LeaseRecord[],
  tenants: TenantRecord[]
) {
  const tenant = deriveMaintenanceTenant(request, tenants);
  const lease =
    (request.tenantId ? leases.find((item) => item.tenantId === request.tenantId && item.propertyId === request.propertyId) : undefined) ??
    (tenant ? leases.find((item) => item.tenantId === tenant.id) : undefined) ??
    (request.propertyId ? leases.find((item) => item.propertyId === request.propertyId) : undefined);
  const property =
    (request.propertyId ? properties.find((item) => item.id === request.propertyId) : undefined) ??
    (lease ? properties.find((item) => item.id === lease.propertyId) : undefined) ??
    properties.find((item) => request.propertyName && getComparable(item.name) === getComparable(request.propertyName));
  const unitLabel = request.propertyUnit ?? request.unitNumber ?? lease?.propertyUnit ?? lease?.unitNumber ?? undefined;
  return { tenant, property, lease, unitLabel };
}

function normalizePriority(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function parseDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function avgResolutionTime(requests: MaintenanceRowModel[]) {
  const durations = requests
    .map((row) => {
      const end = parseDate(row.resolvedAt ?? row.closedAt ?? row.request.resolvedAt ?? row.request.closedAt ?? null);
      const start = parseDate(row.request.createdAt ?? null);
      if (!start || !end) return null;
      return end.getTime() - start.getTime();
    })
    .filter((value): value is number => value !== null && Number.isFinite(value) && value >= 0);

  if (!durations.length) return null;
  const average = durations.reduce((sum, value) => sum + value, 0) / durations.length;
  const hours = Math.round(average / 3_600_000);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  const remaining = hours % 24;
  return remaining ? `${days}d ${remaining}h` : `${days}d`;
}

export function calculateMaintenanceSummary(rows: MaintenanceRowModel[]): MaintenanceSummary {
  const now = new Date();
  const resolvedThisMonth = rows.filter((row) => {
    const status = normalizeStatus(row.status);
    const resolvedDate = parseDate(row.resolvedAt ?? row.closedAt ?? row.request.resolvedAt ?? row.request.closedAt ?? null);
    if (!resolvedDate) return false;
    return (
      ['resolved', 'closed'].includes(status) &&
      resolvedDate.getFullYear() === now.getFullYear() &&
      resolvedDate.getMonth() === now.getMonth()
    );
  }).length;

  const withResolution = rows.filter((row) => parseDate(row.resolvedAt ?? row.closedAt ?? row.request.resolvedAt ?? row.request.closedAt ?? null));
  const overdueSupported = rows.some((row) => Boolean(row.request.dueDate || row.request.slaDueAt));
  const overdueRequests = overdueSupported
    ? rows.filter((row) => {
        const due = parseDate(row.request.dueDate ?? row.request.slaDueAt ?? null);
        if (!due) return false;
        const status = normalizeStatus(row.status);
        return due.getTime() < now.getTime() && !['resolved', 'closed', 'cancelled'].includes(status);
      }).length
    : null;

  return {
    openRequests: rows.filter((row) => normalizeStatus(row.status) === 'open').length,
    inProgress: rows.filter((row) => normalizeStatus(row.status) === 'in_progress').length,
    urgentIssues: rows.filter((row) => normalizePriority(row.priority) === 'urgent').length,
    resolvedThisMonth,
    averageResolutionTime: avgResolutionTime(withResolution),
    overdueRequests,
    overdueSupported,
  };
}

export function filterMaintenanceRequests(rows: MaintenanceRowModel[], filters: MaintenanceFilters) {
  const term = filters.search.trim().toLowerCase();
  const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const to = filters.dateTo ? new Date(filters.dateTo) : null;

  return rows.filter((row) => {
    if (term) {
      const haystack = [
        row.title,
        row.summary,
        row.tenantName,
        row.tenantEmail,
        row.tenantPhone,
        row.propertyName,
        row.propertyAddress,
        row.unitLabel,
        row.issueType,
        row.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(term)) return false;
    }

    if (filters.status !== 'all' && normalizeStatus(row.status) !== filters.status) return false;
    if (filters.priority !== 'all' && normalizePriority(row.priority) !== filters.priority) return false;
    if (filters.propertyId !== 'all' && row.property?.id !== filters.propertyId) return false;
    if (filters.unit !== 'all' && getComparable(row.unitLabel) !== getComparable(filters.unit)) return false;
    if (filters.tenantId !== 'all' && row.tenant?.id !== filters.tenantId && row.request.tenantId !== filters.tenantId) return false;

    const createdAt = parseDate(row.request.createdAt ?? null);
    if (from && createdAt && createdAt.getTime() < from.getTime()) return false;
    if (to && createdAt && createdAt.getTime() > to.getTime()) return false;

    return true;
  });
}

export function exportMaintenanceCsv(rows: MaintenanceRowModel[]) {
  const headers = ['request title', 'tenant', 'property', 'unit', 'priority', 'status', 'created date', 'updated date', 'assigned to', 'age days'];
  const lines = rows.map((row) =>
    [
      row.title,
      row.tenantName,
      row.propertyName ?? '',
      row.unitLabel ?? '',
      statusLabel(row.priority),
      statusLabel(row.status),
      row.request.createdAt ?? '',
      row.updatedAt ?? row.request.updatedAt ?? '',
      row.assignedName ?? 'Not assigned',
      row.ageDays === null ? 'Not available yet' : String(row.ageDays),
    ]
      .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
      .join(',')
  );

  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([[headers.map((value) => `"${value}"`).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `propease-maintenance-${today}.csv`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export function buildMaintenanceRows({
  requests,
  tenants,
  properties,
  leases,
  landlords,
  audits,
}: {
  requests: MaintenanceRecord[];
  tenants: TenantRecord[];
  properties: PropertyRecord[];
  leases: LeaseRecord[];
  landlords: LandlordRecord[];
  audits: AuditRecord[];
}) {
  return requests.map((request) => {
    const { tenant, property, lease, unitLabel } = deriveMaintenancePropertyUnit(request, properties, leases, tenants);
    const landlord = property?.landlordId ? landlords.find((item) => item.id === property.landlordId) : undefined;
    const timeline = audits
      .filter((event) => event.entityType === 'Maintenance' && event.entityId === request.id)
      .sort((left, right) => new Date(left.timestamp).getTime() - new Date(right.timestamp).getTime());

    return {
      request,
      tenant,
      lease,
      property,
      landlord,
      title: request.title ?? request.issueSummary ?? 'Maintenance request',
      summary: request.description ?? request.issueSummary ?? 'Not available yet',
      tenantName: tenant?.name ?? request.tenantName ?? 'Not available yet',
      tenantEmail: tenant?.email ?? request.tenantEmail ?? undefined,
      tenantPhone: tenant?.phone ?? tenant?.phoneNumber ?? request.tenantPhone ?? undefined,
      propertyName: property?.name ?? request.propertyName ?? 'Not available yet',
      propertyAddress: property?.address ?? request.propertyAddress ?? undefined,
      unitLabel,
      issueType: request.issueType ?? request.category ?? undefined,
      category: request.category ?? request.issueType ?? undefined,
      priority: request.priority ?? 'unknown',
      status: request.status ?? 'unknown',
      ageDays: getMaintenanceAge(request.createdAt ?? null),
      updatedAt: request.updatedAt ?? undefined,
      resolvedAt: request.resolvedAt ?? undefined,
      closedAt: request.closedAt ?? undefined,
      assignedName: request.assignedManagerName ?? undefined,
      assignmentDate: request.assignedAt ?? undefined,
      assignmentNotes: request.assignedNotes ?? undefined,
      timeline,
      audit: timeline,
      hasAssignmentSupport: Boolean(request.assignedManagerId || request.assignedManagerName || request.assignedAt || request.assignedNotes),
      hasNotesSupport: 'notes' in request,
      hasCategorySupport: Boolean(request.issueType || request.category),
      hasAttachmentSupport: Boolean(request.attachmentCount),
      overdue: request.dueDate || request.slaDueAt ? false : null,
    } satisfies MaintenanceRowModel;
  });
}

export function getMaintenanceInitials(value?: string | null) {
  const initials = (value ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'MT';
}

export function getTimelineLabel(action: string) {
  const normalized = action.trim().toLowerCase();
  if (normalized.includes('created')) return 'Request created';
  if (normalized.includes('assign')) return 'Assigned';
  if (normalized.includes('progress')) return 'In progress';
  if (normalized.includes('resolved')) return 'Resolved';
  if (normalized.includes('closed')) return 'Closed';
  if (normalized.includes('priority')) return 'Priority changed';
  if (normalized.includes('status')) return 'Status changed';
  return action;
}

export function formatDurationDays(days?: number | null) {
  if (days === null || days === undefined) return 'Not available yet';
  if (days < 1) return '<1 day';
  if (days === 1) return '1 day';
  return `${days} days`;
}
