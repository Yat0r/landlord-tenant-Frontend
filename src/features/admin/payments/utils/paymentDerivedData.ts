import type {
  AuditLogEntity,
  LeaseEntity,
  PaymentEntity,
  PropertyEntity,
  TenantEntity,
} from '@/types/domain/entities';

export type PaymentStatus = 'all' | 'pending' | 'confirmed' | 'failed' | 'refunded' | 'unknown';

export type PaymentRecord = PaymentEntity & {
  status: string;
  method?: string | null;
  paymentMethod?: string | null;
  transactionReference?: string | null;
  transactionRef?: string | null;
  mpesaReceiptNumber?: string | null;
  reference?: string | null;
  receiptNumber?: string | null;
  receiptId?: string | null;
  receiptStatus?: string | null;
  notes?: string | null;
  updatedAt?: string | null;
  refundedAmount?: number | null;
  refundAmount?: number | null;
  allocatedAmount?: number | null;
  allocationStatus?: string | null;
  propertyId?: string | null;
  propertyName?: string | null;
  unitId?: string | null;
  unitNumber?: string | null;
};

export type TenantRecord = TenantEntity & {
  phone?: string | null;
  phoneNumber?: string | null;
};

export type LeaseRecord = LeaseEntity & {
  status: string;
  unitId?: string | null;
  unitNumber?: string | null;
  unitName?: string | null;
  propertyUnit?: string | null;
  reference?: string | null;
  leaseReference?: string | null;
  rentAmount?: number | null;
};

export type PropertyRecord = PropertyEntity & {
  units?: UnitRecord[];
};

export interface UnitRecord {
  id?: string | null;
  unitNumber?: string | null;
  number?: string | null;
  name?: string | null;
  roomNumber?: string | null;
}

export type AuditRecord = AuditLogEntity;

export interface PaymentRowModel {
  payment: PaymentRecord;
  tenant?: TenantRecord;
  lease?: LeaseRecord;
  property?: PropertyRecord;
  reference: string;
  transactionReference?: string;
  method: string;
  status: string;
  amount: number;
  paymentDate?: string;
  tenantName: string;
  tenantEmail?: string;
  tenantPhone?: string;
  propertyName?: string;
  unitLabel?: string;
  leaseLabel?: string;
  leaseStatus?: string;
  monthlyRent?: number;
  allocationStatus: 'allocated' | 'partial' | 'unallocated' | 'requires_support';
  receiptStatus: 'available' | 'missing' | 'requires_support';
  auditEvents: AuditRecord[];
}

export interface PaymentSummary {
  confirmedTotal: number;
  pendingCount: number;
  pendingAmount: number | null;
  failedCount: number;
  failedAmount: number | null;
  refundedCount: number;
  refundedAmount: number | null;
  confirmationRate: number | null;
  thisMonthCollection: number | null;
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

export function formatKesAmount(value?: number | null) {
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

export function getPaymentStatusColor(status?: string | null) {
  const normalized = normalizeStatus(status);
  if (normalized === 'confirmed') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (normalized === 'pending') return 'border-amber-100 bg-amber-50 text-amber-700';
  if (normalized === 'failed') return 'border-rose-100 bg-rose-50 text-rose-700';
  if (normalized === 'refunded') return 'border-purple-100 bg-purple-50 text-purple-700';
  return 'border-slate-200 bg-slate-100 text-slate-600';
}

export function getPaymentMethodLabel(method?: string | null) {
  const normalized = method?.trim().toLowerCase().replace(/[\s_-]+/g, '') ?? '';
  if (normalized === 'mpesa' || normalized === 'm-pesa') return 'M-Pesa';
  if (normalized === 'banktransfer' || normalized === 'bank') return 'Bank Transfer';
  if (normalized === 'cash') return 'Cash';
  if (!normalized) return 'Not available yet';
  return method ?? 'Other';
}

export function getPaymentMethodIcon(method?: string | null) {
  const normalized = method?.trim().toLowerCase().replace(/[\s_-]+/g, '') ?? '';
  if (normalized === 'mpesa' || normalized === 'm-pesa') return 'MP';
  if (normalized === 'banktransfer' || normalized === 'bank') return 'BT';
  if (normalized === 'cash') return 'CA';
  return 'OT';
}

export function deriveAllocationStatus(payment: PaymentRecord) {
  if (typeof payment.allocatedAmount === 'number' && Number.isFinite(payment.allocatedAmount)) {
    if (payment.allocatedAmount <= 0) return 'unallocated';
    if (payment.allocatedAmount >= payment.amount) return 'allocated';
    return 'partial';
  }

  if (payment.allocationStatus) {
    const normalized = normalizeStatus(payment.allocationStatus);
    if (normalized === 'allocated' || normalized === 'partial' || normalized === 'unallocated') return normalized;
  }

  return 'requires_support';
}

export function deriveReceiptStatus(payment: PaymentRecord) {
  if (payment.receiptNumber || payment.receiptId) return 'available';
  if ('receiptStatus' in payment) return payment.receiptStatus ? 'available' : 'missing';
  return 'requires_support';
}

export function paymentDate(payment: PaymentRecord) {
  return payment.paidDate ?? payment.createdAt ?? payment.chargeDate ?? payment.dueDate;
}

export function paymentReference(payment: PaymentRecord) {
  return payment.reference ?? payment.transactionReference ?? payment.transactionRef ?? payment.mpesaReceiptNumber ?? payment.id;
}

export function transactionReference(payment: PaymentRecord) {
  return payment.transactionReference ?? payment.transactionRef ?? payment.mpesaReceiptNumber ?? payment.reference ?? undefined;
}

function leaseUnit(lease?: LeaseRecord) {
  return lease?.unitNumber ?? lease?.propertyUnit ?? lease?.unitName ?? lease?.unitId ?? undefined;
}

function propertyUnit(payment: PaymentRecord, lease?: LeaseRecord) {
  return payment.unitNumber ?? payment.propertyUnit ?? payment.unitId ?? leaseUnit(lease);
}

function getComparable(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

export function buildPaymentRows({
  payments,
  tenants,
  leases,
  properties,
  auditEvents,
}: {
  payments: PaymentRecord[];
  tenants: TenantRecord[];
  leases: LeaseRecord[];
  properties: PropertyRecord[];
  auditEvents: AuditRecord[];
}) {
  return payments.map((payment) => {
    const lease = payment.leaseId ? leases.find((item) => item.id === payment.leaseId) : undefined;
    const tenant =
      (payment.tenantId ? tenants.find((item) => item.id === payment.tenantId) : undefined) ??
      (lease ? tenants.find((item) => item.id === lease.tenantId) : undefined) ??
      tenants.find((item) => payment.tenantName && getComparable(item.name) === getComparable(payment.tenantName));
    const propertyId = payment.propertyId ?? lease?.propertyId;
    const property = propertyId ? properties.find((item) => item.id === propertyId) : undefined;
    const method = payment.method ?? payment.paymentMethod ?? 'Not available yet';

    return {
      payment,
      tenant,
      lease,
      property,
      reference: paymentReference(payment),
      transactionReference: transactionReference(payment),
      method,
      status: payment.status,
      amount: payment.amount,
      paymentDate: paymentDate(payment),
      tenantName: tenant?.name ?? payment.tenantName ?? 'Not available yet',
      tenantEmail: tenant?.email,
      tenantPhone: tenant?.phone ?? tenant?.phoneNumber ?? undefined,
      propertyName: payment.propertyName ?? property?.name,
      unitLabel: propertyUnit(payment, lease),
      leaseLabel: lease?.reference ?? lease?.leaseReference ?? lease?.id,
      leaseStatus: lease?.status,
      monthlyRent: typeof lease?.monthlyRent === 'number' ? lease.monthlyRent : lease?.rentAmount ?? undefined,
      allocationStatus: deriveAllocationStatus(payment),
      receiptStatus: deriveReceiptStatus(payment),
      auditEvents: auditEvents.filter((event) => event.entityType === 'Payment' && event.entityId === payment.id),
    } satisfies PaymentRowModel;
  });
}

export function calculatePaymentSummary(rows: PaymentRowModel[]) {
  const byStatus = (status: string) => rows.filter((row) => normalizeStatus(row.status) === status);
  const confirmedRows = byStatus('confirmed');
  const pendingRows = byStatus('pending');
  const failedRows = byStatus('failed');
  const refundedRows = byStatus('refunded');
  const numericAmount = (row: PaymentRowModel) => (typeof row.amount === 'number' && Number.isFinite(row.amount) ? row.amount : 0);
  const total = (items: PaymentRowModel[]) => items.reduce((sum, row) => sum + numericAmount(row), 0);
  const finalRows = rows.filter((row) => ['confirmed', 'failed', 'refunded'].includes(normalizeStatus(row.status)));
  const now = new Date();

  return {
    confirmedTotal: total(confirmedRows),
    pendingCount: pendingRows.length,
    pendingAmount: pendingRows.length ? total(pendingRows) : 0,
    failedCount: failedRows.length,
    failedAmount: failedRows.length ? total(failedRows) : 0,
    refundedCount: refundedRows.length,
    refundedAmount: refundedRows.length ? total(refundedRows) : 0,
    confirmationRate: finalRows.length ? confirmedRows.length / finalRows.length : null,
    thisMonthCollection: confirmedRows
      .filter((row) => {
        if (!row.paymentDate) return false;
        const date = new Date(row.paymentDate);
        return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
      })
      .reduce((sum, row) => sum + numericAmount(row), 0),
  } satisfies PaymentSummary;
}

export interface PaymentFilters {
  search: string;
  status: PaymentStatus;
  method: string;
  dateFrom: string;
  dateTo: string;
  propertyId: string;
  tenantId: string;
  minAmount: string;
  maxAmount: string;
}

export function filterPayments(rows: PaymentRowModel[], filters: PaymentFilters) {
  const term = filters.search.trim().toLowerCase();
  const min = filters.minAmount ? Number(filters.minAmount) : undefined;
  const max = filters.maxAmount ? Number(filters.maxAmount) : undefined;
  const from = filters.dateFrom ? new Date(filters.dateFrom) : undefined;
  const to = filters.dateTo ? new Date(filters.dateTo) : undefined;

  return rows.filter((row) => {
    if (term) {
      const haystack = [
        row.tenantName,
        row.tenantEmail,
        row.tenantPhone,
        row.reference,
        row.transactionReference,
        row.leaseLabel,
        row.propertyName,
        row.unitLabel,
      ].filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(term)) return false;
    }
    if (filters.status !== 'all' && normalizeStatus(row.status) !== filters.status) return false;
    if (filters.method !== 'all' && getComparable(getPaymentMethodLabel(row.method)) !== getComparable(filters.method)) return false;
    if (filters.propertyId !== 'all' && row.property?.id !== filters.propertyId) return false;
    if (filters.tenantId !== 'all' && row.tenant?.id !== filters.tenantId && row.payment.tenantId !== filters.tenantId) return false;
    if (from && row.paymentDate && new Date(row.paymentDate) < from) return false;
    if (to && row.paymentDate && new Date(row.paymentDate) > to) return false;
    if (min !== undefined && Number.isFinite(min) && row.amount < min) return false;
    if (max !== undefined && Number.isFinite(max) && row.amount > max) return false;
    return true;
  });
}

export function getInitials(value?: string | null) {
  const initials = (value ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
  return initials || 'PY';
}

export function allocationLabel(status: PaymentRowModel['allocationStatus']) {
  if (status === 'allocated') return 'Allocated';
  if (status === 'partial') return 'Partial';
  if (status === 'unallocated') return 'Unallocated';
  return 'Requires backend support';
}

export function receiptLabel(status: PaymentRowModel['receiptStatus']) {
  if (status === 'available') return 'Available';
  if (status === 'missing') return 'Missing';
  return 'Requires support';
}
