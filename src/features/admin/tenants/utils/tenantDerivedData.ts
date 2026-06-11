import type {
  LeaseEntity,
  MaintenanceRequestEntity,
  PaymentEntity,
  PropertyEntity,
  TenantEntity,
} from '@/types/domain/entities';

export type TenantRecord = TenantEntity & {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  phoneNumber?: string | null;
  nationalId?: string | null;
  idNumber?: string | null;
  passportNumber?: string | null;
  keycloakUserId?: string | null;
  keycloakLinked?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
  notes?: string | null;
  propertyId?: string | null;
};

export type PropertyRecord = PropertyEntity & {
  unitNumber?: string | null;
};

export type LeaseRecord = LeaseEntity & {
  propertyName?: string | null;
  unitId?: string | null;
  unitNumber?: string | null;
  unitName?: string | null;
  propertyUnit?: string | null;
  reference?: string | null;
  leaseReference?: string | null;
  rentAmount?: number | null;
  deposit?: number | null;
  depositAmount?: number | null;
  balance?: number | null;
  rentBalance?: number | null;
  outstandingBalance?: number | null;
  amountDue?: number | null;
  balanceDue?: number | null;
  arrears?: number | null;
  outstandingAmount?: number | null;
};

export type PaymentRecord = PaymentEntity & {
  propertyId?: string | null;
  propertyName?: string | null;
  unitId?: string | null;
  unitNumber?: string | null;
  paymentMethod?: string | null;
  method?: string | null;
  reference?: string | null;
  balance?: number | null;
  rentBalance?: number | null;
  outstandingBalance?: number | null;
  amountDue?: number | null;
  balanceDue?: number | null;
  arrears?: number | null;
  outstandingAmount?: number | null;
};

export type MaintenanceRecord = MaintenanceRequestEntity & {
  updatedAt?: string | null;
  lastUpdatedAt?: string | null;
};

export interface TenantRowModel {
  tenant: TenantRecord;
  fullName: string;
  email: string;
  phone?: string;
  idNumber?: string;
  keycloakUserId?: string;
  isLinked: boolean;
  createdAt?: string;
  lease?: LeaseRecord;
  leaseStatus: string;
  propertyName?: string;
  unit?: string;
  monthlyRent?: number;
  deposit?: number;
  balance?: number;
  balanceDerivable: boolean;
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
  openMaintenanceCount: number;
}

export interface TenantKpis {
  totalTenants: number;
  linkedToKeycloak: number;
  unlinked: number;
  activeLeases: number;
  tenantsWithBalance: number | null;
  openMaintenance: number;
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
  const normalized = normalizeStatus(value);
  if (!normalized) return 'None';
  if (normalized === 'pending_renewal' || normalized === 'pending') return 'Pending Renewal';
  return normalized.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getTenantName(tenant: TenantRecord) {
  const firstLast = [tenant.firstName, tenant.lastName].filter(Boolean).join(' ').trim();
  return firstLast || tenant.name || '—';
}

export function getTenantPhone(tenant: TenantRecord) {
  return tenant.phone ?? tenant.phoneNumber ?? undefined;
}

export function getTenantIdNumber(tenant: TenantRecord) {
  return tenant.nationalId ?? tenant.idNumber ?? tenant.passportNumber ?? undefined;
}

export function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'TN';
}

export function isTenantLinked(tenant: TenantRecord) {
  if ('keycloakUserId' in tenant) return Boolean(tenant.keycloakUserId);
  return tenant.keycloakLinked === true;
}

export function isLeaseActive(lease?: LeaseRecord) {
  return normalizeStatus(lease?.status) === 'active';
}

export function isMaintenanceOpen(request: MaintenanceRecord) {
  const status = normalizeStatus(request.status);
  return status === 'open' || status === 'pending' || status === 'in_progress';
}

function getComparableName(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function numericValue(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function numberFromRecord(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function balanceFromRecord(record?: object) {
  if (!record) return undefined;
  const source = record as Record<string, unknown>;
  return (
    numberFromRecord(source, 'balance') ??
    numberFromRecord(source, 'rentBalance') ??
    numberFromRecord(source, 'outstandingBalance') ??
    numberFromRecord(source, 'amountDue') ??
    numberFromRecord(source, 'balanceDue') ??
    numberFromRecord(source, 'arrears') ??
    numberFromRecord(source, 'outstandingAmount')
  );
}

function hasBalanceField(record: object) {
  return [
    'balance',
    'rentBalance',
    'outstandingBalance',
    'amountDue',
    'balanceDue',
    'arrears',
    'outstandingAmount',
  ].some((key) => key in record);
}

function chooseLease(leases: LeaseRecord[]) {
  return [...leases].sort((left, right) => {
    if (isLeaseActive(left) && !isLeaseActive(right)) return -1;
    if (!isLeaseActive(left) && isLeaseActive(right)) return 1;
    return new Date(right.endDate).getTime() - new Date(left.endDate).getTime();
  })[0];
}

function leaseUnit(lease?: LeaseRecord) {
  return lease?.unitNumber ?? lease?.propertyUnit ?? lease?.unitName ?? lease?.unitId ?? undefined;
}

function leaseMonthlyRent(lease?: LeaseRecord) {
  return numericValue(lease?.monthlyRent) ?? numericValue(lease?.rentAmount);
}

function leaseDeposit(lease?: LeaseRecord) {
  return numericValue(lease?.deposit) ?? numericValue(lease?.depositAmount);
}

export function buildTenantRows({
  tenants,
  properties,
  leases,
  payments,
  maintenance,
}: {
  tenants: TenantRecord[];
  properties: PropertyRecord[];
  leases: LeaseRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
}): TenantRowModel[] {
  const propertyById = new Map(properties.map((property) => [property.id, property]));
  const tenantById = new Set(tenants.map((tenant) => tenant.id));

  return tenants.map((tenant) => {
    const fullName = getTenantName(tenant);
    const comparableName = getComparableName(fullName);
    const tenantLeases = leases.filter((lease) => lease.tenantId === tenant.id);
    const leaseIds = new Set(tenantLeases.map((lease) => lease.id));
    const lease = chooseLease(tenantLeases);
    const tenantPayments = payments.filter((payment) => {
      if (payment.tenantId && payment.tenantId === tenant.id) return true;
      if (payment.leaseId && leaseIds.has(payment.leaseId)) return true;
      return Boolean(payment.tenantName && getComparableName(payment.tenantName) === comparableName);
    });
    const tenantMaintenance = maintenance.filter((request) => {
      if (request.tenantId && request.tenantId === tenant.id) return true;
      return Boolean(request.tenantName && getComparableName(request.tenantName) === comparableName);
    });
    const property = lease?.propertyId ? propertyById.get(lease.propertyId) : undefined;
    const balance =
      balanceFromRecord(tenant) ??
      balanceFromRecord(lease) ??
      tenantPayments.map(balanceFromRecord).find((value) => value !== undefined);
    const balanceDerivable =
      hasBalanceField(tenant) ||
      Boolean(lease && hasBalanceField(lease)) ||
      tenantPayments.some(hasBalanceField);

    return {
      tenant,
      fullName,
      email: tenant.email,
      phone: getTenantPhone(tenant),
      idNumber: getTenantIdNumber(tenant),
      keycloakUserId: tenant.keycloakUserId ?? undefined,
      isLinked: isTenantLinked(tenant),
      createdAt: tenant.createdAt ?? undefined,
      lease,
      leaseStatus: lease ? statusLabel(lease.status) : 'None',
      propertyName: lease?.propertyName ?? property?.name,
      unit: leaseUnit(lease),
      monthlyRent: leaseMonthlyRent(lease),
      deposit: leaseDeposit(lease),
      balance,
      balanceDerivable,
      payments: tenantPayments,
      maintenance: tenantMaintenance,
      openMaintenanceCount: tenantMaintenance.filter(isMaintenanceOpen).length,
    };
  }).filter((row) => tenantById.has(row.tenant.id));
}

export function deriveTenantKpis(rows: TenantRowModel[], leases: LeaseRecord[], maintenance: MaintenanceRecord[]) {
  const tenantIds = new Set(rows.map((row) => row.tenant.id));
  const balanceIsSafelyDerivable = rows.length > 0 && rows.every((row) => row.balanceDerivable);

  return {
    totalTenants: rows.length,
    linkedToKeycloak: rows.filter((row) => row.isLinked).length,
    unlinked: rows.filter((row) => !row.isLinked).length,
    activeLeases: leases.filter((lease) => tenantIds.has(lease.tenantId) && isLeaseActive(lease)).length,
    tenantsWithBalance: balanceIsSafelyDerivable
      ? rows.filter((row) => typeof row.balance === 'number' && row.balance > 0).length
      : null,
    openMaintenance: maintenance.filter((request) => {
      if (request.tenantId && tenantIds.has(request.tenantId)) return isMaintenanceOpen(request);
      return false;
    }).length,
  } satisfies TenantKpis;
}

export function rowMatchesSearch(row: TenantRowModel, search: string) {
  if (!search.trim()) return true;
  const term = search.trim().toLowerCase();
  return [
    row.fullName,
    row.email,
    row.phone,
    row.idNumber,
    row.propertyName,
    row.unit,
  ].filter(Boolean).join(' ').toLowerCase().includes(term);
}

export function paymentSummary(payments: PaymentRecord[]) {
  const totalByStatus = (status: string) =>
    payments
      .filter((payment) => normalizeStatus(payment.status) === status)
      .reduce((total, payment) => total + (numericValue(payment.amount) ?? 0), 0);
  const lastPaymentDate = payments
    .map((payment) => payment.paidDate ?? payment.createdAt ?? payment.chargeDate ?? payment.dueDate)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

  return {
    confirmed: totalByStatus('confirmed'),
    pending: totalByStatus('pending'),
    failed: totalByStatus('failed'),
    lastPaymentDate,
  };
}
