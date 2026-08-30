import React from 'react';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = '',
  ...props
}) => (
  <div
    className={`animate-pulse rounded-xl bg-[#E5E5EA] dark:bg-[#2C2C2E] ${className}`}
    {...props}
  />
);

export const SkeletonCard: React.FC = () => (
  <div className="surface-card rounded-2xl p-6 space-y-4">
    <Skeleton className="h-5 w-1/3" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-16 w-full" />
    <div className="flex gap-2">
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-7 w-24" />
    </div>
  </div>
);
