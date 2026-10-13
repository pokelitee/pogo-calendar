import { RefreshCw } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface AvailabilityNoticeProps {
  failedSources: string[];
  onRetry: () => void;
  className?: string;
}

/**
 * Warns that some data sets failed to load, so results may be incomplete.
 */
export function AvailabilityNotice({ failedSources, onRetry, className }: AvailabilityNoticeProps) {
  if (failedSources.length === 0) return null;
  return (
    <Alert variant="warning" className={cn('mb-6', className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span>
          Couldn’t load {failedSources.join(', ')}, so results may be incomplete.
        </span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw />
          Retry
        </Button>
      </div>
    </Alert>
  );
}
