import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, FilePlus2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { CreateLeasePayload } from '../hooks/useAdminLeases';
import type { LeaseRowModel, PropertyRecord, TenantRecord, UnitRecord } from '../utils/leaseDerivedData';

type Mode = 'create' | 'edit';

interface LeaseFormValues {
  tenantId: string;
  tenantSearch: string;
  propertyId: string;
  unitId: string;
  startDate: string;
  endDate: string;
  monthlyRent: string;
  depositAmount: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof LeaseFormValues, string>>;

const emptyForm: LeaseFormValues = {
  tenantId: '',
  tenantSearch: '',
  propertyId: '',
  unitId: '',
  startDate: '',
  endDate: '',
  monthlyRent: '',
  depositAmount: '',
  notes: '',
};

function unitLabel(unit: UnitRecord) {
  return unit.unitNumber ?? unit.number ?? unit.roomNumber ?? unit.name ?? unit.id ?? 'Unit';
}

function buildInitialForm(mode: Mode, lease?: LeaseRowModel | null): LeaseFormValues {
  if (mode !== 'edit' || !lease) return emptyForm;
  return {
    tenantId: lease.lease.tenantId,
    tenantSearch: '',
    propertyId: lease.lease.propertyId,
    unitId: lease.unit?.id ?? lease.unitLabel ?? '',
    startDate: lease.lease.startDate?.slice(0, 10) ?? '',
    endDate: lease.lease.endDate?.slice(0, 10) ?? '',
    monthlyRent: lease.monthlyRent === undefined ? '' : String(lease.monthlyRent),
    depositAmount: lease.deposit === undefined ? '' : String(lease.deposit),
    notes: lease.lease.notes ?? '',
  };
}

function validate(values: LeaseFormValues, hasUnitSupport: boolean) {
  const errors: FormErrors = {};
  const monthlyRent = Number(values.monthlyRent);
  const start = values.startDate ? new Date(values.startDate) : null;
  const end = values.endDate ? new Date(values.endDate) : null;

  if (!values.tenantId) errors.tenantId = 'Tenant is required.';
  if (!values.propertyId) errors.propertyId = 'Property is required.';
  if (!hasUnitSupport) errors.unitId = 'Unit data requires backend support.';
  if (hasUnitSupport && !values.unitId) errors.unitId = 'Unit is required.';
  if (!values.startDate) errors.startDate = 'Start date is required.';
  if (!values.endDate) errors.endDate = 'End date is required.';
  if (start && end && end <= start) errors.endDate = 'End date must be after start date.';
  if (!Number.isFinite(monthlyRent) || monthlyRent <= 0) errors.monthlyRent = 'Monthly rent must be greater than 0.';

  return errors;
}

export function LeaseFormModal({
  isOpen,
  mode,
  lease,
  tenants,
  properties,
  supportsEdit,
  supportsNotes,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  mode: Mode;
  lease?: LeaseRowModel | null;
  tenants: TenantRecord[];
  properties: PropertyRecord[];
  supportsEdit: boolean;
  supportsNotes: boolean;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: CreateLeasePayload) => void;
}) {
  const [form, setForm] = useState<LeaseFormValues>(() => buildInitialForm(mode, lease));
  const [errors, setErrors] = useState<FormErrors>({});

  const filteredTenants = useMemo(() => {
    const term = form.tenantSearch.trim().toLowerCase();
    if (!term) return tenants;
    return tenants.filter((tenant) => [tenant.name, tenant.email].join(' ').toLowerCase().includes(term));
  }, [form.tenantSearch, tenants]);

  const selectedProperty = properties.find((property) => property.id === form.propertyId);
  const propertyUnits = selectedProperty?.units ?? [];
  const hasUnitSupport = propertyUnits.length > 0;

  function setField(field: keyof LeaseFormValues, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'propertyId' ? { unitId: '' } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form, hasUnitSupport);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateLeasePayload = {
      tenantId: form.tenantId,
      propertyId: form.propertyId,
      unitId: form.unitId,
      startDate: form.startDate,
      endDate: form.endDate,
      monthlyRent: Number(form.monthlyRent),
      depositAmount: form.depositAmount ? Number(form.depositAmount) : undefined,
      notes: supportsNotes && form.notes.trim() ? form.notes.trim() : undefined,
    };

    onSubmit(payload);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'create' ? 'Create Lease' : 'Edit Lease'} size="md">
      {mode === 'edit' && !supportsEdit ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
            Lease editing requires backend support.
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            label="Search tenants"
            value={form.tenantSearch}
            placeholder="Search by name or email"
            onChange={(event) => setField('tenantSearch', event.target.value)}
          />
          <Select
            label="Tenant*"
            value={form.tenantId}
            error={errors.tenantId}
            options={[{ value: '', label: 'Select tenant' }, ...filteredTenants.map((tenant) => ({ value: tenant.id, label: `${tenant.name} (${tenant.email})` }))]}
            onChange={(event) => setField('tenantId', event.target.value)}
          />
          <Select
            label="Property*"
            value={form.propertyId}
            error={errors.propertyId}
            options={[{ value: '', label: 'Select property' }, ...properties.map((property) => ({ value: property.id, label: property.name }))]}
            onChange={(event) => setField('propertyId', event.target.value)}
          />
          {form.propertyId && !hasUnitSupport && (
            <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
              Unit data requires backend support.
            </div>
          )}
          {hasUnitSupport && (
            <Select
              label="Unit*"
              value={form.unitId}
              error={errors.unitId}
              options={[{ value: '', label: 'Select unit' }, ...propertyUnits.map((unit) => ({ value: unit.id ?? unitLabel(unit), label: unitLabel(unit) }))]}
              onChange={(event) => setField('unitId', event.target.value)}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Start date*"
              type="date"
              value={form.startDate}
              error={errors.startDate}
              onChange={(event) => setField('startDate', event.target.value)}
            />
            <Input
              label="End date*"
              type="date"
              value={form.endDate}
              error={errors.endDate}
              onChange={(event) => setField('endDate', event.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Monthly rent*"
              type="number"
              min={0}
              value={form.monthlyRent}
              error={errors.monthlyRent}
              onChange={(event) => setField('monthlyRent', event.target.value)}
            />
            <Input
              label="Deposit amount"
              type="number"
              min={0}
              value={form.depositAmount}
              onChange={(event) => setField('depositAmount', event.target.value)}
            />
          </div>
          {supportsNotes && (
            <div className="flex flex-col gap-1">
              <label htmlFor="lease-notes" className="text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="lease-notes"
                value={form.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-[#006948] focus:ring-2 focus:ring-[#006948]"
              />
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} className="rounded-xl bg-[#10B981] hover:bg-emerald-600">
              <FilePlus2 className="h-4 w-4" />
              Create Lease
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
