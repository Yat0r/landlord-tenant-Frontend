import { type ReactNode } from 'react';
import { Card } from './Card';
import { clsx } from 'clsx';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={clsx('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-brand-muted">{title}</p>
        {icon && (
          <span className="rounded-lg bg-brand-info p-2 text-brand-primary">{icon}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-brand-text">{value}</p>
      {trend && (
        <p
          className={clsx(
            'text-xs font-medium',
            trend.positive ? 'text-emerald-600' : 'text-brand-danger'
          )}
        >
          {trend.positive ? '▲' : '▼'} {trend.value}
        </p>
      )}
    </Card>
  );
}
