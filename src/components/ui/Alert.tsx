import { clsx } from 'clsx';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  className?: string;
}

const config: Record<AlertVariant, { icon: typeof Info; classes: string }> = {
  info: { icon: Info, classes: 'border-brand-info-border bg-brand-info text-brand-primary-dark' },
  success: { icon: CheckCircle2, classes: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  warning: { icon: AlertTriangle, classes: 'border-amber-200 bg-amber-50 text-amber-800' },
  danger: { icon: AlertCircle, classes: 'border-red-200 bg-red-50 text-red-800' },
};

export function Alert({ variant = 'info', title, children, className }: AlertProps) {
  const { icon: Icon, classes } = config[variant];

  return (
    <div className={clsx('flex gap-3 rounded-lg border p-4', classes, className)} role="alert">
      <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <div className="flex-1 text-sm">
        {title && <p className="mb-1 font-semibold">{title}</p>}
        <div>{children}</div>
      </div>
    </div>
  );
}
