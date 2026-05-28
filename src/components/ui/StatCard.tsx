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
        <p className="text-sm font-medium text-gray-500">{title}</p>
        {icon && (
          <span className="rounded-lg bg-blue-50 p-2 text-blue-600">{icon}</span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {trend && (
        <p
          className={clsx(
            'text-xs font-medium',
            trend.positive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {trend.positive ? '▲' : '▼'} {trend.value}
        </p>
      )}
    </Card>
  );
}
