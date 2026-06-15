import { useMemo, useState, type FormEvent } from 'react';
import { AlertTriangle, CreditCard } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { RecordPaymentPayload } from '../hooks/useAdminPayments';
import type { LeaseRecord, TenantRecord } from '../utils/paymentDerivedData';

interface PaymentFormValues {
  tenantId: string;
  leaseId: string;
  amount: string;
  method: string;
  transactionReference: string;
  paidDate: string;
  notes: string;
}

type FormErrors = Partial<Record<keyof PaymentFormValues, string>>;

const emptyForm: PaymentFormValues = {
  tenantId: '',
  leaseId: '',
  amount: '',
  method: '',
  transactionReference: '',
  paidDate: '',
  notes: '',
};

const methodOptions = [
  { value: '', label: 'Method not selected' },
  { value: 'Mpesa', label: 'M-Pesa' },
  { value: 'BankTransfer', label: 'Bank Transfer' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Other', label: 'Other' },
];

function validate(values: PaymentFormValues) {
  const errors: FormErrors = {};
  const amount = Number(values.amount);
  if (!values.tenantId) errors.tenantId = 'Tenant is required.';
  if (!values.leaseId) errors.leaseId = 'Lease is required.';
  if (!Number.isFinite(amount) || amount <= 0) errors.amount = 'Amount must be greater than 0.';
  if ((values.method === 'Mpesa' || values.method === 'BankTransfer') && !values.transactionReference.trim()) {
    errors.transactionReference = 'Transaction reference is required for M-Pesa and bank transfers.';
  }
  return errors;
}

export function PaymentFormModal({
  isOpen,
  tenants,
  leases,
  supportsNotes,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  tenants: TenantRecord[];
  leases: LeaseRecord[];
  supportsNotes: boolean;
  isSaving: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (payload: RecordPaymentPayload) => void;
}) {
  const [form, setForm] = useState<PaymentFormValues>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  const filteredLeases = useMemo(
    () => leases.filter((lease) => !form.tenantId || lease.tenantId === form.tenantId),
    [form.tenantId, leases]
  );

  function setField(field: keyof PaymentFormValues, value: string) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'tenantId' ? { leaseId: '' } : {}),
    }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: RecordPaymentPayload = {
      tenantId: form.tenantId,
      leaseId: form.leaseId,
      amount: Number(form.amount),
      method: form.method || undefined,
      paymentMethod: form.method || undefined,
      transactionReference: form.transactionReference.trim() || undefined,
      paidDate: form.paidDate || undefined,
      notes: supportsNotes && form.notes.trim() ? form.notes.trim() : undefined,
    };
    onSubmit(payload);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Payment" size="md">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Select
          label="Tenant*"
          value={form.tenantId}
          error={errors.tenantId}
          options={[{ value: '', label: 'Select tenant' }, ...tenants.map((tenant) => ({ value: tenant.id, label: `${tenant.name} (${tenant.email})` }))]}
          onChange={(event) => setField('tenantId', event.target.value)}
        />
        <Select
          label="Lease*"
          value={form.leaseId}
          error={errors.leaseId}
          options={[{ value: '', label: 'Select lease' }, ...filteredLeases.map((lease) => ({ value: lease.id, label: lease.reference ?? lease.leaseReference ?? lease.id }))]}
          onChange={(event) => setField('leaseId', event.target.value)}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount*"
            type="number"
            min={0}
            value={form.amount}
            error={errors.amount}
            onChange={(event) => setField('amount', event.target.value)}
          />
          <Select
            label="Payment method"
            value={form.method}
            options={methodOptions}
            onChange={(event) => setField('method', event.target.value)}
          />
        </div>
        <Input
          label="Transaction reference"
          value={form.transactionReference}
          error={errors.transactionReference}
          onChange={(event) => setField('transactionReference', event.target.value)}
        />
        <Input
          label="Payment date"
          type="datetime-local"
          value={form.paidDate}
          onChange={(event) => setField('paidDate', event.target.value)}
        />
        {supportsNotes && (
          <div className="flex flex-col gap-1">
            <label htmlFor="payment-notes" className="text-sm font-medium text-gray-700">
              Notes
            </label>
            <textarea
              id="payment-notes"
              value={form.notes}
              onChange={(event) => setField('notes', event.target.value)}
              className="min-h-24 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        )}
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500">
          This records a payment only. It does not trigger M-Pesa STK push, callbacks, receipt generation, or allocations.
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
          <Button type="submit" isLoading={isSaving} className="rounded-xl bg-brand-primary hover:bg-brand-primary-hover">
            <CreditCard className="h-4 w-4" />
            Record Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
