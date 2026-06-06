/**
 * Reusable skeleton primitives. Pages compose these into layouts that mirror
 * the real content so the page doesn't jump when data arrives.
 *
 * Uses Tailwind's `animate-pulse` and zinc shades that work in light + dark.
 */

const BASE = "animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/60";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`${BASE} ${className}`} />;
}

/** N lines of text-shaped skeletons; the last line is shorter for realism. */
export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** Square card with image-area + two text rows. Use for product grids. */
export function SkeletonProductCard() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
      <Skeleton className="h-3 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  );
}
