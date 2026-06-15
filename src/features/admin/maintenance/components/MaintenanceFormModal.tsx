import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, Wrench } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { MaintenanceRowModel } from '../utils/maintenanceDerivedData';
import type { MaintenanceRequestPayload } from '../hooks/useAdminMaintenance';
import type { PropertyRecord, TenantRecord } from '../utils/maintenanceDerivedData';

type MaintenanceMode = 'create' | 'edit';

interface MaintenanceFormValues {
  tenantId: string;
  propertyId: string;
  propertyUnit: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  notes: string;
  status: string;
}

type FormErrors = Partial<Record<keyof MaintenanceFormValues, string>>;

const emptyValues: MaintenanceFormValues = {
  tenantId: '',
  propertyId: '',
  propertyUnit: '',
  title: '',
  description: '',
  priority: '',
  category: '',
  notes: '',
  status: '',
};

const priorityOptions = [
  { value: '', label: 'Select priority' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const statusOptions = [
  { value: '', label: 'Keep current status' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
];

function mapValues(row?: MaintenanceRowModel | null): MaintenanceFormValues {
  if (!row) return emptyValues;
  return {
    tenantId: row.request.tenantId ?? row.tenant?.id ?? '',
    propertyId: row.request.propertyId ?? row.property?.id ?? '',
    propertyUnit: row.request.propertyUnit ?? row.unitLabel ?? '',
    title: row.request.title ?? row.title ?? '',
    description: row.request.description ?? row.summary ?? '',
    priority: row.request.priority ?? '',
    category: row.category ?? row.issueType ?? '',
    notes: 'notes' in row.request ? row.request.notes ?? '' : '',
    status: row.request.status ?? row.status ?? '',
  };
}

function validate(mode: MaintenanceMode, values: MaintenanceFormValues) {
  const errors: FormErrors = {};

  if (!values.tenantId) errors.tenantId = 'Tenant is required.';
  if (!values.propertyId) errors.propertyId = 'Property is required.';
  if (!values.title.trim()) errors.title = 'Title is required.';
  if (!values.description.trim()) errors.description = 'Description is required.';
  if (!values.priority) errors.priority = 'Priority is required.';
  if (mode === 'edit' && !values.status) errors.status = 'Status is required.';

  return errors;
}

export function MaintenanceFormModal({
  isOpen,
  mode,
  request,
  tenants,
  properties,
  isSaving,
  error,
  supportsEdit,
  supportsStatusUpdate,
  supportsNotes,
  supportsCategory,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  mode: MaintenanceMode;
  request?: MaintenanceRowModel | null;
  tenants: TenantRecord[];
  properties: PropertyRecord[];
  isSaving: boolean;
  error?: string;
  supportsEdit: boolean;
  supportsStatusUpdate: boolean;
  supportsNotes: boolean;
  supportsCategory: boolean;
  onClose: () => void;
  onSubmit: (payload: MaintenanceRequestPayload) => void;
}) {
  const [form, setForm] = useState<MaintenanceFormValues>(() => mapValues(request));
  const [errors, setErrors] = useState<FormErrors>({});

  const title = mode === 'create' ? 'New Maintenance Request' : 'Edit Maintenance Request';
  const unitHints = useMemo(
    () =>
      Array.from(
        new Set(
          properties
            .flatMap((property) => [property.name, property.address])
            .filter((value): value is string => Boolean(value))
        )
      ),
    [properties]
  );

  function setField(field: keyof MaintenanceFormValues, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (mode === 'edit' && !supportsEdit) return;

    const nextErrors = validate(mode, form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: MaintenanceRequestPayload = {
      tenantId: form.tenantId,
      propertyId: form.propertyId,
      propertyUnit: form.propertyUnit.trim() || undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      category: supportsCategory && form.category.trim() ? form.category.trim() : undefined,
      notes: supportsNotes && form.notes.trim() ? form.notes.trim() : undefined,
      status: mode === 'edit' && supportsStatusUpdate && form.status ? form.status : undefined,
    };

    onSubmit(payload);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      {!supportsEdit && mode === 'edit' ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
            Maintenance editing requires backend support.
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Tenant*"
              value={form.tenantId}
              error={errors.tenantId}
              options={[
                { value: '', label: 'Select tenant' },
                ...tenants.map((tenant) => ({
                  value: tenant.id,
                  label: `${tenant.name}${tenant.email ? ` • ${tenant.email}` : ''}`,
                })),
              ]}
              onChange={(event) => setField('tenantId', event.target.value)}
            />
            <Select
              label="Property*"
              value={form.propertyId}
              error={errors.propertyId}
              options={[
                { value: '', label: 'Select property' },
                ...properties.map((property) => ({
                  value: property.id,
                  label: property.name,
                })),
              ]}
              onChange={(event) => setField('propertyId', event.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Unit"
              value={form.propertyUnit}
              onChange={(event) => setField('propertyUnit', event.target.value)}
              hint={unitHints.length > 0 ? 'Use the currently loaded unit label or enter a custom one.' : 'Unit list requires backend support.'}
            />
            <Select
              label="Priority*"
              value={form.priority}
              error={errors.priority}
              options={priorityOptions}
              onChange={(event) => setField('priority', event.target.value)}
            />
          </div>

          <Input
            label="Title*"
            value={form.title}
            error={errors.title}
            onChange={(event) => setField('title', event.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="maintenance-description" className="text-sm font-medium text-gray-700">
              Description*
            </label>
            <textarea
              id="maintenance-description"
              value={form.description}
              onChange={(event) => setField('description', event.target.value)}
              className={errors.description
                ? 'min-h-28 w-full rounded-md border border-red-400 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500'
                : 'min-h-28 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary'}
            />
            {errors.description && <p className="text-xs text-red-600">{errors.description}</p>}
          </div>

          {supportsCategory && (
            <Input
              label="Category / Type"
              value={form.category}
              onChange={(event) => setField('category', event.target.value)}
            />
          )}

          {supportsNotes && (
            <div className="flex flex-col gap-1">
              <label htmlFor="maintenance-notes" className="text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="maintenance-notes"
                value={form.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary"
              />
            </div>
          )}

          {mode === 'edit' && supportsStatusUpdate && (
            <Select
              label="Status*"
              value={form.status}
              error={errors.status}
              options={statusOptions}
              onChange={(event) => setField('status', event.target.value)}
            />
          )}

          <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
            <div className="flex items-start gap-2">
              <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <p>
                Attachments, assignment, and workflow automation are not faked here. Only fields already supported by the backend are submitted.
              </p>
            </div>
          </div>

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
            <Button type="submit" isLoading={isSaving} className="rounded-2xl bg-brand-primary hover:bg-brand-primary-hover">
              {mode === 'create' ? 'Create Request' : 'Save Changes'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
