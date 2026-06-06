/**
 * Skeleton primitives for the admin app. Same API as the store's, so pages
 * compose familiar shapes: <Skeleton />, <SkeletonText lines={n} />,
 * <SkeletonRow /> for table rows, <SkeletonKpi /> for the dashboard tiles.
 */

const BASE = "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-700/40";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`${BASE} ${className}`} />;
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

/** A KPI tile placeholder matching the analytics/payments page tiles. */
export function SkeletonKpi() {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-4">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-6 w-24" />
    </div>
  );
}

/** A single row placeholder for tabular pages. Renders as a flex row of cells. */
export function SkeletonRow({ cols = 5 }: { cols?: number }) {
  return (
    <div className="px-4 py-3 flex items-center gap-4 border-b border-zinc-50 dark:border-zinc-700/60">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === 0 ? "w-1/3" : "flex-1"}`} />
      ))}
    </div>
  );
}

/** Full card placeholder — header + body. Use for forms and detail pages. */
export function SkeletonCard({ rows = 4 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-2xl p-5">
      <Skeleton className="h-4 w-32 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-full" />
        ))}
      </div>
    </div>
  );
}
