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
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
      <Construction className="h-10 w-10 text-gray-400" />
      <div>
        {feature && (
          <p className="font-semibold text-gray-700">{feature} — Coming Soon</p>
        )}
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}
