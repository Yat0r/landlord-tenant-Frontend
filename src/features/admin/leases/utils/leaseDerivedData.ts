import type {
  AuditLogEntity,
  LeaseEntity,
  MaintenanceRequestEntity,
  PaymentEntity,
  PropertyEntity,
  TenantEntity,
} from '@/types/domain/entities';

export type LeaseRecord = LeaseEntity & {
  status: string;
  unitId?: string | null;
  unitNumber?: string | null;
  unitName?: string | null;
  propertyUnit?: string | null;
  reference?: string | null;
  leaseReference?: string | null;
  rentAmount?: number | null;
  deposit?: number | null;
  depositAmount?: number | null;
  notes?: string | null;
  updatedAt?: string | null;
};

export type TenantRecord = TenantEntity & {
  phone?: string | null;
  phoneNumber?: string | null;
  keycloakUserId?: string | null;
  createdAt?: string | null;
};

export type PropertyRecord = PropertyEntity & {
  units?: UnitRecord[];
};

export interface UnitRecord {
  id?: string | null;
  propertyId?: string | null;
  unitNumber?: string | null;
  number?: string | null;
  name?: string | null;
  roomNumber?: string | null;
}

export type PaymentRecord = PaymentEntity & {
  method?: string | null;
  paymentMethod?: string | null;
  reference?: string | null;
  balance?: number | null;
  rentBalance?: number | null;
  outstandingBalance?: number | null;
  amountDue?: number | null;
  balanceDue?: number | null;
};

export interface RentChargeRecord {
  id: string;
  leaseId?: string | null;
  billingMonth?: string | null;
  dueDate?: string | null;
  totalAmount?: number | null;
  amount?: number | null;
  paidAmount?: number | null;
  balance?: number | null;
  status?: string | null;
}

export type MaintenanceRecord = MaintenanceRequestEntity & {
  updatedAt?: string | null;
  lastUpdatedAt?: string | null;
  unitId?: string | null;
  unitNumber?: string | null;
};

export type AuditRecord = AuditLogEntity;

export interface LeaseRowModel {
  lease: LeaseRecord;
  tenant?: TenantRecord;
  property?: PropertyRecord;
  unit?: UnitRecord;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  propertyName?: string;
  unitLabel?: string;
  reference: string;
  status: string;
  monthlyRent?: number;
  deposit?: number;
  balance: number | null;
  daysUntilExpiry: number | null;
  payments: PaymentRecord[];
  rentCharges: RentChargeRecord[];
  maintenance: MaintenanceRecord[];
  activity: AuditRecord[];
}

export interface LeaseKpis {
  totalLeases: number;
  active: number;
  expiring30Days: number;
  expired: number;
  pendingRenewal: number;
  terminated: number;
  monthlyRentValue: number | null;
  unitsOccupied: number;
}

const currencyFormatter = new Intl.NumberFormat('en-KE', {
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
  return typeof value === 'number' && Number.isFinite(value) ? currencyFormatter.format(value) : 'N/A';
}

export function fmtDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

export function fmtDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
}

export function normalizeStatus(value?: string | null) {
  return value?.trim().toLowerCase().replace(/[\s-]+/g, '_') ?? '';
}

export function statusLabel(value?: string | null) {
  const status = normalizeStatus(value);
  if (!status) return 'Unknown';
  if (status === 'pendingrenewal' || status === 'pending_renewal' || status === 'pending') return 'Pending Renewal';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getLeaseStatusColor(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === 'active') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (normalized === 'pendingrenewal' || normalized === 'pending_renewal' || normalized === 'pending') {
    return 'border-amber-100 bg-amber-50 text-amber-700';
  }
  if (normalized === 'expired') return 'border-slate-200 bg-slate-100 text-slate-600';
  if (normalized === 'terminated') return 'border-rose-100 bg-rose-50 text-rose-700';
  return 'border-gray-200 bg-gray-100 text-gray-600';
}

export function getDaysUntilExpiry(endDate?: string | null) {
  if (!endDate) return null;
  const date = new Date(endDate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

export function formatLeasePeriod(startDate?: string | null, endDate?: string | null) {
  return `${fmtDate(startDate)} \u2192 ${fmtDate(endDate)}`;
}

function numberFromRecord(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function balanceFromPayment(payment: PaymentRecord) {
  const source = payment as unknown as Record<string, unknown>;
  return (
    numberFromRecord(source, 'balance') ??
    numberFromRecord(source, 'rentBalance') ??
    numberFromRecord(source, 'outstandingBalance') ??
    numberFromRecord(source, 'amountDue') ??
    numberFromRecord(source, 'balanceDue')
  );
}

export function deriveLeaseBalance(payments: PaymentRecord[], rentCharges: RentChargeRecord[]) {
  const chargeBalances = rentCharges
    .map((charge) => charge.balance)
    .filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  if (rentCharges.length > 0 && chargeBalances.length === rentCharges.length) {
    return chargeBalances.reduce((total, value) => total + value, 0);
  }

  const paymentBalance = payments.map(balanceFromPayment).find((value) => value !== undefined);
  return paymentBalance ?? null;
}

export function getLeaseTenant(lease: LeaseRecord, tenants: TenantRecord[]) {
  return tenants.find((tenant) => tenant.id === lease.tenantId);
}

function unitIdentifier(unit?: UnitRecord) {
  return unit?.unitNumber ?? unit?.number ?? unit?.roomNumber ?? unit?.name ?? unit?.id ?? undefined;
}

function leaseUnitIdentifier(lease: LeaseRecord) {
  return lease.unitId ?? lease.unitNumber ?? lease.propertyUnit ?? lease.unitName ?? undefined;
}

export function getLeasePropertyUnit(lease: LeaseRecord, properties: PropertyRecord[], units: UnitRecord[]) {
  const property = properties.find((item) => item.id === lease.propertyId);
  const allUnits = [...units, ...(property?.units ?? [])];
  const leaseUnit = leaseUnitIdentifier(lease);
  const unit = leaseUnit
    ? allUnits.find((item) => item.id === leaseUnit || unitIdentifier(item) === leaseUnit)
    : undefined;

  if (!property && !unit && !leaseUnit) return undefined;
  return { property, unit };
}

export function getInitials(value?: string | null) {
  const initials = (value ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'LS';
}

export function isActiveLease(lease: LeaseRecord) {
  return normalizeStatus(lease.status) === 'active';
}

export function isExpiredStatus(status?: string | null) {
  return normalizeStatus(status) === 'expired';
}

export function isPendingRenewalStatus(status?: string | null) {
  const normalized = normalizeStatus(status);
  return normalized === 'pendingrenewal' || normalized === 'pending_renewal' || normalized === 'pending';
}

export function isMaintenanceRelevantToLease(lease: LeaseRecord, rowUnitLabel: string | undefined, request: MaintenanceRecord) {
  if (request.tenantId && request.tenantId === lease.tenantId) return true;
  if (request.propertyId && request.propertyId !== lease.propertyId) return false;
  const requestUnit = request.unitId ?? request.unitNumber ?? request.propertyUnit;
  return Boolean(rowUnitLabel && requestUnit && requestUnit === rowUnitLabel);
}

export function leaseMonthlyRent(lease: LeaseRecord) {
  return typeof lease.monthlyRent === 'number' ? lease.monthlyRent : lease.rentAmount ?? undefined;
}

export function leaseDeposit(lease: LeaseRecord) {
  return typeof lease.deposit === 'number' ? lease.deposit : lease.depositAmount ?? undefined;
}

export function buildLeaseRows({
  leases,
  tenants,
  properties,
  payments,
  maintenance,
  activity,
  rentCharges = [],
  units = [],
}: {
  leases: LeaseRecord[];
  tenants: TenantRecord[];
  properties: PropertyRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
  activity: AuditRecord[];
  rentCharges?: RentChargeRecord[];
  units?: UnitRecord[];
}): LeaseRowModel[] {
  return leases.map((lease) => {
    const tenant = getLeaseTenant(lease, tenants);
    const propertyUnit = getLeasePropertyUnit(lease, properties, units);
    const leaseUnit = leaseUnitIdentifier(lease);
    const unitLabel = unitIdentifier(propertyUnit?.unit) ?? leaseUnit;
    const leasePayments = payments.filter((payment) => payment.leaseId === lease.id || payment.tenantId === lease.tenantId);
    const leaseRentCharges = rentCharges.filter((charge) => charge.leaseId === lease.id);
    const leaseMaintenance = maintenance.filter((request) => isMaintenanceRelevantToLease(lease, unitLabel, request));
    const leaseActivity = activity.filter((event) => event.entityType === 'Lease' && event.entityId === lease.id);

    return {
      lease,
      tenant,
      property: propertyUnit?.property,
      unit: propertyUnit?.unit,
      tenantName: tenant?.name ?? '—',
      tenantEmail: tenant?.email,
      tenantPhone: tenant?.phone ?? tenant?.phoneNumber ?? undefined,
      propertyName: propertyUnit?.property?.name,
      unitLabel,
      reference: lease.reference ?? lease.leaseReference ?? lease.id,
      status: lease.status,
      monthlyRent: leaseMonthlyRent(lease),
      deposit: leaseDeposit(lease),
      balance: deriveLeaseBalance(leasePayments, leaseRentCharges),
      daysUntilExpiry: getDaysUntilExpiry(lease.endDate),
      payments: leasePayments,
      rentCharges: leaseRentCharges,
      maintenance: leaseMaintenance,
      activity: leaseActivity,
    };
  });
}

export function deriveLeaseKpis(rows: LeaseRowModel[]) {
  const activeRows = rows.filter((row) => isActiveLease(row.lease));
  const allActiveRentNumeric = activeRows.every((row) => typeof row.monthlyRent === 'number' && Number.isFinite(row.monthlyRent));

  return {
    totalLeases: rows.length,
    active: activeRows.length,
    expiring30Days: activeRows.filter((row) => row.daysUntilExpiry !== null && row.daysUntilExpiry >= 0 && row.daysUntilExpiry <= 30).length,
    expired: rows.filter((row) => isExpiredStatus(row.status)).length,
    pendingRenewal: rows.filter((row) => isPendingRenewalStatus(row.status)).length,
    terminated: rows.filter((row) => normalizeStatus(row.status) === 'terminated').length,
    monthlyRentValue: allActiveRentNumeric ? activeRows.reduce((total, row) => total + Number(row.monthlyRent), 0) : null,
    unitsOccupied: activeRows.length,
  } satisfies LeaseKpis;
}

export function rowMatchesSearch(row: LeaseRowModel, search: string) {
  if (!search.trim()) return true;
  const term = search.trim().toLowerCase();
  return [
    row.tenantName,
    row.tenantEmail,
    row.tenantPhone,
    row.propertyName,
    row.unitLabel,
    row.reference,
    row.lease.id,
  ].filter(Boolean).join(' ').toLowerCase().includes(term);
}

export function leaseDuration(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) return '—';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return '—';
  const days = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));
  const months = Math.floor(days / 30);
  const remainingDays = days % 30;
  if (months > 0 && remainingDays > 0) return `${months} mo ${remainingDays} days`;
  if (months > 0) return `${months} mo`;
  return `${days} days`;
}

export function expiryLabel(daysUntilExpiry: number | null, endDate?: string | null) {
  if (daysUntilExpiry === null) return '—';
  if (daysUntilExpiry < 0) return 'Expired';
  if (daysUntilExpiry <= 30) return `${daysUntilExpiry} days left`;
  return fmtDate(endDate);
}

export function detailedExpiryLabel(daysUntilExpiry: number | null) {
  if (daysUntilExpiry === null) return '—';
  if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)} days ago`;
  return `${daysUntilExpiry} days remaining`;
}

export function paymentDate(payment: PaymentRecord) {
  return payment.paidDate ?? payment.createdAt ?? payment.chargeDate ?? payment.dueDate;
}

export function paymentMethod(payment: PaymentRecord) {
  return payment.method ?? payment.paymentMethod ?? payment.reference ?? '—';
}

export function paymentSummary(payments: PaymentRecord[]) {
  const totalByStatus = (status: string) =>
    payments
      .filter((payment) => normalizeStatus(payment.status) === status)
      .reduce((total, payment) => total + (typeof payment.amount === 'number' ? payment.amount : 0), 0);
  const lastPaymentDate = payments
    .map(paymentDate)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return {
    confirmed: totalByStatus('confirmed'),
    pending: totalByStatus('pending'),
    failed: totalByStatus('failed'),
    lastPaymentDate,
  };
}

export function maintenanceTitle(request: MaintenanceRecord) {
  return request.title ?? request.issueSummary ?? request.description ?? 'Maintenance request';
}
