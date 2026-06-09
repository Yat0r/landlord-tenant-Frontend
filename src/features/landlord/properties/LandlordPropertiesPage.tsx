import { useMemo, useState, type ReactNode } from 'react';
import {
  AlertTriangle,
  Building2,
  CalendarDays,
  ChevronRight,
  CreditCard,
  DoorOpen,
  FileText,
  Home,
  Mail,
  MapPin,
  MoreVertical,
  Phone,
  Plus,
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
import { LoadingState } from '@/components/feedback/LoadingState';
import { handleApiError } from '@/api/helpers/apiHelpers';
import { formatCurrency, formatDate } from '@/utils/formatting/formatters';
import {
  useLandlordLeases,
  useLandlordMaintenanceRequests,
  useLandlordPayments,
  useLandlordProperties,
  useLandlordTenants,
} from './hooks/useLandlordProperties';
import type {
  LeaseEntity,
  MaintenanceRequestEntity,
  PaymentEntity,
  PropertyEntity,
  TenantEntity,
} from '@/types/domain/entities';

type PropertyFilter = 'all' | 'active' | 'occupied' | 'available' | 'maintenance';
type UnitTypeFilter = 'all' | 'bedsitter' | 'single-room' | 'one-bedroom' | 'two-bedroom' | 'shop' | 'office';
type UnitDrawerTab = 'current' | 'tenants' | 'leases' | 'payments' | 'maintenance';

type ExtendedProperty = PropertyEntity & {
  propertyType?: string | null;
  type?: string | null;
  status?: string | null;
  units?: ApiUnit[];
};

type TenantRecord = TenantEntity & {
  phone?: string | null;
  nationalId?: string | null;
};

type LeaseRecord = LeaseEntity & {
  unitId?: string | null;
  unitNumber?: string | null;
  propertyUnit?: string | null;
  tenantName?: string | null;
  balance?: number | null;
  outstandingBalance?: number | null;
};

type PaymentRecord = PaymentEntity & {
  propertyId?: string | null;
  unitId?: string | null;
  unitNumber?: string | null;
  propertyUnit?: string | null;
  balance?: number | null;
  outstandingBalance?: number | null;
};

type MaintenanceRecord = MaintenanceRequestEntity & {
  unitId?: string | null;
  unitNumber?: string | null;
};

type ApiUnit = {
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
  tenantName?: string | null;
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
  source: 'unit' | 'related';
}

interface PropertyModel {
  property: ExtendedProperty;
  units: UnitRow[];
  leases: LeaseRecord[];
  tenants: TenantRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
  availableUnits?: number;
  monthlyExpectedRent?: number;
  outstandingBalance?: number;
}

interface RelatedSupport {
  tenants: boolean;
  leases: boolean;
  payments: boolean;
  maintenance: boolean;
}

const propertyFilters: Array<{ label: string; value: PropertyFilter }> = [
  { label: 'All Properties', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Occupied Units', value: 'occupied' },
  { label: 'Available Units', value: 'available' },
  { label: 'Maintenance', value: 'maintenance' },
];

const unitTypeFilters: Array<{ label: string; value: UnitTypeFilter }> = [
  { label: 'All Units', value: 'all' },
  { label: 'Bedsitters', value: 'bedsitter' },
  { label: 'Single Rooms', value: 'single-room' },
  { label: '1 Bedroom', value: 'one-bedroom' },
  { label: '2 Bedroom', value: 'two-bedroom' },
  { label: 'Shops', value: 'shop' },
  { label: 'Offices', value: 'office' },
];

function normalizeStatus(value?: string | null) {
  return value?.trim().toLowerCase().replace(/\s+/g, '_') ?? '';
}

function statusText(value?: string | null) {
  if (!value) return 'Not available yet';
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeUnitType(value?: string | null): UnitTypeFilter | 'unknown' {
  const normalized = value?.toLowerCase().replace(/[_-]/g, ' ').trim() ?? '';
  if (!normalized) return 'unknown';
  if (normalized.includes('bedsitter') || normalized.includes('bed sitter')) return 'bedsitter';
  if (normalized.includes('single')) return 'single-room';
  if (normalized.includes('one') || normalized.includes('1 bedroom') || normalized.includes('1 bed')) return 'one-bedroom';
  if (normalized.includes('two') || normalized.includes('2 bedroom') || normalized.includes('2 bed')) return 'two-bedroom';
  if (normalized.includes('shop')) return 'shop';
  if (normalized.includes('office')) return 'office';
  return 'unknown';
}

function unitTypeLabel(value?: string | null) {
  const normalized = normalizeUnitType(value);
  if (normalized === 'bedsitter') return 'Bedsitter';
  if (normalized === 'single-room') return 'Single Room';
  if (normalized === 'one-bedroom') return '1 Bedroom';
  if (normalized === 'two-bedroom') return '2 Bedroom';
  if (normalized === 'shop') return 'Shop';
  if (normalized === 'office') return 'Office';
  return value || 'Not available yet';
}

function moneyValue(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) return undefined;
  return value;
}

function initials(value?: string | null) {
  if (!value) return 'PR';
  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function unitNumberFromUnit(unit: ApiUnit) {
  return unit.unitNumber ?? unit.number ?? unit.roomNumber ?? unit.name ?? undefined;
}

function unitKeyFromLease(lease: LeaseRecord) {
  return lease.unitId ?? lease.unitNumber ?? lease.propertyUnit ?? undefined;
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
  const leaseBalance = moneyValue(lease?.balance) ?? moneyValue(lease?.outstandingBalance);
  if (leaseBalance !== undefined) return leaseBalance;

  const paymentWithBalance = payments.find((payment) => moneyValue(payment.balance) !== undefined || moneyValue(payment.outstandingBalance) !== undefined);
  return moneyValue(paymentWithBalance?.balance) ?? moneyValue(paymentWithBalance?.outstandingBalance);
}

function getCurrentLease(leases: LeaseRecord[]) {
  return leases.find(isLeaseActive) ?? leases[0];
}

function buildPropertyModels({
  properties,
  tenants,
  leases,
  payments,
  maintenance,
}: {
  properties: ExtendedProperty[];
  tenants: TenantRecord[];
  leases: LeaseRecord[];
  payments: PaymentRecord[];
  maintenance: MaintenanceRecord[];
}): PropertyModel[] {
  const tenantById = new Map(tenants.map((tenant) => [tenant.id, tenant]));
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
    const propertyMaintenance = maintenance.filter((request) => request.propertyId === property.id);
    const tenantIds = new Set(propertyLeases.map((lease) => lease.tenantId).filter(Boolean));
    const propertyTenants = Array.from(tenantIds)
      .map((tenantId) => tenantById.get(tenantId))
      .filter((tenant): tenant is TenantRecord => Boolean(tenant));

    const unitMap = new Map<string, UnitRow>();

    property.units?.forEach((unit) => {
      const unitNumber = unitNumberFromUnit(unit);
      const id = unit.id ?? unitNumber;
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
        source: 'unit',
      });
    });

    propertyLeases.forEach((lease) => {
      const key = unitKeyFromLease(lease);
      if (!key) return;
      const existing = unitMap.get(key);
      const paymentsForLease = paymentsByLeaseId.get(lease.id) ?? [];
      const current: UnitRow =
        existing ??
        {
          id: key,
          unitNumber: lease.unitNumber ?? lease.propertyUnit ?? key,
          unitType: undefined,
          status: isLeaseActive(lease) ? 'occupied' : undefined,
          monthlyRent: lease.monthlyRent,
          leases: [],
          payments: [],
          maintenance: [],
          source: 'related',
        };

      current.leases.push(lease);
      current.payments.push(...paymentsForLease);
      current.currentLease = getCurrentLease(current.leases);
      current.currentTenant = current.currentLease ? tenantById.get(current.currentLease.tenantId) : current.currentTenant;
      current.monthlyRent = current.monthlyRent ?? lease.monthlyRent;
      current.status = current.status ?? (isLeaseActive(current.currentLease) ? 'occupied' : undefined);
      unitMap.set(key, current);
    });

    propertyPayments.forEach((payment) => {
      const key = unitKeyFromPayment(payment);
      if (!key) return;
      const existing = unitMap.get(key);
      if (!existing) return;
      if (!existing.payments.some((item) => item.id === payment.id)) existing.payments.push(payment);
      unitMap.set(key, existing);
    });

    propertyMaintenance.forEach((request) => {
      const key = unitKeyFromMaintenance(request);
      if (!key) return;
      const existing = unitMap.get(key);
      if (!existing) return;
      existing.maintenance.push(request);
      unitMap.set(key, existing);
    });

    const units = Array.from(unitMap.values()).sort((a, b) => a.unitNumber.localeCompare(b.unitNumber));
    const monthlyExpectedRent = units.length > 0 && units.every((unit) => moneyValue(unit.monthlyRent) !== undefined)
      ? units.reduce((total, unit) => total + Number(unit.monthlyRent), 0)
      : undefined;
    const unitBalances = units.map((unit) => getBalance(unit.payments, unit.currentLease));
    const outstandingBalance = unitBalances.length > 0 && unitBalances.every((value) => value !== undefined)
      ? unitBalances.reduce((total, value) => total + Number(value), 0)
      : undefined;

    return {
      property,
      units,
      leases: propertyLeases,
      tenants: propertyTenants,
      payments: propertyPayments,
      maintenance: propertyMaintenance,
      availableUnits: typeof property.totalUnits === 'number' && typeof property.occupiedUnits === 'number'
        ? Math.max(property.totalUnits - property.occupiedUnits, 0)
        : undefined,
      monthlyExpectedRent,
      outstandingBalance,
    };
  });
}

function MoneyText({ value }: { value?: number | null }) {
  const safeValue = moneyValue(value);
  return <>{safeValue === undefined ? 'Not available yet' : formatCurrency(safeValue)}</>;
}

function DateText({ value }: { value?: string | null }) {
  return <>{value ? formatDate(value) : 'Not available yet'}</>;
}

function StatusBadge({ status, variant }: { status?: string | null; variant?: BadgeVariant }) {
  const normalized = normalizeStatus(status);
  const badgeVariant =
    variant ??
    (normalized === 'active' || normalized === 'occupied' || normalized === 'confirmed'
      ? 'success'
      : normalized === 'open' || normalized === 'in_progress' || normalized === 'available'
        ? 'warning'
        : 'neutral');

  return <Badge variant={badgeVariant}>{statusText(status)}</Badge>;
}

function UnsupportedLabel({ children = 'Requires backend support' }: { children?: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
      {children}
    </span>
  );
}

function PropertyToolbar({
  search,
  propertyFilter,
  unitTypeFilter,
  shownCount,
  onSearchChange,
  onPropertyFilterChange,
  onUnitTypeFilterChange,
  onRefresh,
}: {
  search: string;
  propertyFilter: PropertyFilter;
  unitTypeFilter: UnitTypeFilter;
  shownCount: number;
  onSearchChange: (value: string) => void;
  onPropertyFilterChange: (value: PropertyFilter) => void;
  onUnitTypeFilterChange: (value: UnitTypeFilter) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <section className="rounded-lg bg-[linear-gradient(135deg,#0f172a_0%,#006948_62%,#10b981_100%)] p-5 text-white shadow-[0_18px_46px_rgba(15,118,110,0.22)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
            <p className="mt-1 max-w-2xl text-sm text-emerald-50/85">
              Manage properties, units, tenants, leases, rent, and maintenance.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={onRefresh} className="bg-white/15 text-white hover:bg-white/20">
              <RefreshCw size={14} />
              Refresh
            </Button>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-semibold text-emerald-50 opacity-80"
              title="POST /api/landlord/me/properties is not documented yet."
            >
              <Plus size={14} />
              Add Property — Requires backend support
            </button>
          </div>
        </div>
      </section>

      <section className="sticky top-0 z-20 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-[0_12px_34px_rgba(15,23,42,0.06)] backdrop-blur">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <label className="relative min-w-[220px] flex-1 xl:max-w-xl">
              <span className="sr-only">Search properties, locations, units, and tenants</span>
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                type="search"
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search property / location / unit number / tenant"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#006948] focus:bg-white"
              />
            </label>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Badge variant="neutral">{shownCount} shown</Badge>
              <span className="inline-flex items-center gap-1">
                <CalendarDays size={13} />
                Live backend data
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {propertyFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onPropertyFilterChange(filter.value)}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  propertyFilter === filter.value
                    ? 'border-[#006948] bg-[#006948] text-white'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {unitTypeFilters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => onUnitTypeFilterChange(filter.value)}
                className={clsx(
                  'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                  unitTypeFilter === filter.value
                    ? 'border-slate-800 bg-slate-800 text-white'
                    : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatChip({ label, value, icon: Icon }: { label: string; value: ReactNode; icon: LucideIcon }) {
  return (
    <div className="flex min-w-[150px] items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#006948] shadow-sm">
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}

function PropertyCardStats({ model }: { model: PropertyModel }) {
  const countByType = (type: UnitTypeFilter) => model.units.filter((unit) => normalizeUnitType(unit.unitType) === type).length;
  const openMaintenance = model.maintenance.filter(isMaintenanceOpen).length;
  const occupiedRows = model.units.filter((unit) => normalizeStatus(unit.status) === 'occupied' || isLeaseActive(unit.currentLease)).length;
  const occupiedUnits = model.property.occupiedUnits ?? (model.units.length ? occupiedRows : 'Not available yet');

  return (
    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
      <StatChip label="Total Units" value={model.property.totalUnits ?? 'Not available yet'} icon={DoorOpen} />
      <StatChip label="Bedsitters" value={model.units.length ? countByType('bedsitter') : 'Not available yet'} icon={Home} />
      <StatChip label="Single Rooms" value={model.units.length ? countByType('single-room') : 'Not available yet'} icon={Home} />
      <StatChip label="1 Bedroom" value={model.units.length ? countByType('one-bedroom') : 'Not available yet'} icon={Home} />
      <StatChip label="2 Bedroom" value={model.units.length ? countByType('two-bedroom') : 'Not available yet'} icon={Home} />
      <StatChip label="Shops/Offices" value={model.units.length ? countByType('shop') + countByType('office') : 'Not available yet'} icon={Building2} />
      <StatChip label="Occupied Units" value={occupiedUnits} icon={Users} />
      <StatChip label="Available Units" value={model.availableUnits ?? 'Not available yet'} icon={DoorOpen} />
      <StatChip label="Active Leases" value={model.leases.filter(isLeaseActive).length} icon={FileText} />
      <StatChip label="Open Maintenance" value={openMaintenance} icon={Wrench} />
      <StatChip label="Monthly Expected Rent" value={<MoneyText value={model.monthlyExpectedRent} />} icon={CreditCard} />
      <StatChip label="Outstanding Balance" value={<MoneyText value={model.outstandingBalance} />} icon={AlertTriangle} />
    </div>
  );
}

function PropertyUnitsTable({
  units,
  unitTypeFilter,
  onUnitClick,
  onTenantClick,
}: {
  units: UnitRow[];
  unitTypeFilter: UnitTypeFilter;
  onUnitClick: (unit: UnitRow) => void;
  onTenantClick: (tenant: TenantRecord) => void;
}) {
  const visibleUnits = unitTypeFilter === 'all' ? units : units.filter((unit) => normalizeUnitType(unit.unitType) === unitTypeFilter);

  if (units.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center">
        <p className="text-sm font-semibold text-slate-700">No unit rows available yet.</p>
        <p className="mt-1 text-xs text-slate-500">
          Unit rows require real unit data from the backend or lease records with unit identifiers.
        </p>
        <div className="mt-3">
          <UnsupportedLabel>Requires backend support</UnsupportedLabel>
        </div>
      </div>
    );
  }

  if (visibleUnits.length === 0) {
    return <EmptyState title="No units match this filter" description="Try another unit type filter." />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[1080px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-3">Unit No</th>
            <th className="px-4 py-3">Unit Type</th>
            <th className="px-4 py-3">Unit Status</th>
            <th className="px-4 py-3">Current Tenant</th>
            <th className="px-4 py-3">Lease Status</th>
            <th className="px-4 py-3">Monthly Rent</th>
            <th className="px-4 py-3">Balance</th>
            <th className="px-4 py-3">Open Maintenance</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {visibleUnits.map((unit) => {
            const openMaintenance = unit.maintenance.filter(isMaintenanceOpen).length;
            const balance = getBalance(unit.payments, unit.currentLease);
            const leaseStatus = unit.currentLease?.status;

            return (
              <tr
                key={unit.id}
                onClick={() => onUnitClick(unit)}
                className="cursor-pointer text-slate-600 transition-colors hover:bg-emerald-50/40"
              >
                <td className="px-4 py-3 font-semibold text-slate-950">{unit.unitNumber}</td>
                <td className="px-4 py-3">{unitTypeLabel(unit.unitType)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={unit.status ?? (unit.currentTenant ? 'occupied' : undefined)} />
                </td>
                <td className="px-4 py-3">
                  {unit.currentTenant ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onTenantClick(unit.currentTenant as TenantRecord);
                      }}
                      className="font-semibold text-[#006948] hover:underline"
                    >
                      {unit.currentTenant.name}
                    </button>
                  ) : (
                    <span className="text-slate-400">No current tenant</span>
                  )}
                </td>
                <td className="px-4 py-3">{leaseStatus ? <StatusBadge status={leaseStatus} /> : '—'}</td>
                <td className="px-4 py-3 font-semibold text-slate-900"><MoneyText value={unit.monthlyRent} /></td>
                <td className="px-4 py-3"><MoneyText value={balance} /></td>
                <td className="px-4 py-3">{openMaintenance > 0 ? `${openMaintenance} open` : '0'}</td>
                <td className="px-4 py-3">
                  <Button type="button" variant="outline" size="sm">
                    View
                    <ChevronRight size={13} />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PropertyCard({
  model,
  unitTypeFilter,
  onUnitClick,
  onTenantClick,
}: {
  model: PropertyModel;
  unitTypeFilter: UnitTypeFilter;
  onUnitClick: (property: PropertyModel, unit: UnitRow) => void;
  onTenantClick: (tenant: TenantRecord, context?: TenantContext) => void;
}) {
  const { property } = model;
  const status = property.status ?? (model.availableUnits !== undefined && model.availableUnits > 0 ? 'active' : undefined);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_14px_38px_rgba(15,23,42,0.075)]">
      <div className="border-b border-slate-100 px-4 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#006948_100%)] text-sm font-bold text-white">
              {initials(property.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-950">{property.name}</h2>
              <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                <MapPin size={14} />
                <span className="truncate">{property.address || 'Not available yet'}</span>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={status} />
                <Badge variant="neutral">{property.propertyType ?? property.type ?? 'Not available yet'}</Badge>
                <span className="font-mono text-[11px] text-slate-400">{property.id}</span>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
            title="Property actions require backend support"
            aria-label="Property actions require backend support"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4 bg-slate-50 px-4 py-4">
        <PropertyCardStats model={model} />
        <PropertyUnitsTable
          units={model.units}
          unitTypeFilter={unitTypeFilter}
          onUnitClick={(unit) => onUnitClick(model, unit)}
          onTenantClick={(tenant) => onTenantClick(tenant, { property: model, unit: undefined })}
        />
      </div>
    </article>
  );
}

interface TenantContext {
  property: PropertyModel;
  unit?: UnitRow;
  lease?: LeaseRecord;
}

function UnitTenantsDrawer({
  selection,
  activeTab,
  onTabChange,
  onClose,
  onTenantClick,
}: {
  selection: { property: PropertyModel; unit: UnitRow } | null;
  activeTab: UnitDrawerTab;
  onTabChange: (tab: UnitDrawerTab) => void;
  onClose: () => void;
  onTenantClick: (tenant: TenantRecord, context: TenantContext) => void;
}) {
  if (!selection) return null;

  const { property, unit } = selection;
  const tenantHistory = unit.leases
    .map((lease) => ({
      lease,
      tenant: property.tenants.find((tenant) => tenant.id === lease.tenantId),
      payments: unit.payments.filter((payment) => payment.tenantId === lease.tenantId || payment.leaseId === lease.id),
      maintenance: unit.maintenance.filter((request) => request.tenantId === lease.tenantId),
    }))
    .filter((item) => item.tenant);
  const currentTenant = unit.currentTenant;
  const currentLease = unit.currentLease;

  return (
    <div className="fixed inset-0 z-50">
      <button type="button" aria-label="Close unit tenant drawer" className="absolute inset-0 bg-slate-950/35" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-5xl flex-col bg-white shadow-2xl">
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Unit {unit.unitNumber} — {unitTypeLabel(unit.unitType)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {property.property.name} · {statusText(unit.status ?? (currentTenant ? 'occupied' : undefined))}
              </p>
            </div>
            <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['current', 'Current Tenant'],
              ['tenants', 'Tenant History'],
              ['leases', 'Lease History'],
              ['payments', 'Payments'],
              ['maintenance', 'Maintenance'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onTabChange(value as UnitDrawerTab)}
                className={clsx(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
                  activeTab === value ? 'bg-[#006948] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 p-5">
          {activeTab === 'current' && (
            currentTenant ? (
              <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <button
                  type="button"
                  onClick={() => onTenantClick(currentTenant, { property, unit, lease: currentLease })}
                  className="flex items-center gap-3 text-left"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#006948_100%)] text-xs font-bold text-white">
                    {initials(currentTenant.name)}
                  </span>
                  <span>
                    <span className="block font-semibold text-slate-950">{currentTenant.name}</span>
                    <span className="block text-sm text-slate-500">{currentTenant.email}</span>
                  </span>
                </button>
                <dl className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Info label="Phone" value={currentTenant.phone ?? 'Not available yet'} />
                  <Info label="Lease Status" value={<StatusBadge status={currentLease?.status} />} />
                  <Info label="Lease Start" value={<DateText value={currentLease?.startDate} />} />
                  <Info label="Lease End" value={<DateText value={currentLease?.endDate} />} />
                  <Info label="Monthly Rent" value={<MoneyText value={currentLease?.monthlyRent ?? unit.monthlyRent} />} />
                  <Info label="Current Balance" value={<MoneyText value={getBalance(unit.payments, currentLease)} />} />
                  <Info label="Open Maintenance" value={unit.maintenance.filter(isMaintenanceOpen).length} />
                </dl>
              </div>
            ) : (
              <EmptyState title="No current tenant found for this unit yet." />
            )
          )}

          {activeTab === 'tenants' && (
            tenantHistory.length > 0 ? (
              <TenantHistoryTable rows={tenantHistory} property={property} unit={unit} onTenantClick={onTenantClick} />
            ) : (
              <EmptyState title="No tenants found for this unit yet." />
            )
          )}

          {activeTab === 'leases' && (
            unit.leases.length > 0 ? (
              <SimpleTable
                headers={['Lease', 'Tenant', 'Lease Period', 'Lease Status', 'Monthly Rent']}
                rows={unit.leases.map((lease) => [
                  lease.id,
                  property.tenants.find((tenant) => tenant.id === lease.tenantId)?.name ?? lease.tenantId,
                  `${formatDate(lease.startDate)} to ${formatDate(lease.endDate)}`,
                  <StatusBadge status={lease.status} />,
                  <MoneyText value={lease.monthlyRent} />,
                ])}
              />
            ) : (
              <EmptyState title="No lease history found for this unit yet." />
            )
          )}

          {activeTab === 'payments' && (
            unit.payments.length > 0 ? (
              <SimpleTable
                headers={['Payment', 'Tenant', 'Amount', 'Status', 'Paid Date']}
                rows={unit.payments.map((payment) => [
                  payment.id,
                  payment.tenantName ?? property.tenants.find((tenant) => tenant.id === payment.tenantId)?.name ?? 'Not available yet',
                  <MoneyText value={payment.amount} />,
                  <StatusBadge status={payment.status} />,
                  <DateText value={payment.paidDate ?? payment.createdAt} />,
                ])}
              />
            ) : (
              <EmptyState title="No payments found for this unit yet." />
            )
          )}

          {activeTab === 'maintenance' && (
            unit.maintenance.length > 0 ? (
              <SimpleTable
                headers={['Issue', 'Tenant', 'Status', 'Priority', 'Reported']}
                rows={unit.maintenance.map((request) => [
                  request.title ?? request.issueSummary ?? 'Maintenance request',
                  request.tenantName ?? property.tenants.find((tenant) => tenant.id === request.tenantId)?.name ?? 'Not available yet',
                  <StatusBadge status={request.status} />,
                  statusText(request.priority),
                  <DateText value={request.createdAt} />,
                ])}
              />
            ) : (
              <EmptyState title="No maintenance requests found for this unit yet." />
            )
          )}
        </div>
      </aside>
    </div>
  );
}

function TenantHistoryTable({
  rows,
  property,
  unit,
  onTenantClick,
}: {
  rows: Array<{ lease: LeaseRecord; tenant?: TenantRecord; payments: PaymentRecord[]; maintenance: MaintenanceRecord[] }>;
  property: PropertyModel;
  unit: UnitRow;
  onTenantClick: (tenant: TenantRecord, context: TenantContext) => void;
}) {
  return (
    <SimpleTable
      headers={['Tenant', 'Phone', 'Email', 'Lease Period', 'Lease Status', 'Total Paid', 'Balance', 'Action']}
      rows={rows.map(({ tenant, lease, payments }) => {
        const totalPaid = payments.length > 0 && payments.every((payment) => moneyValue(payment.amount) !== undefined)
          ? payments.reduce((total, payment) => total + payment.amount, 0)
          : undefined;
        return [
          tenant?.name ?? 'Not available yet',
          tenant?.phone ?? 'Not available yet',
          tenant?.email ?? 'Not available yet',
          `${formatDate(lease.startDate)} to ${formatDate(lease.endDate)}`,
          <StatusBadge status={lease.status} />,
          <MoneyText value={totalPaid} />,
          <MoneyText value={getBalance(payments, lease)} />,
          tenant ? (
            <Button type="button" size="sm" variant="outline" onClick={() => onTenantClick(tenant, { property, unit, lease })}>
              View
            </Button>
          ) : (
            'Not available yet'
          ),
        ];
      })}
    />
  );
}

function TenantDetailsDrawer({
  selection,
  onClose,
}: {
  selection: { tenant: TenantRecord; context?: TenantContext } | null;
  onClose: () => void;
}) {
  if (!selection) return null;

  const { tenant, context } = selection;
  const unit = context?.unit;
  const property = context?.property;
  const lease = context?.lease ?? unit?.currentLease;
  const tenantPayments = unit?.payments.filter((payment) => payment.tenantId === tenant.id || payment.leaseId === lease?.id) ?? [];
  const totalPaid = tenantPayments.length > 0 ? tenantPayments.reduce((total, payment) => total + payment.amount, 0) : undefined;
  const tenantMaintenance = unit?.maintenance.filter((request) => request.tenantId === tenant.id) ?? [];

  return (
    <div className="fixed inset-0 z-[60]">
      <button type="button" aria-label="Close tenant details" className="absolute inset-0 bg-slate-950/35" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#006948_100%)] text-sm font-bold text-white">
              {initials(tenant.name)}
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-950">{tenant.name}</h2>
              <p className="truncate text-sm text-slate-500">{tenant.email}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-100 px-5 py-4">
          <DetailCard title="Profile">
            <div className="space-y-3 text-sm">
              <IconLine icon={User} text={tenant.name} />
              <IconLine icon={Phone} text={tenant.phone ?? 'Not available yet'} />
              <IconLine icon={Mail} text={tenant.email} />
            </div>
          </DetailCard>
          <DetailCard title="Lease and Unit">
            <dl className="grid gap-3 text-sm">
              <Info label="Property" value={property?.property.name ?? 'Not available yet'} />
              <Info label="Unit" value={unit?.unitNumber ?? 'Not available yet'} />
              <Info label="Lease Status" value={<StatusBadge status={lease?.status} />} />
              <Info label="Lease Start Date" value={<DateText value={lease?.startDate} />} />
              <Info label="Lease End Date" value={<DateText value={lease?.endDate} />} />
              <Info label="Monthly Rent" value={<MoneyText value={lease?.monthlyRent ?? unit?.monthlyRent} />} />
            </dl>
          </DetailCard>
          <DetailCard title="Payments and Rent">
            <dl className="grid gap-3 text-sm">
              <Info label="Payment Summary" value={<MoneyText value={totalPaid} />} />
              <Info label="Rent Charge Balance" value={<MoneyText value={getBalance(tenantPayments, lease)} />} />
            </dl>
          </DetailCard>
          <DetailCard title="Maintenance Requests">
            {tenantMaintenance.length > 0 ? (
              <div className="space-y-2">
                {tenantMaintenance.map((request) => (
                  <div key={request.id} className="rounded-lg bg-white px-3 py-2 text-sm">
                    <p className="font-semibold text-slate-900">{request.title ?? request.issueSummary ?? 'Maintenance request'}</p>
                    <p className="mt-1 text-xs text-slate-500">{statusText(request.status)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <UnsupportedLabel>Not available yet</UnsupportedLabel>
            )}
          </DetailCard>
        </div>
      </aside>
    </div>
  );
}

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function IconLine({ icon: Icon, text }: { icon: LucideIcon; text: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-slate-700">
      <Icon size={14} className="text-slate-400" />
      <span>{text}</span>
    </p>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-slate-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function matchesSearch(model: PropertyModel, term: string) {
  if (!term) return true;
  return [
    model.property.name,
    model.property.address,
    model.property.id,
    model.property.propertyType,
    model.property.type,
    ...model.units.map((unit) => unit.unitNumber),
    ...model.units.map((unit) => unit.currentTenant?.name),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(term);
}

function matchesPropertyFilter(model: PropertyModel, filter: PropertyFilter) {
  if (filter === 'all') return true;
  if (filter === 'active') return normalizeStatus(model.property.status) === 'active' || model.leases.some(isLeaseActive);
  if (filter === 'occupied') return (model.property.occupiedUnits ?? 0) > 0 || model.units.some((unit) => unit.currentTenant);
  if (filter === 'available') return (model.availableUnits ?? 0) > 0 || model.units.some((unit) => normalizeStatus(unit.status) === 'available');
  return model.maintenance.some(isMaintenanceOpen);
}

function matchesUnitTypeFilter(model: PropertyModel, filter: UnitTypeFilter) {
  if (filter === 'all') return true;
  return model.units.some((unit) => normalizeUnitType(unit.unitType) === filter);
}

export default function LandlordPropertiesPage() {
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<PropertyFilter>('all');
  const [unitTypeFilter, setUnitTypeFilter] = useState<UnitTypeFilter>('all');
  const [unitSelection, setUnitSelection] = useState<{ property: PropertyModel; unit: UnitRow } | null>(null);
  const [tenantSelection, setTenantSelection] = useState<{ tenant: TenantRecord; context?: TenantContext } | null>(null);
  const [unitDrawerTab, setUnitDrawerTab] = useState<UnitDrawerTab>('current');

  const propertiesQuery = useLandlordProperties();
  const tenantsQuery = useLandlordTenants();
  const leasesQuery = useLandlordLeases();
  const paymentsQuery = useLandlordPayments();
  const maintenanceQuery = useLandlordMaintenanceRequests();

  const support: RelatedSupport = {
    tenants: !tenantsQuery.isError,
    leases: !leasesQuery.isError,
    payments: !paymentsQuery.isError,
    maintenance: !maintenanceQuery.isError,
  };

  const models = useMemo(
    () =>
      buildPropertyModels({
        properties: (propertiesQuery.data ?? []) as ExtendedProperty[],
        tenants: (tenantsQuery.data ?? []) as TenantRecord[],
        leases: (leasesQuery.data ?? []) as LeaseRecord[],
        payments: (paymentsQuery.data ?? []) as PaymentRecord[],
        maintenance: (maintenanceQuery.data ?? []) as MaintenanceRecord[],
      }),
    [leasesQuery.data, maintenanceQuery.data, paymentsQuery.data, propertiesQuery.data, tenantsQuery.data]
  );

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();
    return models.filter(
      (model) =>
        matchesSearch(model, term) &&
        matchesPropertyFilter(model, propertyFilter) &&
        matchesUnitTypeFilter(model, unitTypeFilter)
    );
  }, [models, propertyFilter, search, unitTypeFilter]);

  function refreshAll() {
    void propertiesQuery.refetch();
    void tenantsQuery.refetch();
    void leasesQuery.refetch();
    void paymentsQuery.refetch();
    void maintenanceQuery.refetch();
  }

  function handleUnitClick(property: PropertyModel, unit: UnitRow) {
    setUnitSelection({ property, unit });
    setUnitDrawerTab('current');
  }

  function handleTenantClick(tenant: TenantRecord, context?: TenantContext) {
    setTenantSelection({ tenant, context });
  }

  if (propertiesQuery.isPending) {
    return <LoadingState message="Loading properties..." />;
  }

  if (propertiesQuery.isError) {
    const error = handleApiError(propertiesQuery.error);
    return <ErrorState message={`${error.status || 'API'}: ${error.message}`} onRetry={refreshAll} />;
  }

  return (
    <div className="min-h-full bg-slate-100 text-slate-900">
      <PropertyToolbar
        search={search}
        propertyFilter={propertyFilter}
        unitTypeFilter={unitTypeFilter}
        shownCount={filteredModels.length}
        onSearchChange={setSearch}
        onPropertyFilterChange={setPropertyFilter}
        onUnitTypeFilterChange={setUnitTypeFilter}
        onRefresh={refreshAll}
      />

      {(!support.tenants || !support.leases || !support.payments || !support.maintenance) && (
        <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Some related property details require backend support. Property cards remain available from the landlord-scoped properties API.
        </div>
      )}

      {filteredModels.length === 0 ? (
        <EmptyState
          title={models.length === 0 ? 'No properties found' : 'No properties match these filters'}
          description={
            models.length === 0
              ? 'Properties will appear here when the backend returns records for your landlord account.'
              : 'Try a different search term, property filter, or unit type filter.'
          }
        />
      ) : (
        <div className="mt-5 space-y-4">
          {filteredModels.map((model) => (
            <PropertyCard
              key={model.property.id}
              model={model}
              unitTypeFilter={unitTypeFilter}
              onUnitClick={handleUnitClick}
              onTenantClick={handleTenantClick}
            />
          ))}
        </div>
      )}

      <UnitTenantsDrawer
        selection={unitSelection}
        activeTab={unitDrawerTab}
        onTabChange={setUnitDrawerTab}
        onClose={() => setUnitSelection(null)}
        onTenantClick={handleTenantClick}
      />
      <TenantDetailsDrawer selection={tenantSelection} onClose={() => setTenantSelection(null)} />
    </div>
  );
}
