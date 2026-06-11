import { useState, type FormEvent } from 'react';
import { AlertTriangle, GitBranchPlus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { PaymentRowModel } from '../utils/paymentDerivedData';

export function PaymentAllocationModal({
  isOpen,
  payment,
  supportsAllocation,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  payment?: PaymentRowModel | null;
  supportsAllocation: boolean;
  isSaving?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit?: (amount: number) => void;
}) {
  const [amount, setAmount] = useState('');
  const [fieldError, setFieldError] = useState<string>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supportsAllocation) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setFieldError('Amount must be greater than 0.');
      return;
    }
    if (payment && numericAmount > payment.amount) {
      setFieldError('Amount cannot exceed the loaded payment amount.');
      return;
    }
    onSubmit?.(numericAmount);
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allocate Payment" size="md">
      {!supportsAllocation ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
            Payment allocation requires backend support.
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
            label="Amount to apply"
            type="number"
            min={0}
            value={amount}
            error={fieldError}
            onChange={(event) => {
              setAmount(event.target.value);
              setFieldError(undefined);
            }}
          />
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSaving} className="rounded-xl bg-[#10B981] hover:bg-emerald-600">
              <GitBranchPlus className="h-4 w-4" />
              Allocate
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
