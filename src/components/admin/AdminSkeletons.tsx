import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => (
  <div
    className={cn('animate-pulse rounded-md bg-muted/60', className)}
    {...rest}
  />
);

export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({ rows = 8, cols = 6 }) => (
  <div className="overflow-hidden">
    <div className="grid gap-px bg-border/40" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {Array.from({ length: rows * cols }).map((_, i) => (
        <div key={i} className="bg-card px-4 py-3.5">
          <Skeleton className="h-3.5 w-[80%]" />
        </div>
      ))}
    </div>
  </div>
);

export const KpiSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <Card key={i} className="rounded-2xl border-border/50">
        <CardContent className="p-5 space-y-3">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-2.5 w-16" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const ListSkeleton: React.FC<{ rows?: number }> = ({ rows = 6 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/40">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-[40%]" />
          <Skeleton className="h-3 w-[60%]" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

export const DrawerSkeleton: React.FC = () => (
  <div className="space-y-4 p-4">
    <div className="flex items-center gap-3">
      <Skeleton className="h-14 w-14 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[60%]" />
        <Skeleton className="h-3 w-[40%]" />
      </div>
    </div>
    <KpiSkeleton count={4} />
    <ListSkeleton rows={5} />
  </div>
);
