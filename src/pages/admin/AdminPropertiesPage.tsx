import { type FormEvent, type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  Banknote,
  Building2,
  CheckCircle2,
  DoorOpen,
  Edit3,
  EllipsisVertical,
  Eye,
  FileText,
  Hammer,
  Home,
  HousePlus,
  Layers3,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { formatCurrency, formatDate } from '@/utils/formatting/formatters';
import { getStatusBadgeVariant } from '@/utils/formatting/statusBadge';

type StatusFilter = 'all' | 'active' | 'occupied' | 'available' | 'maintenance';
type PropertyStatus = Exclude<StatusFilter, 'all'>;
type PropertySection = 'overview' | 'units' | 'tenants' | 'leases' | 'payments' | 'maintenance';
type UnitStatus = 'occupied' | 'available' | 'reserved' | 'under_maintenance' | 'inactive';
type LeaseStatus = 'active' | 'pending' | 'expired' | 'terminated' | 'cancelled';
type PaymentStatus = 'confirmed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
type MaintenanceStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';

interface TenantRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  keycloakLinked: boolean;
}

interface UnitRecord {
  id: string;
  propertyId: string;
  unitNumber: string;
  unitType: string;
  floor: string;
  monthlyRent: number;
  depositAmount: number;
  status: UnitStatus;
  tenantId?: string;
}

interface LeaseRecord {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId: string;
  status: LeaseStatus;
  monthlyRent: number;
  startDate: string;
  endDate: string;
}

interface PaymentRecord {
  id: string;
  leaseId: string;
  tenantId: string;
  amount: number;
  status: PaymentStatus;
  method: string;
  transactionReference: string;
  paymentDate: string;
}

interface MaintenanceRecord {
  id: string;
  propertyId: string;
  unitId: string;
  tenantId?: string;
  title: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: MaintenanceStatus;
  reportedAt: string;
}

interface PropertyRecord {
  id: string;
  name: string;
  address: string;
  landlordId: string;
  landlordName: string;
  propertyType: string;
  totalUnits: number;
  occupiedUnits: number;
  monthlyRent: number;
  createdAt: string;
  updatedAt: string;
  units: UnitRecord[];
  leases: LeaseRecord[];
  payments: PaymentRecord[];
  maintenanceRequests: MaintenanceRecord[];
}

interface PropertyViewModel {
  property: PropertyRecord;
  availableUnits: number;
  activeTenants: TenantRecord[];
  activeLeases: LeaseRecord[];
  openMaintenance: number;
  confirmedPayments: number;
  expectedRent: number;
  status: PropertyStatus;
}

interface CreatePropertyForm {
  name: string;
  address: string;
  landlordId: string;
  propertyType: string;
  totalUnits: string;
  occupiedUnits: string;
  monthlyRent: string;
}

const statusFilters: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'occupied', label: 'Occupied' },
  { value: 'available', label: 'Available' },
  { value: 'maintenance', label: 'Maintenance' },
];

const propertySections: Array<{ value: PropertySection; label: string; icon: LucideIcon }> = [
  { value: 'overview', label: 'Overview', icon: Eye },
  { value: 'units', label: 'Units', icon: DoorOpen },
  { value: 'tenants', label: 'Tenants', icon: Users },
  { value: 'leases', label: 'Leases', icon: FileText },
  { value: 'payments', label: 'Payments', icon: Banknote },
  { value: 'maintenance', label: 'Maintenance', icon: Wrench },
];

const placeholderTenants: TenantRecord[] = [
  {
    id: 'TEN-101',
    name: 'Faith Njeri',
    email: 'faith.njeri@example.com',
    phone: '+254 700 123 456',
    keycloakLinked: true,
  },
  {
    id: 'TEN-102',
    name: 'Brian Mwangi',
    email: 'brian.mwangi@example.com',
    phone: '+254 711 234 567',
    keycloakLinked: true,
  },
  {
    id: 'TEN-201',
    name: 'Grace Wanjiku',
    email: 'grace.wanjiku@example.com',
    phone: '+254 722 345 678',
    keycloakLinked: false,
  },
];

const placeholderLandlords = [
  { id: 'LL-001', name: 'Felix Yator' },
  { id: 'LL-002', name: 'Amina Hassan' },
  { id: 'LL-003', name: 'David Otieno' },
];

const placeholderProperties: PropertyRecord[] = [
  {
    id: 'PROP-003',
    name: 'Yator Apartment',
    address: 'Ngong, Kajiado',
    landlordId: 'LL-001',
    landlordName: 'Felix Yator',
    propertyType: 'Residential',
    totalUnits: 38,
    occupiedUnits: 20,
    monthlyRent: 18000,
    createdAt: '2026-05-10',
    updatedAt: '2026-06-01',
    units: [
      {
        id: 'UNIT-301',
        propertyId: 'PROP-003',
        unitNumber: 'A-01',
        unitType: 'Bedsitter',
        floor: 'Ground',
        monthlyRent: 18000,
        depositAmount: 18000,
        status: 'occupied',
        tenantId: 'TEN-101',
      },
      {
        id: 'UNIT-302',
        propertyId: 'PROP-003',
        unitNumber: 'A-02',
        unitType: 'Bedsitter',
        floor: 'Ground',
        monthlyRent: 18000,
        depositAmount: 18000,
        status: 'occupied',
        tenantId: 'TEN-102',
      },
      {
        id: 'UNIT-303',
        propertyId: 'PROP-003',
        unitNumber: 'B-05',
        unitType: 'One Bedroom',
        floor: '2',
        monthlyRent: 25000,
        depositAmount: 25000,
        status: 'available',
      },
    ],
    leases: [
      {
        id: 'LSE-301',
        propertyId: 'PROP-003',
        unitId: 'UNIT-301',
        tenantId: 'TEN-101',
        status: 'active',
        monthlyRent: 18000,
        startDate: '2026-01-01',
        endDate: '2026-12-31',
      },
      {
        id: 'LSE-302',
        propertyId: 'PROP-003',
        unitId: 'UNIT-302',
        tenantId: 'TEN-102',
        status: 'active',
        monthlyRent: 18000,
        startDate: '2026-02-01',
        endDate: '2027-01-31',
      },
    ],
    payments: [
      {
        id: 'PAY-301',
        leaseId: 'LSE-301',
        tenantId: 'TEN-101',
        amount: 18000,
        status: 'confirmed',
        method: 'M-Pesa',
        transactionReference: 'QF12ABC34D',
        paymentDate: '2026-06-01',
      },
      {
        id: 'PAY-302',
        leaseId: 'LSE-302',
        tenantId: 'TEN-102',
        amount: 9000,
        status: 'pending',
        method: 'M-Pesa',
        transactionReference: 'QF98XYZ12K',
        paymentDate: '2026-06-02',
      },
    ],
    maintenanceRequests: [],
  },
  {
    id: 'PROP-001',
    name: 'Kilimani Heights',
    address: 'Kilimani, Nairobi',
    landlordId: 'LL-002',
    landlordName: 'Amina Hassan',
    propertyType: 'Residential',
    totalUnits: 24,
    occupiedUnits: 18,
    monthlyRent: 30000,
    createdAt: '2026-04-18',
    updatedAt: '2026-05-29',
    units: [
      {
        id: 'UNIT-101',
        propertyId: 'PROP-001',
        unitNumber: 'A-04',
        unitType: 'Two Bedroom',
        floor: '1',
        monthlyRent: 30000,
        depositAmount: 30000,
        status: 'occupied',
        tenantId: 'TEN-101',
      },
      {
        id: 'UNIT-102',
        propertyId: 'PROP-001',
        unitNumber: 'C-01',
        unitType: 'One Bedroom',
        floor: '3',
        monthlyRent: 24000,
        depositAmount: 24000,
        status: 'under_maintenance',
      },
    ],
    leases: [
      {
        id: 'LSE-101',
        propertyId: 'PROP-001',
        unitId: 'UNIT-101',
        tenantId: 'TEN-101',
        status: 'active',
        monthlyRent: 30000,
        startDate: '2025-10-01',
        endDate: '2026-09-30',
      },
    ],
    payments: [
      {
        id: 'PAY-101',
        leaseId: 'LSE-101',
        tenantId: 'TEN-101',
        amount: 30000,
        status: 'confirmed',
        method: 'Bank Transfer',
        transactionReference: 'BNK-778821',
        paymentDate: '2026-06-01',
      },
    ],
    maintenanceRequests: [
      {
        id: 'MNT-101',
        propertyId: 'PROP-001',
        unitId: 'UNIT-102',
        title: 'Bathroom water leak',
        priority: 'high',
        status: 'open',
        reportedAt: '2026-05-28',
      },
    ],
  },
  {
    id: 'PROP-002',
    name: 'Westlands Plaza',
    address: 'Westlands, Nairobi',
    landlordId: 'LL-003',
    landlordName: 'David Otieno',
    propertyType: 'Mixed use',
    totalUnits: 12,
    occupiedUnits: 9,
    monthlyRent: 42000,
    createdAt: '2026-03-05',
    updatedAt: '2026-05-20',
    units: [
      {
        id: 'UNIT-201',
        propertyId: 'PROP-002',
        unitNumber: 'P-11',
        unitType: 'Office',
        floor: '1',
        monthlyRent: 42000,
        depositAmount: 42000,
        status: 'occupied',
        tenantId: 'TEN-201',
      },
      {
        id: 'UNIT-202',
        propertyId: 'PROP-002',
        unitNumber: 'S-03',
        unitType: 'Shop',
        floor: 'Ground',
        monthlyRent: 55000,
        depositAmount: 55000,
        status: 'available',
      },
    ],
    leases: [
      {
        id: 'LSE-201',
        propertyId: 'PROP-002',
        unitId: 'UNIT-201',
        tenantId: 'TEN-201',
        status: 'active',
        monthlyRent: 42000,
        startDate: '2026-03-01',
        endDate: '2027-02-28',
      },
    ],
    payments: [
      {
        id: 'PAY-201',
        leaseId: 'LSE-201',
        tenantId: 'TEN-201',
        amount: 42000,
        status: 'confirmed',
        method: 'M-Pesa',
        transactionReference: 'QF45PLZ91A',
        paymentDate: '2026-06-01',
      },
    ],
    maintenanceRequests: [
      {
        id: 'MNT-201',
        propertyId: 'PROP-002',
        unitId: 'UNIT-201',
        tenantId: 'TEN-201',
        title: 'Air conditioning service',
        priority: 'medium',
        status: 'in_progress',
        reportedAt: '2026-05-24',
      },
    ],
  },
];

const emptyForm: CreatePropertyForm = {
  name: '',
  address: '',
  landlordId: '',
  propertyType: 'Residential',
  totalUnits: '',
  occupiedUnits: '',
  monthlyRent: '',
};

function initials(value?: string) {
  if (!value) return 'PR';

  return value
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function readableStatus(value: string) {
  return value.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusBadgeVariant(status: string): BadgeVariant {
  const normalized = status.toLowerCase();

  if (normalized === 'available') return 'info';
  if (normalized === 'occupied' || normalized === 'active' || normalized === 'confirmed') return 'success';
  if (normalized === 'maintenance' || normalized === 'under_maintenance' || normalized === 'open' || normalized === 'in_progress') {
    return 'warning';
  }

  return getStatusBadgeVariant(normalized);
}

function isOpenMaintenance(status: MaintenanceStatus) {
  return status === 'open' || status === 'in_progress';
}

function getPropertyStatus(property: PropertyRecord, openMaintenance: number, availableUnits: number): PropertyStatus {
  if (openMaintenance > 0 || property.units.some((unit) => unit.status === 'under_maintenance')) return 'maintenance';
  if (property.occupiedUnits > 0) return 'occupied';
  if (availableUnits > 0) return 'available';
  return 'active';
}

function propertySearchText(model: PropertyViewModel) {
  return [
    model.property.id,
    model.property.name,
    model.property.address,
    model.property.landlordName,
    model.property.propertyType,
    ...model.property.units.map((unit) => unit.unitNumber),
    ...model.activeTenants.map((tenant) => tenant.name),
    ...model.activeTenants.map((tenant) => tenant.email),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function buildPropertyModels(properties: PropertyRecord[]): PropertyViewModel[] {
  const tenantById = new Map(placeholderTenants.map((tenant) => [tenant.id, tenant]));

  return properties.map((property) => {
    const activeLeases = property.leases.filter((lease) => lease.status === 'active');
    const activeTenants = activeLeases
      .map((lease) => tenantById.get(lease.tenantId))
      .filter((tenant): tenant is TenantRecord => Boolean(tenant));
    const openMaintenance = property.maintenanceRequests.filter((request) => isOpenMaintenance(request.status)).length;
    const availableUnits = Math.max(property.totalUnits - property.occupiedUnits, 0);
    const confirmedPayments = property.payments
      .filter((payment) => payment.status === 'confirmed')
      .reduce((total, payment) => total + payment.amount, 0);
    const expectedRent = property.units.reduce((total, unit) => total + unit.monthlyRent, 0);

    return {
      property,
      availableUnits,
      activeTenants,
      activeLeases,
      openMaintenance,
      confirmedPayments,
      expectedRent,
      status: getPropertyStatus(property, openMaintenance, availableUnits),
    };
  });
}

function PropertyMetricChip({
  icon: Icon,
  label,
  value,
  tone = 'neutral',
}: {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  tone?: 'neutral' | 'success' | 'warning' | 'info';
}) {
  const toneClass = {
    neutral: 'bg-slate-50 text-slate-600 border-slate-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    info: 'bg-blue-50 text-blue-700 border-blue-100',
  }[tone];

  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', toneClass)}>
      <Icon size={13} />
      <span>{value}</span>
      <span className="font-medium opacity-80">{label}</span>
    </span>
  );
}

function PropertySummaryStrip({ models }: { models: PropertyViewModel[] }) {
  const summary = useMemo(
    () => ({
      total: models.length,
      occupied: models.filter((model) => model.status === 'occupied').length,
      available: models.filter((model) => model.status === 'available').length,
      maintenance: models.filter((model) => model.status === 'maintenance').length,
      units: models.reduce((total, model) => total + model.property.totalUnits, 0),
    }),
    [models]
  );

  return (
    <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryItem label="Total Properties" value={summary.total} icon={Building2} />
      <SummaryItem label="Occupied" value={summary.occupied} icon={DoorOpen} tone="success" />
      <SummaryItem label="Available" value={summary.available} icon={Home} tone="info" />
      <SummaryItem label="Maintenance" value={summary.maintenance} icon={Wrench} tone="warning" />
      <SummaryItem label="Total Units" value={summary.units} icon={Layers3} />
    </section>
  );
}

function SummaryItem({
  label,
  value,
  icon: Icon,
  tone = 'neutral',
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  tone?: 'neutral' | 'success' | 'warning' | 'info';
}) {
  const iconClass = {
    neutral: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    info: 'bg-blue-50 text-blue-700',
  }[tone];

  return (
    <article className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <span className={clsx('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', iconClass)}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-lg font-bold leading-none text-slate-900 dark:text-slate-100">{value}</p>
        <p className="mt-1 truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
    </article>
  );
}

function PropertyActions({
  onViewDetails,
  onUnits,
  onTenants,
}: {
  onViewDetails: () => void;
  onUnits: () => void;
  onTenants: () => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" size="sm" variant="outline" onClick={onViewDetails}>
        <Eye size={14} />
        View Details
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onUnits}>
        <DoorOpen size={14} />
        Units
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onTenants}>
        <Users size={14} />
        Tenants
      </Button>
      <Button type="button" size="sm" variant="outline">
        <Edit3 size={14} />
        Edit
      </Button>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          aria-label="More property actions"
        >
          <EllipsisVertical size={16} />
        </button>
        {isMenuOpen && (
          <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <SecondaryAction icon={Archive} label="Archive" />
            <SecondaryAction icon={Hammer} label="Mark as Maintenance" />
            <SecondaryAction icon={Trash2} label="Delete" danger />
          </div>
        )}
      </div>
    </div>
  );
}

function SecondaryAction({ icon: Icon, label, danger }: { icon: LucideIcon; label: string; danger?: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        'flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-950',
        danger ? 'text-red-600' : 'text-slate-600 dark:text-slate-300'
      )}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function PropertySectionTabs({
  activeSection,
  onChange,
}: {
  activeSection: PropertySection;
  onChange: (section: PropertySection) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {propertySections.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={clsx(
            'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
            activeSection === value
              ? 'border-[#006948] bg-[#006948] text-white'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
          )}
        >
          <Icon size={13} />
          {label}
        </button>
      ))}
    </div>
  );
}

function PropertyEmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</p>
      <p className="mx-auto mt-1 max-w-xl text-xs text-slate-500 dark:text-slate-400">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

function PropertyCard({ model, isHighlighted }: { model: PropertyViewModel; isHighlighted: boolean }) {
  const [activeSection, setActiveSection] = useState<PropertySection>('overview');
  const hasLinkingGap = model.property.occupiedUnits > 0 && (model.activeTenants.length === 0 || model.activeLeases.length === 0);

  return (
    <section
      className={clsx(
        'rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-slate-900',
        isHighlighted ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-100 dark:border-slate-800'
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#006948] to-slate-700 text-sm font-bold text-white">
            {initials(model.property.name)}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-bold text-slate-950 dark:text-slate-100">{model.property.name}</h2>
              <Badge variant={statusBadgeVariant(model.status)}>{readableStatus(model.status)}</Badge>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin size={14} className="shrink-0 text-slate-300" />
              <span className="truncate">{model.property.address}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-mono">{model.property.id}</span>
              <span>{model.property.landlordName}</span>
              <span>{model.property.propertyType}</span>
            </div>
          </div>
        </div>
        <PropertyActions
          onViewDetails={() => setActiveSection('overview')}
          onUnits={() => setActiveSection('units')}
          onTenants={() => setActiveSection('tenants')}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <PropertyMetricChip icon={Layers3} value={model.property.totalUnits} label="Units" />
        <PropertyMetricChip icon={DoorOpen} value={model.property.occupiedUnits} label="Occupied" tone="success" />
        <PropertyMetricChip icon={Home} value={model.availableUnits} label="Available" tone="info" />
        <PropertyMetricChip icon={Users} value={model.activeTenants.length} label="Tenants" />
        <PropertyMetricChip icon={FileText} value={model.activeLeases.length} label="Leases" />
        <PropertyMetricChip icon={Wrench} value={model.openMaintenance} label="Maintenance" tone={model.openMaintenance > 0 ? 'warning' : 'neutral'} />
        <PropertyMetricChip icon={Banknote} value={formatCurrency(model.expectedRent)} label="Expected Rent" />
        <PropertyMetricChip icon={CheckCircle2} value={formatCurrency(model.confirmedPayments)} label="Confirmed" tone="success" />
      </div>

      {hasLinkingGap && (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0" />
          Occupancy data exists, but tenant/lease records are not linked yet.
        </div>
      )}

      <div className="mt-4">
        <PropertySectionTabs activeSection={activeSection} onChange={setActiveSection} />
      </div>

      <div className="mt-4">
        <PropertySection model={model} section={activeSection} />
      </div>
    </section>
  );
}

function PropertySection({ model, section }: { model: PropertyViewModel; section: PropertySection }) {
  if (section === 'overview') return <OverviewSection model={model} />;
  if (section === 'units') return <UnitsSection model={model} />;
  if (section === 'tenants') return <TenantsSection tenants={model.activeTenants} />;
  if (section === 'leases') return <LeasesSection leases={model.property.leases} />;
  if (section === 'payments') return <PaymentsSection payments={model.property.payments} />;
  return <MaintenanceSection requests={model.property.maintenanceRequests} />;
}

function OverviewSection({ model }: { model: PropertyViewModel }) {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Property overview</p>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <InfoPair label="Property ID" value={model.property.id} />
          <InfoPair label="Owner/Landlord" value={model.property.landlordName} />
          <InfoPair label="Property Type" value={model.property.propertyType} />
          <InfoPair label="Base Monthly Rent" value={formatCurrency(model.property.monthlyRent)} />
          <InfoPair label="Created" value={formatDate(model.property.createdAt)} />
          <InfoPair label="Updated" value={formatDate(model.property.updatedAt)} />
        </dl>
      </div>
      <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Next action</p>
        <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Review unit occupancy and lease links.</p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Placeholder records are being used for now, so this view can be replaced with API data later without changing the layout.
        </p>
        <Button type="button" size="sm" className="mt-3">
          <Plus size={14} />
          Add Unit
        </Button>
      </div>
    </div>
  );
}

function InfoPair({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{value}</dd>
    </div>
  );
}

function UnitsSection({ model }: { model: PropertyViewModel }) {
  if (model.property.units.length === 0) {
    return (
      <PropertyEmptyState
        title="No units added yet."
        description="Add units to start tracking occupancy, rent, and tenants."
        action={
          <Button type="button" size="sm">
            <Plus size={14} />
            Add Unit
          </Button>
        }
      />
    );
  }

  const tenantById = new Map(placeholderTenants.map((tenant) => [tenant.id, tenant]));

  return (
    <ResponsiveTable
      headers={['Unit', 'Type', 'Floor', 'Status', 'Tenant', 'Rent', 'Deposit']}
      rows={model.property.units.map((unit) => [
        <span className="font-semibold text-slate-900 dark:text-slate-100">{unit.unitNumber}</span>,
        unit.unitType,
        unit.floor,
        <Badge variant={statusBadgeVariant(unit.status)}>{readableStatus(unit.status)}</Badge>,
        unit.tenantId ? tenantById.get(unit.tenantId)?.name ?? 'Tenant not linked' : 'Available',
        formatCurrency(unit.monthlyRent),
        formatCurrency(unit.depositAmount),
      ])}
    />
  );
}

function TenantsSection({ tenants }: { tenants: TenantRecord[] }) {
  if (tenants.length === 0) {
    return (
      <PropertyEmptyState
        title="Tenant records are not linked yet."
        description="Lease data has not connected this property to tenant records yet."
      />
    );
  }

  return (
    <ResponsiveTable
      headers={['Tenant', 'Email', 'Phone', 'Keycloak', 'Tenant ID']}
      rows={tenants.map((tenant) => [
        <span className="font-semibold text-slate-900 dark:text-slate-100">{tenant.name}</span>,
        tenant.email,
        tenant.phone,
        <Badge variant={tenant.keycloakLinked ? 'success' : 'warning'}>{tenant.keycloakLinked ? 'Linked' : 'Unlinked'}</Badge>,
        <span className="font-mono text-xs">{tenant.id}</span>,
      ])}
    />
  );
}

function LeasesSection({ leases }: { leases: LeaseRecord[] }) {
  if (leases.length === 0) {
    return (
      <PropertyEmptyState
        title="Lease data is not available yet."
        description="No leases are linked to this property. Create or link leases to track tenants, rent, and payment status."
      />
    );
  }

  return (
    <ResponsiveTable
      headers={['Lease ID', 'Unit ID', 'Tenant ID', 'Status', 'Monthly Rent', 'Start', 'End']}
      rows={leases.map((lease) => [
        <span className="font-mono text-xs">{lease.id}</span>,
        <span className="font-mono text-xs">{lease.unitId}</span>,
        <span className="font-mono text-xs">{lease.tenantId}</span>,
        <Badge variant={statusBadgeVariant(lease.status)}>{readableStatus(lease.status)}</Badge>,
        formatCurrency(lease.monthlyRent),
        formatDate(lease.startDate),
        formatDate(lease.endDate),
      ])}
    />
  );
}

function PaymentsSection({ payments }: { payments: PaymentRecord[] }) {
  if (payments.length === 0) {
    return (
      <PropertyEmptyState
        title="Payment records are not linked yet."
        description="No payment records can be matched to this property's leases or tenants yet."
      />
    );
  }

  return (
    <ResponsiveTable
      headers={['Payment ID', 'Amount', 'Status', 'Method', 'Reference', 'Date']}
      rows={payments.map((payment) => [
        <span className="font-mono text-xs">{payment.id}</span>,
        formatCurrency(payment.amount),
        <Badge variant={statusBadgeVariant(payment.status)}>{readableStatus(payment.status)}</Badge>,
        payment.method,
        payment.transactionReference,
        formatDate(payment.paymentDate),
      ])}
    />
  );
}

function MaintenanceSection({ requests }: { requests: MaintenanceRecord[] }) {
  if (requests.length === 0) {
    return (
      <PropertyEmptyState
        title="No maintenance records found."
        description="Maintenance requests linked to this property will appear here."
      />
    );
  }

  return (
    <ResponsiveTable
      headers={['Issue', 'Unit ID', 'Priority', 'Status', 'Reported']}
      rows={requests.map((request) => [
        request.title,
        <span className="font-mono text-xs">{request.unitId}</span>,
        <Badge variant={request.priority === 'high' || request.priority === 'urgent' ? 'danger' : request.priority === 'medium' ? 'warning' : 'neutral'}>
          {readableStatus(request.priority)}
        </Badge>,
        <Badge variant={statusBadgeVariant(request.status)}>{readableStatus(request.status)}</Badge>,
        formatDate(request.reportedAt),
      ])}
    />
  );
}

function ResponsiveTable({ headers, rows }: { headers: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-950">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-t border-slate-100 text-slate-600 hover:bg-slate-50/70 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3">
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

function createPlaceholderUnits(propertyId: string, totalUnits: number, occupiedUnits: number, monthlyRent: number): UnitRecord[] {
  return Array.from({ length: totalUnits }).map((_, index) => {
    const unitNumber = `U-${String(index + 1).padStart(2, '0')}`;

    return {
      id: `${propertyId}-UNIT-${String(index + 1).padStart(2, '0')}`,
      propertyId,
      unitNumber,
      unitType: 'Bedsitter',
      floor: index < 10 ? 'Ground' : String(Math.floor(index / 10)),
      monthlyRent,
      depositAmount: monthlyRent,
      status: index < occupiedUnits ? 'occupied' : 'available',
    };
  });
}

export default function AdminPropertiesPage() {
  const [properties, setProperties] = useState<PropertyRecord[]>(placeholderProperties);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState<CreatePropertyForm>(emptyForm);
  const [successMessage, setSuccessMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [highlightedPropertyId, setHighlightedPropertyId] = useState<string | null>(null);

  const models = useMemo(
    () =>
      buildPropertyModels(properties).sort((a, b) => {
        if (a.property.id === highlightedPropertyId) return -1;
        if (b.property.id === highlightedPropertyId) return 1;
        return b.property.createdAt.localeCompare(a.property.createdAt);
      }),
    [highlightedPropertyId, properties]
  );

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();

    return models.filter((model) => {
      const matchesSearch = !term || propertySearchText(model).includes(term);
      const matchesStatus = statusFilter === 'all' || model.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [models, search, statusFilter]);

  useEffect(() => {
    if (!highlightedPropertyId) return;

    const timer = window.setTimeout(() => setHighlightedPropertyId(null), 5000);
    return () => window.clearTimeout(timer);
  }, [highlightedPropertyId]);

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const totalUnits = Number(form.totalUnits);
    const occupiedUnits = Number(form.occupiedUnits || 0);
    const monthlyRent = Number(form.monthlyRent);

    if (!form.name.trim() || !form.address.trim()) {
      setFormError('Property name and address are required.');
      return;
    }

    if (!Number.isFinite(totalUnits) || totalUnits < 0 || !Number.isFinite(monthlyRent) || monthlyRent < 0) {
      setFormError('Enter valid total units and monthly rent values.');
      return;
    }

    if (!Number.isFinite(occupiedUnits) || occupiedUnits < 0 || occupiedUnits > totalUnits) {
      setFormError('Occupied units must be between 0 and total units.');
      return;
    }

    const landlord = placeholderLandlords.find((item) => item.id === form.landlordId);
    const createdId = `PROP-${String(properties.length + 1).padStart(3, '0')}`;
    const created: PropertyRecord = {
      id: createdId,
      name: form.name.trim(),
      address: form.address.trim(),
      landlordId: landlord?.id ?? '',
      landlordName: landlord?.name ?? 'Not assigned yet',
      propertyType: form.propertyType,
      totalUnits,
      occupiedUnits,
      monthlyRent,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      units: createPlaceholderUnits(createdId, totalUnits, occupiedUnits, monthlyRent),
      leases: [],
      payments: [],
      maintenanceRequests: [],
    };

    setProperties((current) => [created, ...current]);
    setHighlightedPropertyId(created.id);
    setSuccessMessage(`${created.name} added to placeholder data.`);
    setForm(emptyForm);
    setIsCreateOpen(false);
    setSearch('');
    setStatusFilter('all');
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Properties"
        description="Manage properties, units, tenants, leases, payments, and maintenance."
        actions={
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            <HousePlus size={14} />
            Add Property
          </Button>
        }
      />

      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
        Placeholder data is being used for now. API wiring can be re-enabled when the backend unit/property endpoints are ready.
      </div>

      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={16} />
          {successMessage}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
        <label className="relative min-w-[220px] flex-1">
          <span className="sr-only">Search current property list</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search properties, landlords, tenants, addresses..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#006948] focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatusFilter(filter.value)}
              className={clsx(
                'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                statusFilter === filter.value
                  ? 'border-[#006948] bg-[#006948] text-white'
                  : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <PropertySummaryStrip models={models} />

      {filteredModels.length === 0 ? (
        <EmptyState
          title="No properties found."
          description={search || statusFilter !== 'all' ? 'Try a different search term or status filter.' : 'Add a property to start tracking units, tenants, leases, payments, and maintenance.'}
          action={
            <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
              <HousePlus size={14} />
              Add Property
            </Button>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredModels.map((model) => (
            <PropertyCard key={model.property.id} model={model} isHighlighted={highlightedPropertyId === model.property.id} />
          ))}
        </div>
      )}

      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Add Property" size="lg">
        <form className="space-y-4" onSubmit={handleCreate}>
          <Input
            label="Property name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            placeholder="Yator Apartment"
            required
          />
          <Input
            label="Address"
            value={form.address}
            onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
            placeholder="Ngong, Kajiado"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Landlord"
              value={form.landlordId}
              onChange={(event) => setForm((current) => ({ ...current, landlordId: event.target.value }))}
              options={[
                { value: '', label: 'No landlord selected' },
                ...placeholderLandlords.map((landlord) => ({ value: landlord.id, label: landlord.name })),
              ]}
            />
            <Select
              label="Property type"
              value={form.propertyType}
              onChange={(event) => setForm((current) => ({ ...current, propertyType: event.target.value }))}
              options={[
                { value: 'Residential', label: 'Residential' },
                { value: 'Mixed use', label: 'Mixed use' },
                { value: 'Commercial', label: 'Commercial' },
              ]}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Input
              label="Total units"
              type="number"
              min={0}
              value={form.totalUnits}
              onChange={(event) => setForm((current) => ({ ...current, totalUnits: event.target.value }))}
              required
            />
            <Input
              label="Occupied units"
              type="number"
              min={0}
              value={form.occupiedUnits}
              onChange={(event) => setForm((current) => ({ ...current, occupiedUnits: event.target.value }))}
            />
            <Input
              label="Monthly rent"
              type="number"
              min={0}
              value={form.monthlyRent}
              onChange={(event) => setForm((current) => ({ ...current, monthlyRent: event.target.value }))}
              required
            />
          </div>

          {formError && (
            <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <HousePlus size={14} />
              Save property
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
