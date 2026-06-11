import { useState, type FormEvent } from 'react';
import { AlertTriangle, Ban, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { LeaseRowModel } from '../utils/leaseDerivedData';

type ActionType = 'renew' | 'terminate';

export function LeaseActionModal({
  action,
  lease,
  isOpen,
  supportsAction,
  isSaving,
  error,
  onClose,
  onRenew,
  onTerminate,
}: {
  action: ActionType;
  lease?: LeaseRowModel | null;
  isOpen: boolean;
  supportsAction: boolean;
  isSaving?: boolean;
  error?: string;
  onClose: () => void;
  onRenew?: (newEndDate: string) => void;
  onTerminate?: () => void;
}) {
  const [newEndDate, setNewEndDate] = useState('');
  const [fieldError, setFieldError] = useState<string>();
  const isRenew = action === 'renew';
  const title = isRenew ? 'Renew Lease' : 'Terminate this lease?';

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supportsAction) return;

    if (isRenew) {
      if (!newEndDate) {
        setFieldError('New end date is required.');
        return;
      }
      onRenew?.(newEndDate);
      return;
    }

    onTerminate?.();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="md">
      {!supportsAction ? (
        <div className="space-y-4">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm font-medium text-slate-600">
            {isRenew ? 'Lease renewal requires backend support.' : 'Lease termination requires backend support.'}
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form className="space-y-4" onSubmit={handleSubmit}>
          {isRenew ? (
            <Input
              label="New end date*"
              type="date"
              value={newEndDate}
              error={fieldError}
              min={lease?.lease.endDate?.slice(0, 10)}
              onChange={(event) => {
                setNewEndDate(event.target.value);
                setFieldError(undefined);
              }}
            />
          ) : (
            <p className="text-sm text-slate-600">
              The lease will be marked as Terminated. Depending on backend rules, the unit may be released for re-letting.
              This action cannot be undone from this interface.
            </p>
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
            <Button
              type="submit"
              isLoading={isSaving}
              className={isRenew ? 'rounded-xl bg-[#10B981] hover:bg-emerald-600' : 'rounded-xl bg-[#F43F5E] hover:bg-rose-600'}
            >
              {isRenew ? <RefreshCw className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
              {isRenew ? 'Renew' : 'Terminate'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
