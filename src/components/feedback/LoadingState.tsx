import { Spinner } from '@/components/ui/Spinner';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-gray-500 dark:text-slate-400">
      <Spinner size="lg" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
