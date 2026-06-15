import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  DoorOpen,
  Download,
  Eye,
  FileText,
  FilterX,
  Home,
  HousePlus,
  MapPin,
  MoreVertical,
  RefreshCw,
  Search,
  User,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { handleApiError } from '@/api/helpers/apiHelpers';
import { formatCurrency, formatDate } from '@/utils/formatting/formatters';
import {
  useAdminLandlords,
  useAdminLeases,
  useAdminMaintenanceRequests,
  useAdminPayments,
  useAdminProperties,
  useAdminTenants,
  useAdminUnits,
  useCreateProperty,
} from '@/features/admin/properties/hooks/useAdminProperties';
import type {
  LeaseEntity,
  MaintenanceRequestEntity,
  PaymentEntity,
  PropertyEntity,
  TenantEntity,
  UnitEntity,
} from '@/types/domain/entities';

type PropertyFilter = 'all' | 'available' | 'occupied' | 'maintenance' | 'inactive';
type PropertyTypeFilter = 'all' | 'apartment' | 'house' | 'commercial' | 'mixed';
type QuickFilter = 'all' | 'occupied' | 'vacant' | 'maintenance' | 'arrears';
type PropertyCardTab = 'all' | 'occupied' | 'vacant' | 'maintenance' | 'arrears';
type DetailsTab = 'overview' | 'units' | 'tenants' | 'leases' | 'payments' | 'maintenance' | 'reports';
type UnitSource = 'property' | 'units-api' | 'lease' | 'payment' | 'maintenance';

type ExtendedProperty = PropertyEntity & {
  propertyType?: string | null;
  type?: string | null;
  status?: string | null;
  units?: ApiUnit[];
};

type ApiUnit = Omit<UnitEntity, 'id' | 'propertyId' | 'unitNumber'> & {
  id?: string | null;
  propertyId?: string | null;
  unitNumber?: string | null;
  number?: string | null;
  name?: string | null;
  roomNumber?: string | null;
  unitType?: string | null;
  type?: string | null;
  status?: string | null;
  monthlyRent?: number | null;
  depositAmount?: number | null;
  tenantId?: string | null;
  currentTenantId?: string | null;
};

type TenantRecord = TenantEntity & {
  phone?: string | null;
  phoneNumber?: string | null;
  nationalId?: string | null;
  idNumber?: string | null;
  passportNumber?: string | null;
  keycloakUserId?: string | null;
  createdAt?: string | null;
};

type LeaseRecord = LeaseEntity & {
  unitId?: string | null;
  unitNumber?: string | null;
  unitName?: string | null;
  propertyUnit?: string | null;
  tenantName?: string | null;
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
};

type PaymentRecord = PaymentEntity & {
  propertyId?: string | null;
  unitId?: string | null;
  unitNumber?: string | null;
  balance?: number | null;
  rentBalance?: number | null;
  outstandingBalance?: number | null;
  amountDue?: number | null;
  balanceDue?: number | null;
  reference?: string | null;
  method?: string | null;
  paymentMethod?: string | null;
};

type MaintenanceRecord = MaintenanceRequestEntity & {
  unitId?: string | null;
  unitNumber?: string | null;
  updatedAt?: string | null;
  lastUpdatedAt?: string | null;
};

interface UnitRow {
  id: string;
  unitNumber: string;
  unitType?: string | null;
  status?: string | null;
  monthlyRent?: number | null;
  currentTenant?: TenantRecord;
  currentLease?: LeaseRecord;
  leases: LeaseRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
  source: UnitSource;
}

interface PropertyModel {
  property: ExtendedProperty;
  units: UnitRow[];
  leases: LeaseRecord[];
  tenants: TenantRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
  landlordName?: string;
  availableUnits?: number;
  unitsApiSupported: boolean;
}

interface PropertyForm {
  name: string;
  address: string;
  totalUnits: string;
  monthlyRent: string;
  landlordId: string;
  photoUrl: string;
}
const propertyFilters: Array<{ label: string; value: PropertyFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Available', value: 'available' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Inactive', value: 'inactive' },
];

const propertyTypeFilters: Array<{ label: string; value: PropertyTypeFilter }> = [
  { label: 'All', value: 'all' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Commercial', value: 'commercial' },
  { label: 'Mixed', value: 'mixed' },
];

const quickFilters: Array<{ label: string; value: QuickFilter; requiresArrears?: boolean }> = [
  { label: 'All Properties', value: 'all' },
  { label: 'Occupied Units', value: 'occupied' },
  { label: 'Vacant Units', value: 'vacant' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Arrears', value: 'arrears', requiresArrears: true },
];

const cardTabs: Array<{ label: string; value: PropertyCardTab }> = [
  { label: 'All Units', value: 'all' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Vacant', value: 'vacant' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Arrears', value: 'arrears' },
];

const detailsTabs: Array<{ label: string; value: DetailsTab }> = [
  { label: 'Overview', value: 'overview' },
  { label: 'Units', value: 'units' },
  { label: 'Tenants', value: 'tenants' },
  { label: 'Leases', value: 'leases' },
  { label: 'Payments', value: 'payments' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Reports', value: 'reports' },
];

const emptyForm: PropertyForm = {
  name: '',
  address: '',
  totalUnits: '',
  monthlyRent: '',
  landlordId: '',
  photoUrl: '',
};

function normalizeStatus(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, '_') ?? '';
}

function statusText(value?: string | null) {
  if (!value) return '—';
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizePropertyType(value?: string | null) {
  const normalized = value?.toLowerCase().replace(/[_-]/g, ' ').trim() ?? '';
  if (!normalized) return 'unknown';
  if (normalized.includes('apartment') || normalized.includes('flat')) return 'apartment';
  if (normalized.includes('house') || normalized.includes('villa')) return 'house';
  if (normalized.includes('commercial') || normalized.includes('shop') || normalized.includes('office') || normalized.includes('retail')) return 'commercial';
  if (normalized.includes('mixed')) return 'mixed';
  return 'unknown';
}

function propertyTypeLabel(value?: string | null) {
  const normalized = normalizePropertyType(value);
  if (normalized === 'apartment') return 'Apartment';
  if (normalized === 'house') return 'House';
  if (normalized === 'commercial') return 'Commercial';
  if (normalized === 'mixed') return 'Mixed';
  return value || '—';
}

function normalizeUnitType(value?: string | null) {
  const normalized = value?.toLowerCase().replace(/[_-]/g, ' ').trim() ?? '';
  if (!normalized) return 'unknown';
  if (normalized.includes('bedsitter') || normalized.includes('bed sitter')) return 'Bedsitter';
  if (normalized.includes('single')) return 'Single Room';
  if (normalized.includes('one') || normalized.includes('1 bedroom') || normalized.includes('1 bed')) return '1 Bedroom';
  if (normalized.includes('two') || normalized.includes('2 bedroom') || normalized.includes('2 bed')) return '2 Bedroom';
  if (normalized.includes('shop')) return 'Shop';
  if (normalized.includes('office')) return 'Office';
  if (normalized.includes('commercial')) return 'Commercial';
  return value;
}

function unitTypeLabel(value?: string | null) {
  return normalizeUnitType(value) ?? '—';
}

function moneyValue(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
}

function initials(value?: string | null, fallback = 'LT') {
  const source = value?.trim() || fallback;
  const parts = source.split(/\s+/).filter(Boolean);
  const valueFromParts = parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
  return valueFromParts || fallback.slice(0, 2).toUpperCase();
}

function tenantContact(tenant?: TenantRecord) {
  return tenant?.email || tenant?.phone || tenant?.phoneNumber || '—';
}

function unitNumberFromUnit(unit: ApiUnit) {
  return unit.unitNumber ?? unit.number ?? unit.roomNumber ?? unit.name ?? undefined;
}

function unitKeyFromUnit(unit: ApiUnit) {
  return unit.id ?? unitNumberFromUnit(unit);
}

function unitKeyFromLease(lease: LeaseRecord) {
  return lease.unitId ?? lease.unitNumber ?? lease.propertyUnit ?? lease.unitName ?? undefined;
}

function unitKeyFromPayment(payment: PaymentRecord) {
  return payment.unitId ?? payment.unitNumber ?? payment.propertyUnit ?? undefined;
}

function unitKeyFromMaintenance(request: MaintenanceRecord) {
  return request.unitId ?? request.unitNumber ?? request.propertyUnit ?? undefined;
}

function isLeaseActive(lease?: LeaseRecord) {
  return normalizeStatus(lease?.status) === 'active';
}

function isMaintenanceOpen(request: MaintenanceRecord) {
  const status = normalizeStatus(request.status);
  return status === 'open' || status === 'in_progress';
}

function getBalance(payments: PaymentRecord[], lease?: LeaseRecord) {
  const leaseBalance = moneyValue(lease?.balance) ?? moneyValue(lease?.rentBalance) ?? moneyValue(lease?.outstandingBalance) ?? moneyValue(lease?.amountDue) ?? moneyValue(lease?.balanceDue);
  if (leaseBalance !== undefined) return leaseBalance;
  const paymentWithBalance = payments.find((payment) => moneyValue(payment.balance) !== undefined || moneyValue(payment.rentBalance) !== undefined || moneyValue(payment.outstandingBalance) !== undefined || moneyValue(payment.amountDue) !== undefined || moneyValue(payment.balanceDue) !== undefined);
  return moneyValue(paymentWithBalance?.balance) ?? moneyValue(paymentWithBalance?.rentBalance) ?? moneyValue(paymentWithBalance?.outstandingBalance) ?? moneyValue(paymentWithBalance?.amountDue) ?? moneyValue(paymentWithBalance?.balanceDue);
}

function getCurrentLease(leases: LeaseRecord[]) {
  return leases.find(isLeaseActive) ?? leases[0];
}
function deriveUnitStatus(unit: UnitRow) {
  const normalized = normalizeStatus(unit.status);
  if (normalized === 'maintenance' || unit.maintenance.some(isMaintenanceOpen)) return 'maintenance';
  if (unit.currentLease && isLeaseActive(unit.currentLease)) return 'occupied';
  if (normalized === 'available' || normalized === 'vacant') return normalized === 'available' ? 'available' : 'vacant';
  if (unit.currentTenant) return 'occupied';
  return unit.status ?? '—';
}

function isUnitOccupied(unit: UnitRow) {
  const normalized = normalizeStatus(unit.status);
  return normalized === 'occupied' || Boolean(unit.currentTenant) || Boolean(unit.currentLease && isLeaseActive(unit.currentLease));
}

function isUnitVacant(unit: UnitRow) {
  const normalized = normalizeStatus(unit.status);
  return normalized === 'available' || normalized === 'vacant' || (!unit.currentTenant && !unit.currentLease && !unit.maintenance.some(isMaintenanceOpen));
}

function isUnitMaintenance(unit: UnitRow) {
  const normalized = normalizeStatus(unit.status);
  return normalized === 'maintenance' || unit.maintenance.some(isMaintenanceOpen);
}

function unitArrears(unit: UnitRow) {
  return getBalance(unit.payments, unit.currentLease);
}

function hasArrearsData(model: PropertyModel) {
  return model.units.some((unit) => unitArrears(unit) !== undefined);
}

function hasUnitRowsSupport(model: PropertyModel) {
  return model.unitsApiSupported || model.units.length > 0 || model.leases.some((lease) => Boolean(unitKeyFromLease(lease)));
}

function derivePropertyStatus(model: PropertyModel) {
  const normalized = normalizeStatus(model.property.status);
  if (normalized) return model.property.status;
  if (typeof model.property.occupiedUnits === 'number' && model.property.occupiedUnits > 0) return 'occupied';
  if (typeof model.property.totalUnits === 'number' && model.property.totalUnits > 0 && typeof model.property.occupiedUnits === 'number' && model.property.occupiedUnits === 0) return 'available';
  if (model.units.some(isUnitOccupied)) return 'occupied';
  if (model.units.some(isUnitVacant)) return 'available';
  if (typeof model.property.totalUnits === 'number' && model.property.totalUnits === 0) return 'inactive';
  return 'inactive';
}

function statusBadgeVariant(status?: string | null, fallback: BadgeVariant = 'neutral') {
  const normalized = normalizeStatus(status);
  if (normalized === 'active' || normalized === 'occupied' || normalized === 'confirmed') return 'success';
  if (normalized === 'available' || normalized === 'open' || normalized === 'in_progress') return 'warning';
  if (normalized === 'inactive' || normalized === 'terminated' || normalized === 'expired' || normalized === 'failed') return 'danger';
  return fallback;
}

function mergeUnitRows(existing: UnitRow, incoming: Partial<UnitRow>): UnitRow {
  return {
    ...existing,
    unitType: existing.unitType ?? incoming.unitType,
    status: existing.status ?? incoming.status,
    monthlyRent: existing.monthlyRent ?? incoming.monthlyRent,
    currentTenant: existing.currentTenant ?? incoming.currentTenant,
    currentLease: existing.currentLease ?? incoming.currentLease,
    leases: existing.leases.length > 0 ? existing.leases : incoming.leases ?? [],
    payments: existing.payments.length > 0 ? existing.payments : incoming.payments ?? [],
    maintenance: existing.maintenance.length > 0 ? existing.maintenance : incoming.maintenance ?? [],
    source: existing.source,
  };
}

function finalizeUnitRow(unit: UnitRow, tenantById: Map<string, TenantRecord>): UnitRow {
  const currentLease = getCurrentLease(unit.leases);
  const currentTenant = unit.currentTenant ?? (currentLease ? tenantById.get(currentLease.tenantId) : undefined);
  return {
    ...unit,
    currentLease,
    currentTenant,
    status: deriveUnitStatus({ ...unit, currentLease, currentTenant }),
    monthlyRent: unit.monthlyRent ?? currentLease?.monthlyRent,
  };
}
function buildPropertyModels({
  properties,
  units,
  tenants,
  leases,
  payments,
  maintenance,
  landlords,
  unitsApiSupported,
}: {
  properties: ExtendedProperty[];
  units: ApiUnit[];
  tenants: TenantRecord[];
  leases: LeaseRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
  landlords: Array<{ id: string; name: string }>;
  unitsApiSupported: boolean;
}): PropertyModel[] {
  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
  const landlordById = new Map(landlords.map((landlord) => [landlord.id, landlord.name]));
  const paymentsByLeaseId = new Map<string, PaymentRecord[]>();

  payments.forEach((payment) => {
    if (!payment.leaseId) return;
    const current = paymentsByLeaseId.get(payment.leaseId) ?? [];
    current.push(payment);
    paymentsByLeaseId.set(payment.leaseId, current);
  });

  return properties.map((property) => {
    const propertyLeases = leases.filter((lease) => lease.propertyId === property.id);
    const leaseIds = new Set(propertyLeases.map((lease) => lease.id));
    const propertyPayments = payments.filter((payment) => (payment.leaseId ? leaseIds.has(payment.leaseId) : payment.propertyId === property.id));
    const propertyMaintenance = maintenance.filter((request) => request.propertyId === property.id || request.propertyName === property.name);
    const tenantIds = new Set<string>();

    propertyLeases.forEach((lease) => {
      if (lease.tenantId) tenantIds.add(lease.tenantId);
    });
    propertyPayments.forEach((payment) => {
      if (payment.tenantId) tenantIds.add(payment.tenantId);
    });
    propertyMaintenance.forEach((request) => {
      if (request.tenantId) tenantIds.add(request.tenantId);
    });

    const propertyTenants = Array.from(tenantIds)
      .map((tenantId) => tenantById.get(tenantId))
      .filter((tenant): tenant is TenantRecord => Boolean(tenant));
    const unitMap = new Map<string, UnitRow>();

    property.units?.forEach((unit) => {
      const unitNumber = unitNumberFromUnit(unit);
      const id = unitKeyFromUnit(unit);
      if (!id || !unitNumber) return;
      unitMap.set(id, {
        id,
        unitNumber,
        unitType: unit.unitType ?? unit.type,
        status: unit.status,
        monthlyRent: unit.monthlyRent,
        currentTenant: unit.currentTenantId || unit.tenantId ? tenantById.get(unit.currentTenantId ?? unit.tenantId ?? '') : undefined,
        leases: [],
        payments: [],
        maintenance: [],
        source: 'property',
      });
    });

    units.filter((unit) => unit.propertyId === property.id).forEach((unit) => {
      const unitNumber = unitNumberFromUnit(unit);
      const id = unitKeyFromUnit(unit);
      if (!id || !unitNumber) return;
      const next: UnitRow = {
        id,
        unitNumber,
        unitType: unit.unitType ?? unit.type,
        status: unit.status,
        monthlyRent: unit.monthlyRent,
        currentTenant: unit.currentTenantId || unit.tenantId ? tenantById.get(unit.currentTenantId ?? unit.tenantId ?? '') : undefined,
        leases: [],
        payments: [],
        maintenance: [],
        source: 'units-api',
      };
      const existing = unitMap.get(id);
      unitMap.set(id, existing ? mergeUnitRows(existing, next) : next);
    });

    propertyLeases.forEach((lease) => {
      const key = unitKeyFromLease(lease);
      if (!key) return;
      const paymentsForLease = paymentsByLeaseId.get(lease.id) ?? [];
      const existing = unitMap.get(key);
      const next: UnitRow = {
        id: key,
        unitNumber: lease.unitNumber ?? lease.propertyUnit ?? lease.unitName ?? key,
        unitType: undefined,
        status: isLeaseActive(lease) ? 'occupied' : lease.status,
        monthlyRent: lease.monthlyRent ?? lease.rentAmount,
        currentTenant: tenantById.get(lease.tenantId),
        currentLease: lease,
        leases: [lease],
        payments: paymentsForLease,
        maintenance: [],
        source: 'lease',
      };
      if (existing) {
        existing.leases.push(...existing.leases.some((item) => item.id === lease.id) ? [] : [lease]);
        existing.payments.push(...paymentsForLease.filter((payment) => !existing.payments.some((item) => item.id === payment.id)));
        unitMap.set(key, mergeUnitRows(existing, next));
      } else {
        unitMap.set(key, next);
      }
    });
    propertyPayments.forEach((payment) => {
      const key = unitKeyFromPayment(payment);
      if (!key) return;
      const existing = unitMap.get(key);
      const next: UnitRow = {
        id: key,
        unitNumber: key,
        unitType: undefined,
        status: undefined,
        monthlyRent: undefined,
        currentTenant: payment.tenantId ? tenantById.get(payment.tenantId) : undefined,
        leases: payment.leaseId ? propertyLeases.filter((lease) => lease.id === payment.leaseId) : [],
        payments: [payment],
        maintenance: [],
        source: 'payment',
      };
      if (existing) {
        if (!existing.payments.some((item) => item.id === payment.id)) existing.payments.push(payment);
        unitMap.set(key, mergeUnitRows(existing, next));
      } else {
        unitMap.set(key, next);
      }
    });

    propertyMaintenance.forEach((request) => {
      const key = unitKeyFromMaintenance(request);
      if (!key) return;
      const existing = unitMap.get(key);
      const next: UnitRow = {
        id: key,
        unitNumber: key,
        unitType: undefined,
        status: isMaintenanceOpen(request) ? 'maintenance' : request.status,
        monthlyRent: undefined,
        currentTenant: request.tenantId ? tenantById.get(request.tenantId) : undefined,
        leases: [],
        payments: [],
        maintenance: [request],
        source: 'maintenance',
      };
      if (existing) {
        if (!existing.maintenance.some((item) => item.id === request.id)) existing.maintenance.push(request);
        unitMap.set(key, mergeUnitRows(existing, next));
      } else {
        unitMap.set(key, next);
      }
    });

    const unitsForProperty = Array.from(unitMap.values())
      .map((unit) => finalizeUnitRow(unit, tenantById))
      .sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
    const availableUnits = typeof property.totalUnits === 'number' && typeof property.occupiedUnits === 'number'
      ? Math.max(property.totalUnits - property.occupiedUnits, 0)
      : unitsForProperty.filter(isUnitVacant).length || undefined;

    return {
      property,
      units: unitsForProperty,
      leases: propertyLeases,
      tenants: propertyTenants,
      payments: propertyPayments,
      maintenance: propertyMaintenance,
      landlordName: property.landlordId ? landlordById.get(property.landlordId) : undefined,
      availableUnits,
      unitsApiSupported,
    };
  });
}

function MoneyText({ value }: { value?: number | null }) {
  const safeValue = moneyValue(value);
  return <>{safeValue === undefined ? '—' : formatCurrency(safeValue)}</>;
}

function DateText({ value }: { value?: string | null }) {
  return <>{formatDate(value)}</>;
}

function StatusBadge({ status, variant }: { status?: string | null; variant?: BadgeVariant }) {
  return <Badge variant={variant ?? statusBadgeVariant(status)}>{statusText(status)}</Badge>;
}

function UnsupportedState({ title = 'Requires backend support', description }: { title?: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center">
      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
        <AlertTriangle size={18} />
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-800">{title}</p>
      {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
    </div>
  );
}


function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function exportPropertiesCsv(models: PropertyModel[]) {
  const headers = [
    'Property ID',
    'Property Name',
    'Landlord',
    'Address',
    'Property Type',
    'Status',
    'Total Units',
    'Occupied Units',
    'Vacant Units',
    'Active Leases',
    'Tenants',
    'Open Maintenance',
    'Unit',
    'Unit Type',
    'Unit Status',
    'Tenant',
    'Lease Status',
    'Monthly Rent',
    'Arrears',
  ];
  const lines = models.flatMap((model) => {
    const base = [
      model.property.id,
      model.property.name,
      model.landlordName ?? '',
      model.property.address,
      propertyTypeLabel(model.property.type ?? model.property.propertyType),
      statusText(derivePropertyStatus(model)),
      typeof model.property.totalUnits === 'number' ? String(model.property.totalUnits) : '',
      typeof model.property.occupiedUnits === 'number' ? String(model.property.occupiedUnits) : '',
      typeof model.availableUnits === 'number' ? String(model.availableUnits) : '',
      String(model.leases.filter(isLeaseActive).length),
      String(model.tenants.length),
      String(model.maintenance.filter(isMaintenanceOpen).length),
    ].map(String);

    if (model.units.length === 0) {
      return [base.concat(Array(headers.length - base.length).fill('')).join(',')];
    }

    return model.units.map((unit) => {
      const row = [
        unit.unitNumber,
        unitTypeLabel(unit.unitType),
        statusText(unit.status),
        unit.currentTenant?.name ?? '',
        unit.currentLease?.status ?? '',
        moneyValue(unit.monthlyRent) === undefined ? '' : String(unit.monthlyRent),
        unitArrears(unit) === undefined ? '' : String(unitArrears(unit)),
      ];
      return base.concat(row).map(csvEscape).join(',');
    });
  });

  const today = new Date().toISOString().slice(0, 10);
  const blob = new Blob([[headers.map(csvEscape).join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `landlordtenant-properties-${today}.csv`;
  anchor.click();
  window.URL.revokeObjectURL(url);
}
function matchesSearch(model: PropertyModel, term: string) {
  if (!term) return true;
  return [
    model.property.name,
    model.property.address,
    model.property.id,
    model.property.type,
    model.property.propertyType,
    model.landlordName,
    ...model.units.map((unit) => unit.unitNumber),
    ...model.units.map((unit) => unit.currentTenant?.name),
    ...model.tenants.map((tenant) => tenant.name),
    ...model.leases.map((lease) => lease.id),
  ].filter(Boolean).join(' ').toLowerCase().includes(term);
}

function matchesPropertyFilter(model: PropertyModel, filter: PropertyFilter) {
  const status = normalizeStatus(derivePropertyStatus(model));
  if (filter === 'all') return true;
  if (filter === 'available') return status === 'available' || Boolean(model.availableUnits && model.availableUnits > 0) || model.units.some(isUnitVacant);
  if (filter === 'occupied') return status === 'occupied' || (typeof model.property.occupiedUnits === 'number' && model.property.occupiedUnits > 0) || model.units.some(isUnitOccupied);
  if (filter === 'maintenance') return model.maintenance.some(isMaintenanceOpen) || model.units.some(isUnitMaintenance);
  if (filter === 'inactive') return status === 'inactive' || (typeof model.property.totalUnits === 'number' && model.property.totalUnits === 0);
  return true;
}

function matchesPropertyTypeFilter(model: PropertyModel, filter: PropertyTypeFilter) {
  if (filter === 'all') return true;
  return normalizePropertyType(model.property.type ?? model.property.propertyType) === filter;
}

function matchesQuickFilter(model: PropertyModel, filter: QuickFilter) {
  if (filter === 'all') return true;
  if (filter === 'occupied') return model.units.some(isUnitOccupied) || (typeof model.property.occupiedUnits === 'number' && model.property.occupiedUnits > 0);
  if (filter === 'vacant') return Boolean(model.availableUnits && model.availableUnits > 0) || model.units.some(isUnitVacant);
  if (filter === 'maintenance') return model.maintenance.some(isMaintenanceOpen) || model.units.some(isUnitMaintenance);
  if (filter === 'arrears') return model.units.some((unit) => (unitArrears(unit) ?? 0) > 0);
  return true;
}

function matchesCardTab(unit: UnitRow, tab: PropertyCardTab) {
  if (tab === 'all') return true;
  if (tab === 'occupied') return isUnitOccupied(unit);
  if (tab === 'vacant') return isUnitVacant(unit);
  if (tab === 'maintenance') return isUnitMaintenance(unit);
  if (tab === 'arrears') return (unitArrears(unit) ?? 0) > 0;
  return true;
}

function visibleCardTabs(model: PropertyModel) {
  return cardTabs.filter((tab) => {
    if (tab.value === 'all') return true;
    if (tab.value === 'occupied') return model.units.some(isUnitOccupied);
    if (tab.value === 'vacant') return Boolean(model.availableUnits && model.availableUnits > 0) || model.units.some(isUnitVacant);
    if (tab.value === 'maintenance') return model.maintenance.some(isMaintenanceOpen) || model.units.some(isUnitMaintenance);
    if (tab.value === 'arrears') return hasArrearsData(model) && model.units.some((unit) => (unitArrears(unit) ?? 0) > 0);
    return true;
  });
}

function countOpenMaintenance(model: PropertyModel) {
  return model.maintenance.filter(isMaintenanceOpen).length;
}

function countOccupiedUnits(model: PropertyModel) {
  if (typeof model.property.occupiedUnits === 'number') return model.property.occupiedUnits;
  return model.units.filter(isUnitOccupied).length;
}

function countVacantUnits(model: PropertyModel) {
  if (typeof model.availableUnits === 'number') return model.availableUnits;
  return model.units.filter(isUnitVacant).length;
}

function countTotalUnits(model: PropertyModel) {
  if (typeof model.property.totalUnits === 'number') return model.property.totalUnits;
  if (model.units.length > 0) return model.units.length;
  return undefined;
}
function PropertySkeletonList() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <article key={index} className="rounded-2xl border border-[#D6E0EA] bg-white p-5 shadow-sm">
          <div className="flex animate-pulse items-start gap-4">
            <div className="h-12 w-12 rounded-full bg-slate-200" />
            <div className="min-w-0 flex-1 space-y-3">
              <div className="h-5 w-1/3 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((__, statIndex) => (
                  <div key={statIndex} className="h-16 rounded-xl bg-slate-100" />
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function StatChip({ label, value, icon: Icon, tone }: { label: string; value: ReactNode; icon: LucideIcon; tone: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1 truncate text-xl font-bold tracking-tight text-[#050816]">{value}</p>
        </div>
        <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', tone)}>
          <Icon size={17} />
        </span>
      </div>
    </div>
  );
}

function PropertyCardStats({ model }: { model: PropertyModel }) {
  const stats = [
    { label: 'Units', value: countTotalUnits(model) ?? '—', icon: DoorOpen, tone: 'bg-[#F3F8FF] text-[#0B7CC1]' },
    { label: 'Occupied', value: countOccupiedUnits(model), icon: Users, tone: 'bg-emerald-50 text-emerald-600' },
    { label: 'Vacant', value: countVacantUnits(model) ?? '—', icon: Home, tone: 'bg-slate-50 text-slate-500' },
    { label: 'Active Leases', value: model.leases.filter(isLeaseActive).length, icon: FileText, tone: 'bg-[#F3F8FF] text-[#0B7CC1]' },
    { label: 'Tenants', value: model.tenants.length, icon: User, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Maintenance', value: countOpenMaintenance(model), icon: Wrench, tone: countOpenMaintenance(model) > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-500' },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {stats.map((stat) => (
        <StatChip key={stat.label} {...stat} />
      ))}
    </div>
  );
}

function PropertyToolbar({
  search,
  propertyFilter,
  propertyTypeFilter,
  quickFilter,
  shownCount,
  canFilterByArrears,
  typeFilterHasNoBackendData,
  onSearchChange,
  onPropertyFilterChange,
  onPropertyTypeFilterChange,
  onQuickFilterChange,
  onRefresh,
  onAdd,
  onExport,
  onClear,
}: {
  search: string;
  propertyFilter: PropertyFilter;
  propertyTypeFilter: PropertyTypeFilter;
  quickFilter: QuickFilter;
  shownCount: number;
  canFilterByArrears: boolean;
  typeFilterHasNoBackendData: boolean;
  onSearchChange: (value: string) => void;
  onPropertyFilterChange: (value: PropertyFilter) => void;
  onPropertyTypeFilterChange: (value: PropertyTypeFilter) => void;
  onQuickFilterChange: (value: QuickFilter) => void;
  onRefresh: () => void;
  onAdd: () => void;
  onExport: () => void;
  onClear: () => void;
}) {
  const filtersActive = Boolean(search.trim()) || propertyFilter !== 'all' || propertyTypeFilter !== 'all' || quickFilter !== 'all';

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-3xl border border-white/70 bg-[radial-gradient(circle_at_top_left,rgba(11,124,193,0.18),transparent_34%),linear-gradient(135deg,#FFFFFF_0%,#F3F8FF_58%,#FFFFFF_100%)] p-5 shadow-sm">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D6E0EA] bg-white px-3 py-1 text-xs font-semibold text-[#0B7CC1] shadow-sm">
              <Building2 size={14} />
              Property operations
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[#050816]">Properties</h1>
            <p className="mt-1 max-w-3xl text-sm text-[#475569]">
              Manage properties, units, tenants, leases, rent, and maintenance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onRefresh} className="rounded-xl">
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={onExport} className="rounded-xl">
              <Download size={14} />
              Export CSV
            </Button>
            <Button type="button" size="sm" onClick={onAdd} className="rounded-xl bg-[#0B7CC1] text-white hover:bg-[#0869A8]">
              <HousePlus size={14} />
              Add Property
            </Button>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 rounded-3xl border border-[#D6E0EA] bg-white/95 p-3 shadow-sm backdrop-blur">
        <div className="grid gap-3 xl:grid-cols-[minmax(240px,1.4fr)_220px_220px_auto] xl:items-center">
          <label className="relative">
            <span className="sr-only">Search property, landlord, location, unit, tenant</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
            <input
              type="search"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search property, landlord, location, unit, tenant..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-[#F3F8FF] pl-10 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#0B7CC1] focus:bg-white"
            />
          </label>
          <Select
            value={propertyFilter}
            onChange={(event) => onPropertyFilterChange(event.target.value as PropertyFilter)}
            options={propertyFilters}
            aria-label="Status filter"
          />
          <Select
            value={propertyTypeFilter}
            onChange={(event) => onPropertyTypeFilterChange(event.target.value as PropertyTypeFilter)}
            options={propertyTypeFilters}
            aria-label="Type filter"
          />
          {filtersActive && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold text-[#0B7CC1] transition hover:bg-[#F3F8FF]"
            >
              <FilterX size={15} />
              Clear filters
            </button>
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {quickFilters
            .filter((filter) => !filter.requiresArrears || canFilterByArrears)
            .map((filter) => {
              const active = quickFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => onQuickFilterChange(filter.value)}
                  className={clsx(
                    'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                    active ? 'bg-[#0B7CC1] text-white shadow-sm shadow-[#0B7CC1]/20' : 'border border-slate-200 bg-white text-slate-600 hover:border-[#D6E0EA] hover:text-[#050816]'
                  )}
                >
                  {filter.label}
                </button>
              );
            })}
          <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
            <CalendarDays size={13} />
            {shownCount} shown
            {typeFilterHasNoBackendData && propertyTypeFilter !== 'all' && <span className="text-[#0B7CC1]">Type filter requires backend support</span>}
          </span>
        </div>
      </section>
    </div>
  );
}
function PropertyTabs({
  tabs,
  activeTab,
  onChange,
}: {
  tabs: Array<{ label: string; value: PropertyCardTab }>;
  activeTab: PropertyCardTab;
  onChange: (value: PropertyCardTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={clsx(
            'rounded-xl px-3 py-2 text-xs font-semibold transition-colors',
            activeTab === tab.value ? 'bg-white text-[#0B7CC1] shadow-sm' : 'text-slate-500 hover:bg-white hover:text-slate-700'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function UnitRows({
  model,
  activeTab,
  onUnitClick,
  onTenantClick,
}: {
  model: PropertyModel;
  activeTab: PropertyCardTab;
  onUnitClick: (property: PropertyModel, unit: UnitRow) => void;
  onTenantClick: (property: PropertyModel, unit: UnitRow, tenant: TenantRecord) => void;
}) {
  const visibleUnits = model.units.filter((unit) => matchesCardTab(unit, activeTab));
  const supportsRows = hasUnitRowsSupport(model);

  if (!supportsRows) {
    return (
      <UnsupportedState
        title="Units require backend support"
        description="Unit rows require backend support or lease records with unit identifiers."
      />
    );
  }

  if (model.units.length === 0) {
    return <EmptyState title="No units have been added for this property yet." />;
  }

  if (visibleUnits.length === 0) {
    return <EmptyState title="No units match this tab" description="Try another unit tab or clear the property filters." />;
  }

  return (
    <div className="space-y-2">
      <div className="hidden px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:grid lg:grid-cols-[auto_minmax(120px,1fr)_minmax(150px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(110px,1fr)_auto]">
        <span />
        <span>Unit</span>
        <span>Tenant</span>
        <span>Lease</span>
        <span>Rent</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      {visibleUnits.map((unit) => (
        <div key={unit.id} className="rounded-2xl border border-slate-100 bg-white p-3 transition hover:border-[#D6E0EA] hover:bg-[#F3F8FF]/40">
          <div className="grid gap-3 lg:grid-cols-[auto_minmax(120px,1fr)_minmax(150px,1fr)_minmax(120px,1fr)_minmax(120px,1fr)_minmax(110px,1fr)_auto]">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3F8FF] text-[#0B7CC1]">
                <Home size={17} />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Unit</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Unit</p>
              <p className="truncate font-semibold text-[#050816]">{unit.unitNumber}</p>
              <p className="truncate text-xs text-slate-500">{unitTypeLabel(unit.unitType)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Tenant</p>
              {unit.currentTenant ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onTenantClick(model, unit, unit.currentTenant as TenantRecord);
                  }}
                  className="block truncate text-left text-sm font-semibold text-[#0B7CC1] hover:underline"
                >
                  {unit.currentTenant.name}
                </button>
              ) : (
                <p className="text-sm text-slate-400">—</p>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Lease</p>
              {unit.currentLease ? <StatusBadge status={unit.currentLease.status} /> : <p className="text-sm text-slate-400">—</p>}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Rent</p>
              <p className="text-sm font-semibold text-slate-800"><MoneyText value={unit.monthlyRent} /></p>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 lg:hidden">Status</p>
              <StatusBadge status={unit.status} variant={statusBadgeVariant(unit.status)} />
            </div>
            <div className="flex items-center justify-start lg:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={() => onUnitClick(model, unit)} className="rounded-xl" aria-label={`View details for unit ${unit.unitNumber}`}>
                <Eye size={14} />
                View Details
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
function PropertyCard({
  model,
  activeTab,
  onTabChange,
  onDetails,
  onUnitClick,
  onTenantClick,
}: {
  model: PropertyModel;
  activeTab: PropertyCardTab;
  onTabChange: (value: PropertyCardTab) => void;
  onDetails: (property: PropertyModel) => void;
  onUnitClick: (property: PropertyModel, unit: UnitRow) => void;
  onTenantClick: (property: PropertyModel, unit: UnitRow, tenant: TenantRecord) => void;
}) {
  const { property } = model;
  const tabs = visibleCardTabs(model);

  return (
    <article className="overflow-hidden rounded-3xl border border-[#D6E0EA] bg-white shadow-sm shadow-slate-200/70">
      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#050816_0%,#0B7CC1_100%)] text-sm font-bold text-white shadow-sm shadow-[#0B7CC1]/25">
              {initials(property.name)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-lg font-bold text-[#050816]">{property.name}</h2>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">{property.id}</span>
              </div>
              <div className="mt-2 grid gap-2 text-sm text-[#475569] md:grid-cols-2">
                <p className="flex min-w-0 items-center gap-2">
                  <MapPin size={15} className="shrink-0 text-slate-400" />
                  <span className="truncate">{property.address || '—'}</span>
                </p>
                <p className="flex min-w-0 items-center gap-2">
                  <User size={15} className="shrink-0 text-slate-400" />
                  <span className="truncate">{model.landlordName || '—'}</span>
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusBadge status={derivePropertyStatus(model)} />
                <Badge variant="neutral">{propertyTypeLabel(property.type ?? property.propertyType)}</Badge>
              </div>
            </div>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={() => onDetails(model)} className="rounded-xl lg:self-start" aria-label={`View details for ${property.name}`}>
            <MoreVertical size={14} />
            Details
          </Button>
        </div>
      </div>

      <div className="space-y-4 bg-[#F8FAFC] p-5">
        <PropertyCardStats model={model} />
        <PropertyTabs tabs={tabs} activeTab={activeTab} onChange={onTabChange} />
        <UnitRows model={model} activeTab={activeTab} onUnitClick={onUnitClick} onTenantClick={onTenantClick} />
      </div>
    </article>
  );
}

function ResponsiveTable({
  headers,
  rows,
  emptyTitle,
  emptyDescription,
}: {
  headers: string[];
  rows: Array<{ key: string; cells: ReactNode[] }>;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle ?? 'No records found'} description={emptyDescription} />;
  }

  return (
    <div className="space-y-2">
      <div className="hidden px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:grid" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
        {headers.map((header) => <span key={header}>{header}</span>)}
      </div>
      {rows.map((row) => (
        <div key={row.key} className="rounded-2xl border border-slate-100 bg-white p-3">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${headers.length}, minmax(0, 1fr))` }}>
            {row.cells.map((cell, index) => (
              <div key={index} className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 lg:hidden">{headers[index]}</p>
                <div className="mt-0.5 text-sm text-slate-700">{cell}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-[#050816]">{value}</dd>
    </div>
  );
}

function DrawerSectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-base font-bold text-[#050816]">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
  );
}

function PaymentSummary({ model, paymentsAvailable }: { model: PropertyModel; paymentsAvailable: boolean }) {
  if (!paymentsAvailable) {
    return <UnsupportedState title="Payment summary requires backend support" description="Payment summary requires backend support." />;
  }

  const total = model.payments.reduce((sum, payment) => sum + (moneyValue(payment.amount) ?? 0), 0);
  const confirmed = model.payments.filter((payment) => normalizeStatus(payment.status) === 'confirmed').reduce((sum, payment) => sum + (moneyValue(payment.amount) ?? 0), 0);
  const pending = model.payments.filter((payment) => normalizeStatus(payment.status) === 'pending').reduce((sum, payment) => sum + (moneyValue(payment.amount) ?? 0), 0);
  const failed = model.payments.filter((payment) => normalizeStatus(payment.status) === 'failed').reduce((sum, payment) => sum + (moneyValue(payment.amount) ?? 0), 0);

  if (model.payments.length === 0) {
    return <EmptyState title="No payments found for this property yet." description="Payment records have not been returned by the backend." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatChip label="Total Payments" value={<MoneyText value={total} />} icon={CreditCard} tone="bg-[#F3F8FF] text-[#0B7CC1]" />
      <StatChip label="Confirmed" value={<MoneyText value={confirmed} />} icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
      <StatChip label="Pending" value={<MoneyText value={pending} />} icon={CalendarDays} tone="bg-amber-50 text-amber-600" />
      <StatChip label="Failed" value={<MoneyText value={failed} />} icon={AlertTriangle} tone="bg-rose-50 text-rose-600" />
    </div>
  );
}

function PropertyDetailsDrawer({
  selection,
  activeTab,
  onTabChange,
  onClose,
  paymentsAvailable,
  maintenanceAvailable,
}: {
  selection: { property: PropertyModel; unit?: UnitRow } | null;
  activeTab: DetailsTab;
  onTabChange: (value: DetailsTab) => void;
  onClose: () => void;
  paymentsAvailable: boolean;
  maintenanceAvailable: boolean;
}) {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!selection) return null;
  const model = selection.property;
  const selectedUnit = selection.unit;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close property details" className="absolute inset-0 bg-slate-950/35" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-5xl flex-col bg-[#F8FAFC] shadow-2xl">
        <div className="border-b border-[#D6E0EA] bg-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#050816_0%,#0B7CC1_100%)] text-sm font-bold text-white">
                {initials(model.property.name)}
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold text-[#050816]">{model.property.name}</h2>
                <p className="mt-1 truncate text-sm text-slate-500">{model.property.address || '—'} {selectedUnit ? `· Unit ${selectedUnit.unitNumber}` : ''}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close property details">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {detailsTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => onTabChange(tab.value)}
                className={clsx(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  activeTab === tab.value ? 'bg-[#0B7CC1] text-white' : 'bg-white text-slate-600 hover:bg-[#F3F8FF] hover:text-[#0B7CC1]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-5">
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <DrawerSectionTitle title="Overview" description="Property summary from the admin properties, units, leases, tenants, and maintenance APIs." />
              <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <InfoItem label="Property name" value={model.property.name} />
                <InfoItem label="Landlord" value={model.landlordName ?? '—'} />
                <InfoItem label="Location" value={model.property.address || '—'} />
                <InfoItem label="Type" value={propertyTypeLabel(model.property.type ?? model.property.propertyType)} />
                <InfoItem label="Status" value={<StatusBadge status={derivePropertyStatus(model)} />} />
                <InfoItem label="Total units" value={countTotalUnits(model) ?? '—'} />
                <InfoItem label="Occupied units" value={countOccupiedUnits(model)} />
                <InfoItem label="Vacant units" value={countVacantUnits(model) ?? '—'} />
                <InfoItem label="Active leases" value={model.leases.filter(isLeaseActive).length} />
                <InfoItem label="Open maintenance" value={countOpenMaintenance(model)} />
                <InfoItem label="Created date" value={<DateText value={model.property.createdAt} />} />
              </dl>
              {!hasUnitRowsSupport(model) && (
                <UnsupportedState title="Unit data requires backend support" description="Unit data requires backend support or lease records with unit identifiers." />
              )}
            </div>
          )}

          {activeTab === 'units' && (
            <div className="space-y-4">
              <DrawerSectionTitle title="Units" description={hasUnitRowsSupport(model) ? 'Real unit rows from the backend.' : 'Unit rows require backend support.'} />
              {hasUnitRowsSupport(model) ? (
                <ResponsiveTable
                  headers={['Unit', 'Type', 'Tenant', 'Rent', 'Status', 'Actions']}
                  emptyTitle="No units have been added for this property yet."
                  rows={model.units.map((unit) => ({
                    key: unit.id,
                    cells: [
                      <span key="unit" className="font-semibold text-[#050816]">{unit.unitNumber}</span>,
                      <span key="type">{unitTypeLabel(unit.unitType)}</span>,
                      <span key="tenant">{unit.currentTenant?.name ?? '—'}</span>,
                      <span key="rent"><MoneyText value={unit.monthlyRent} /></span>,
                      <StatusBadge key="status" status={unit.status} />,
                      <Button key="action" type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => onTabChange('units')}>View</Button>,
                    ],
                  }))}
                />
              ) : <UnsupportedState title="Units require backend support" description="Unit rows require backend support or lease records with unit identifiers." />}
            </div>
          )}
          {activeTab === 'tenants' && (
            <div className="space-y-4">
              <DrawerSectionTitle title="Tenants" description="Tenants linked through real lease, unit, payment, or maintenance records." />
              <ResponsiveTable
                headers={['Tenant', 'Contact', 'Unit', 'Lease status']}
                emptyTitle="No tenants linked to this property yet."
                rows={model.tenants.map((tenant) => {
                  const lease = model.leases.find((item) => item.tenantId === tenant.id);
                  const unit = lease ? model.units.find((item) => item.leases.some((leaseItem) => leaseItem.id === lease.id)) : undefined;
                  return {
                    key: tenant.id,
                    cells: [
                      <span key="tenant" className="font-semibold text-[#050816]">{tenant.name}</span>,
                      <span key="contact">{tenantContact(tenant)}</span>,
                      <span key="unit">{unit?.unitNumber ?? '—'}</span>,
                      lease ? <StatusBadge key="lease" status={lease.status} /> : <span key="lease-none">—</span>,
                    ],
                  };
                })}
              />
            </div>
          )}

          {activeTab === 'leases' && (
            <div className="space-y-4">
              <DrawerSectionTitle title="Leases" description="Lease records returned by the backend." />
              <ResponsiveTable
                headers={['Tenant', 'Unit', 'Start date', 'End date', 'Status', 'Monthly rent']}
                emptyTitle="No leases found for this property yet."
                rows={model.leases.map((lease) => {
                  const tenant = model.tenants.find((item) => item.id === lease.tenantId);
                  const unit = model.units.find((item) => item.leases.some((leaseItem) => leaseItem.id === lease.id));
                  return {
                    key: lease.id,
                    cells: [
                      <span key="tenant" className="font-semibold text-[#050816]">{tenant?.name ?? lease.tenantName ?? lease.tenantId}</span>,
                      <span key="unit">{unit?.unitNumber ?? lease.unitNumber ?? lease.propertyUnit ?? '—'}</span>,
                      <DateText key="start" value={lease.startDate} />,
                      <DateText key="end" value={lease.endDate} />,
                      <StatusBadge key="status" status={lease.status} />,
                      <MoneyText key="rent" value={lease.monthlyRent ?? lease.rentAmount} />,
                    ],
                  };
                })}
              />
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-4">
              <DrawerSectionTitle title="Payments" description="Payment summary is shown only when payment records are safely available." />
              <PaymentSummary model={model} paymentsAvailable={paymentsAvailable} />
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <DrawerSectionTitle title="Maintenance" description={maintenanceAvailable ? 'Maintenance requests returned by the backend.' : 'Maintenance requires backend support.'} />
              {maintenanceAvailable ? (
                <ResponsiveTable
                  headers={['Issue', 'Priority', 'Status', 'Tenant', 'Unit', 'Created date']}
                  emptyTitle="No maintenance requests found for this property yet."
                  rows={model.maintenance.map((request) => {
                    const tenant = model.tenants.find((item) => item.id === request.tenantId);
                    const unit = model.units.find((item) => item.maintenance.some((requestItem) => requestItem.id === request.id));
                    return {
                      key: request.id,
                      cells: [
                        <span key="issue" className="font-semibold text-[#050816]">{request.title ?? request.issueSummary ?? request.description ?? 'Maintenance request'}</span>,
                        <span key="priority">{statusText(request.priority)}</span>,
                        <StatusBadge key="status" status={request.status} />,
                        <span key="tenant">{tenant?.name ?? request.tenantName ?? '—'}</span>,
                        <span key="unit">{unit?.unitNumber ?? request.unitNumber ?? request.propertyUnit ?? '—'}</span>,
                        <DateText key="created" value={request.createdAt} />,
                      ],
                    };
                  })}
                />
              ) : <UnsupportedState title="Maintenance requires backend support" description="Maintenance requests require backend support." />}
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <DrawerSectionTitle title="Reports" />
              <UnsupportedState title="Reports require backend support" description="No report data is exposed by the current backend APIs." />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
function AddPropertyModal({
  isOpen,
  landlords,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  landlords: Array<{ id: string; name: string }>;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: PropertyForm) => void;
}) {
  const [form, setForm] = useState(emptyForm);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(form);
  }

  function close() {
    setForm(emptyForm);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={close} title="Add Property" size="lg">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Property name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required />
        <Input label="Address" value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} required />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Total units" type="number" min={0} value={form.totalUnits} onChange={(event) => setForm((current) => ({ ...current, totalUnits: event.target.value }))} required />
          <Input label="Monthly rent" type="number" min={0} value={form.monthlyRent} onChange={(event) => setForm((current) => ({ ...current, monthlyRent: event.target.value }))} required />
        </div>
        <Select
          label="Landlord"
          value={form.landlordId}
          onChange={(event) => setForm((current) => ({ ...current, landlordId: event.target.value }))}
          options={[
            { value: '', label: landlords.length > 0 ? 'No landlord selected' : 'No landlords returned by backend' },
            ...landlords.map((landlord) => ({ value: landlord.id, label: landlord.name })),
          ]}
        />
        <Input label="Photo URL" value={form.photoUrl} onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))} />
        {error && <div className="rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</div>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
          <Button type="submit" isLoading={isSaving}><HousePlus size={14} />Save property</Button>
        </div>
      </form>
    </Modal>
  );
}
export default function AdminPropertiesPage() {
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>('all');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyTypeFilter>('all');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [cardTabs, setCardTabs] = useState<Record<string, PropertyCardTab>>({});
  const [detailsSelection, setDetailsSelection] = useState<{ property: PropertyModel; unit?: UnitRow } | null>(null);
  const [detailsTab, setDetailsTab] = useState<DetailsTab>('overview');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState<string | undefined>();

  const propertiesQuery = useAdminProperties(500);
  const unitsQuery = useAdminUnits(500);
  const landlordsQuery = useAdminLandlords(500);
  const tenantsQuery = useAdminTenants(500);
  const leasesQuery = useAdminLeases(500);
  const paymentsQuery = useAdminPayments(500);
  const maintenanceQuery = useAdminMaintenanceRequests(500);
  const createProperty = useCreateProperty();

  const models = useMemo(
    () =>
      buildPropertyModels({
        properties: (propertiesQuery.data?.items ?? []) as ExtendedProperty[],
        units: (unitsQuery.data?.items ?? []) as ApiUnit[],
        tenants: (tenantsQuery.data?.items ?? []) as TenantRecord[],
        leases: (leasesQuery.data?.items ?? []) as LeaseRecord[],
        payments: (paymentsQuery.data?.items ?? []) as PaymentRecord[],
        maintenance: (maintenanceQuery.data?.items ?? []) as MaintenanceRecord[],
        landlords: landlordsQuery.data?.items ?? [],
        unitsApiSupported: unitsQuery.isSuccess,
      }),
    [
      landlordsQuery.data?.items,
      leasesQuery.data?.items,
      maintenanceQuery.data?.items,
      paymentsQuery.data?.items,
      propertiesQuery.data?.items,
      tenantsQuery.data?.items,
      unitsQuery.data?.items,
      unitsQuery.isSuccess,
    ]
  );

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();
    return models.filter((model) => (
      matchesSearch(model, term)
      && matchesPropertyFilter(model, propertyFilter)
      && matchesPropertyTypeFilter(model, propertyTypeFilter)
      && matchesQuickFilter(model, quickFilter)
    ));
  }, [models, propertyFilter, propertyTypeFilter, quickFilter, search]);

  const canFilterByArrears = models.some(hasArrearsData);
  const typeFilterHasNoBackendData = models.length > 0 && !models.some((model) => normalizePropertyType(model.property.type ?? model.property.propertyType) !== 'unknown');
  const relatedErrors = [unitsQuery.error, tenantsQuery.error, leasesQuery.error, paymentsQuery.error, maintenanceQuery.error].filter(Boolean);
  const paymentsAvailable = paymentsQuery.isSuccess && !paymentsQuery.isError;
  const maintenanceAvailable = maintenanceQuery.isSuccess && !maintenanceQuery.isError;

  function refreshAll() {
    void propertiesQuery.refetch();
    void unitsQuery.refetch();
    void landlordsQuery.refetch();
    void tenantsQuery.refetch();
    void leasesQuery.refetch();
    void paymentsQuery.refetch();
    void maintenanceQuery.refetch();
  }

  function clearFilters() {
    setSearch('');
    setPropertyFilter('all');
    setPropertyTypeFilter('all');
    setQuickFilter('all');
  }

  function openDetails(property: PropertyModel, unit?: UnitRow) {
    setDetailsSelection({ property, unit });
    setDetailsTab(unit ? 'units' : 'overview');
  }

  async function handleCreate(payload: PropertyForm) {
    setCreateError(undefined);
    const totalUnits = Number(payload.totalUnits);
    const monthlyRent = Number(payload.monthlyRent);
    if (!payload.name.trim() || !payload.address.trim() || !Number.isFinite(totalUnits) || !Number.isFinite(monthlyRent)) {
      setCreateError('Property name, address, total units, and monthly rent are required.');
      return;
    }

    try {
      await createProperty.mutateAsync({
        name: payload.name.trim(),
        address: payload.address.trim(),
        totalUnits,
        monthlyRent,
        landlordId: payload.landlordId || undefined,
        photoUrl: payload.photoUrl.trim() || undefined,
      });
      setIsCreateOpen(false);
      refreshAll();
    } catch (error) {
      setCreateError(handleApiError(error).message);
    }
  }

  if (propertiesQuery.isPending) {
    return (
      <div className="min-h-full space-y-5 bg-[#F8FAFC] p-5 text-slate-900">
        <PropertySkeletonList />
      </div>
    );
  }

  if (propertiesQuery.isError) {
    const error = handleApiError(propertiesQuery.error);
    const message = error.status === 401
      ? 'Your session has expired. Please sign in again.'
      : error.status === 403
        ? 'You do not have permission to view properties.'
        : error.message;
    return (
      <div className="min-h-full bg-[#F8FAFC] p-5">
        <ErrorState message={message} onRetry={refreshAll} />
      </div>
    );
  }

  return (
    <div className="min-h-full space-y-5 bg-[#F8FAFC] p-5 text-slate-900">
      <PropertyToolbar
        search={search}
        propertyFilter={propertyFilter}
        propertyTypeFilter={propertyTypeFilter}
        quickFilter={quickFilter}
        shownCount={filteredModels.length}
        canFilterByArrears={canFilterByArrears}
        typeFilterHasNoBackendData={typeFilterHasNoBackendData}
        onSearchChange={setSearch}
        onPropertyFilterChange={setPropertyFilter}
        onPropertyTypeFilterChange={setPropertyTypeFilter}
        onQuickFilterChange={setQuickFilter}
        onRefresh={refreshAll}
        onAdd={() => setIsCreateOpen(true)}
        onExport={() => exportPropertiesCsv(filteredModels)}
        onClear={clearFilters}
      />
      {relatedErrors.length > 0 && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Some related property details require backend support or are temporarily unavailable. Property cards remain available from the admin properties API.
        </div>
      )}

      {filteredModels.length === 0 ? (
        <EmptyState
          title={models.length === 0 ? 'No properties found' : 'No properties match your filters'}
          description={
            models.length === 0
              ? 'Create a property through the real API to begin.'
              : propertyTypeFilter !== 'all' && typeFilterHasNoBackendData
                ? 'Property type filtering requires backend support because property types were not returned.'
                : 'Try a different search term, status filter, type filter, or quick filter.'
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredModels.map((model) => (
            <PropertyCard
              key={model.property.id}
              model={model}
              activeTab={cardTabs[model.property.id] ?? 'all'}
              onTabChange={(value) => setCardTabs((current) => ({ ...current, [model.property.id]: value }))}
              onDetails={(property) => openDetails(property)}
              onUnitClick={(property, unit) => openDetails(property, unit)}
              onTenantClick={(property, unit) => {
                openDetails(property, unit);
                setDetailsTab('tenants');
              }}
            />
          ))}
        </div>
      )}

      <PropertyDetailsDrawer
        selection={detailsSelection}
        activeTab={detailsTab}
        onTabChange={setDetailsTab}
        onClose={() => setDetailsSelection(null)}
        paymentsAvailable={paymentsAvailable}
        maintenanceAvailable={maintenanceAvailable}
      />
      <AddPropertyModal
        isOpen={isCreateOpen}
        landlords={landlordsQuery.data?.items ?? []}
        isSaving={createProperty.isPending}
        error={createError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={(payload) => void handleCreate(payload)}
      />
    </div>
  );
}
