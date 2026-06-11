import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, UserPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { CreateTenantPayload } from '../hooks/useAdminTenants';
import type { PropertyRecord, TenantRowModel } from '../utils/tenantDerivedData';

type Mode = 'add' | 'edit';

interface TenantFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyId: string;
  nationalId: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof TenantFormValues, string>>;

const emptyForm: TenantFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  propertyId: '',
  nationalId: '',
  notes: '',
};

function splitName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? '',
    lastName: parts.slice(1).join(' '),
  };
}

function validate(values: TenantFormValues) {
  const errors: FormErrors = {};
  if (!values.firstName.trim()) errors.firstName = 'First name is required.';
  if (!values.lastName.trim()) errors.lastName = 'Last name is required.';
  if (!values.email.trim()) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (!values.phone.trim()) {
    errors.phone = 'Phone number is required.';
  } else if (!/^(\+254|0)[17]\d{8}$/.test(values.phone.trim().replace(/\s+/g, ''))) {
    errors.phone = 'Use a Kenyan phone number, for example 07XXXXXXXX or +2547XXXXXXXX.';
  }
  return errors;
}

function buildInitialForm(mode: Mode, tenant?: TenantRowModel | null): TenantFormValues {
  if (mode !== 'edit' || !tenant) return emptyForm;
  const split = splitName(tenant.fullName);
  return {
    firstName: tenant.tenant.firstName ?? split.firstName,
    lastName: tenant.tenant.lastName ?? split.lastName,
    email: tenant.email,
    phone: tenant.phone ?? '',
    propertyId: tenant.lease?.propertyId ?? tenant.tenant.propertyId ?? '',
    nationalId: tenant.tenant.nationalId ?? tenant.tenant.idNumber ?? tenant.tenant.passportNumber ?? '',
    notes: tenant.tenant.notes ?? '',
  };
}

export function TenantFormModal({
  isOpen,
  mode,
  tenant,
  properties,
  supportsEdit,
  supportsNationalId,
  supportsNotes,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  mode: Mode;
  tenant?: TenantRowModel | null;
  properties: PropertyRecord[];
  supportsEdit: boolean;
  supportsNationalId: boolean;
  supportsNotes: boolean;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: CreateTenantPayload) => void;
}) {
  const [form, setForm] = useState<TenantFormValues>(() => buildInitialForm(mode, tenant));
  const [errors, setErrors] = useState<FormErrors>({});

  const propertyOptions = useMemo(
    () => [
      { value: '', label: 'No property selected' },
      ...properties.map((property) => ({ value: property.id, label: property.name })),
    ],
    [properties]
  );

  function setField(field: keyof TenantFormValues, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: CreateTenantPayload = {
      name: `${form.firstName.trim()} ${form.lastName.trim()}`.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      propertyId: form.propertyId || undefined,
      nationalId: supportsNationalId && form.nationalId.trim() ? form.nationalId.trim() : undefined,
      notes: supportsNotes && form.notes.trim() ? form.notes.trim() : undefined,
    };

    onSubmit(payload);
  }

  const title = mode === 'add' ? 'Add Tenant' : 'Edit Tenant';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      {mode === 'edit' && !supportsEdit ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
            Tenant editing requires backend support.
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form className="animate-[fadeIn_160ms_ease-out] space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="First name*"
              value={form.firstName}
              error={errors.firstName}
              onChange={(event) => setField('firstName', event.target.value)}
            />
            <Input
              label="Last name*"
              value={form.lastName}
              error={errors.lastName}
              onChange={(event) => setField('lastName', event.target.value)}
            />
          </div>
          <Input
            label="Email*"
            type="email"
            value={form.email}
            error={errors.email}
            onChange={(event) => setField('email', event.target.value)}
          />
          <Input
            label="Phone*"
            type="tel"
            value={form.phone}
            error={errors.phone}
            hint="Use 07XXXXXXXX or +2547XXXXXXXX."
            onChange={(event) => setField('phone', event.target.value)}
          />
          <Select
            label="Property"
            value={form.propertyId}
            options={propertyOptions}
            onChange={(event) => setField('propertyId', event.target.value)}
          />
          {supportsNationalId && (
            <Input
              label="National ID / Passport"
              value={form.nationalId}
              onChange={(event) => setField('nationalId', event.target.value)}
            />
          )}
          {supportsNotes && (
            <div className="flex flex-col gap-1">
              <label htmlFor="tenant-notes" className="text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="tenant-notes"
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
              <UserPlus className="h-4 w-4" />
              {mode === 'add' ? 'Add Tenant' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
