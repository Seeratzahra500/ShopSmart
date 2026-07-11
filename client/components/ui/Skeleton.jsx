'use client';

export default function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-[var(--radius-sm)] ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full rounded-[var(--radius-lg)] mb-3" />
      <Skeleton className="h-3.5 w-3/4 mb-2" />
      <Skeleton className="h-3.5 w-1/3" />
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--border)] p-5">
      <Skeleton className="h-3 w-20 mb-3" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}
