import { Construction } from 'lucide-react';

interface PlannedStateProps {
  feature?: string;
  description?: string;
}

export function PlannedState({
  feature,
  description = 'This section is planned and will be available in a future release.',
}: PlannedStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-brand-border bg-brand-panel p-8 text-center">
      <Construction className="h-10 w-10 text-brand-info-border" />
      <div>
        {feature && (
          <p className="font-semibold text-brand-text">{feature} — Coming Soon</p>
        )}
        <p className="mt-1 text-sm text-brand-muted">{description}</p>
      </div>
    </div>
  );
}
