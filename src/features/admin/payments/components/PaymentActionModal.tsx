import { AlertTriangle, CheckCircle2, Receipt, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { PaymentRowModel } from '../utils/paymentDerivedData';

type PaymentAction = 'confirm' | 'refund' | 'receipt';

const actionCopy: Record<PaymentAction, { title: string; unsupported: string; action: string }> = {
  confirm: {
    title: 'Confirm payment?',
    unsupported: 'Payment confirmation requires backend support.',
    action: 'Confirm Payment',
  },
  refund: {
    title: 'Refund payment?',
    unsupported: 'Payment refund requires backend support.',
    action: 'Refund Payment',
  },
  receipt: {
    title: 'Receipt action',
    unsupported: 'Receipt generation requires backend support.',
    action: 'Generate Receipt',
  },
};

export function PaymentActionModal({
  action,
  payment,
  isOpen,
  supportsAction,
  isSaving,
  error,
  onClose,
  onSubmit,
}: {
  action: PaymentAction;
  payment?: PaymentRowModel | null;
  isOpen: boolean;
  supportsAction: boolean;
  isSaving?: boolean;
  error?: string;
  onClose: () => void;
  onSubmit?: () => void;
}) {
  const copy = actionCopy[action];
  const Icon = action === 'confirm' ? CheckCircle2 : action === 'refund' ? RotateCcw : Receipt;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={copy.title} size="md">
      {!supportsAction ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
            {copy.unsupported}
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            {action === 'refund'
              ? 'This may affect rent balance or allocations depending on backend rules.'
              : `This action will be submitted for payment ${payment?.reference ?? ''}.`}
          </p>
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
            <Button
              type="button"
              isLoading={isSaving}
              onClick={onSubmit}
              className={action === 'refund' ? 'rounded-xl bg-brand-danger hover:bg-brand-danger-hover' : 'rounded-xl bg-brand-primary hover:bg-brand-primary-hover'}
            >
              <Icon className="h-4 w-4" />
              {copy.action}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
