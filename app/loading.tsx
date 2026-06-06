import { Skeleton, SkeletonProductCard } from "@/components/Skeleton";

// Suspense fallback for the homepage. Mirrors the actual hero panel + the
// 6-card collection grid below it so the layout never jumps when data arrives.
export default function HomeLoading() {
  return (
    <main className="bg-white dark:bg-zinc-950">
      {/* Hero panel — dark, two columns of text + image */}
      <section className="relative min-h-screen bg-zinc-950 overflow-hidden flex items-end pb-14 md:pb-20">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[56%]">
          <Skeleton className="w-full h-full !rounded-none bg-zinc-900" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-xl space-y-6">
            <Skeleton className="h-16 w-3/4 bg-zinc-900" />
            <Skeleton className="h-16 w-1/2 bg-zinc-900" />
            <Skeleton className="h-3 w-72 bg-zinc-900 mt-4" />
            <Skeleton className="h-3 w-60 bg-zinc-900" />
            <div className="flex gap-3 mt-8">
              <Skeleton className="h-12 w-40 rounded-full bg-zinc-900" />
              <Skeleton className="h-12 w-44 rounded-full bg-zinc-900" />
            </div>
          </div>
        </div>
      </section>

      {/* Collection grid */}
      <section className="px-5 md:px-8 py-20 max-w-7xl mx-auto">
        <Skeleton className="h-3 w-28 mb-3" />
        <Skeleton className="h-12 w-2/3 mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
