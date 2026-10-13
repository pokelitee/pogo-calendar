import { Card } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg';

interface DataLoadingSkeletonProps {
  itemCount?: number;
  // Each item's width at a breakpoint, in twelfths: 12 is one column, 6 is two.
  gridSize?: { xs: number } & Partial<Record<Exclude<Breakpoint, 'xs'>, number>>;
}

// Full class names so Tailwind can find them; keyed by breakpoint, then span.
const COLUMN_CLASSES: Record<Breakpoint, Record<number, string>> = {
  xs: { 12: 'grid-cols-1', 6: 'grid-cols-2', 4: 'grid-cols-3', 3: 'grid-cols-4', 2: 'grid-cols-6' },
  sm: { 12: 'sm:grid-cols-1', 6: 'sm:grid-cols-2', 4: 'sm:grid-cols-3', 3: 'sm:grid-cols-4', 2: 'sm:grid-cols-6' },
  md: { 12: 'md:grid-cols-1', 6: 'md:grid-cols-2', 4: 'md:grid-cols-3', 3: 'md:grid-cols-4', 2: 'md:grid-cols-6' },
  lg: { 12: 'lg:grid-cols-1', 6: 'lg:grid-cols-2', 4: 'lg:grid-cols-3', 3: 'lg:grid-cols-4', 2: 'lg:grid-cols-6' },
};

const BREAKPOINTS: Breakpoint[] = ['xs', 'sm', 'md', 'lg'];

export const DataLoadingSkeleton = ({
  itemCount = 6,
  gridSize = { xs: 12, sm: 6, md: 4 },
}: DataLoadingSkeletonProps) => {
  const gridClass = BREAKPOINTS.flatMap((breakpoint) => {
    const span = gridSize[breakpoint];
    return span ? [COLUMN_CLASSES[breakpoint][span]] : [];
  }).join(' ');

  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {Array.from({ length: itemCount }).map((_, index) => (
        <Card key={index} className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <Skeleton className="h-[60px] w-[60px] shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/5" />
              <Skeleton className="h-4 w-2/5" />
            </div>
          </div>
          <Skeleton className="mb-2 h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </Card>
      ))}
    </div>
  );
};
