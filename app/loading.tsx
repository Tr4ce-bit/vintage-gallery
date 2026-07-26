import { Skeleton, SkeletonProductCard } from "@/components/Skeleton";

// Suspense fallback for the homepage. Mirrors the actual sections in order:
//   Hero (dark, text + image) → Stats (4 tiles) → Collection ("The Drop.")
//   → About (story + pillars) → Newsletter (dark CTA)
// Footer is static so it renders immediately and doesn't need a skeleton.
export default function HomeLoading() {
  return (
    <main className="bg-white dark:bg-zinc-950">

      {/* ── 1. Hero panel — dark, two columns ────────────────────────────── */}
      <section className="relative min-h-screen bg-zinc-950 overflow-hidden flex items-end pb-14 md:pb-20">
        <div className="absolute right-0 top-0 bottom-0 w-full md:w-[56%]">
          <Skeleton className="w-full h-full !rounded-none !bg-zinc-900" />
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-xl">
            {/* Two huge headline bars — real text uses clamp(3.5rem, 9vw, 7.5rem)
                = 56px on mobile up to 120px on desktop. */}
            <Skeleton className="h-14 sm:h-20 md:h-28 lg:h-32 w-2/3 mb-4 !bg-zinc-900" />
            <Skeleton className="h-14 sm:h-20 md:h-28 lg:h-32 w-2/5 mb-10 !bg-zinc-900" />
            {/* Sub paragraph — text-base, max-w-sm, wraps to ~3 lines */}
            <div className="space-y-2 mb-10 max-w-sm">
              <Skeleton className="h-3 w-full !bg-zinc-900" />
              <Skeleton className="h-3 w-11/12 !bg-zinc-900" />
              <Skeleton className="h-3 w-3/4 !bg-zinc-900" />
            </div>
            {/* CTAs — two rounded-full pill buttons */}
            <div className="flex gap-3 flex-wrap">
              <Skeleton className="h-12 w-44 rounded-full !bg-zinc-900" />
              <Skeleton className="h-12 w-48 rounded-full !bg-zinc-900" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Stats strip — 4 tiles below hero ──────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-white dark:bg-zinc-950">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`py-9 flex flex-col items-center gap-2 ${i < 3 ? "border-r border-zinc-100 dark:border-zinc-800" : ""} border-b border-zinc-100 dark:border-zinc-800`}
          >
            {/* Stat value uses font-serif text-[2.2rem] (~35px) */}
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-2 w-20" />
          </div>
        ))}
      </div>

      {/* ── 3. Collection ("The Drop.") — headline + grid ────────────────── */}
      <section className="bg-white dark:bg-zinc-950 py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 border-b border-zinc-100 dark:border-zinc-800 pb-8">
            {/* "The Drop." headline uses clamp(2.5rem, 5vw, 4.5rem) — 40px to 72px */}
            <Skeleton className="h-10 sm:h-14 md:h-16 lg:h-20 w-48 md:w-64" />
            <Skeleton className="h-3 w-20 hidden md:block" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonProductCard key={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. About — off-white story block + dark pillars block ────────── */}
      <section>
        {/* Story block */}
        <div className="bg-zinc-50 dark:bg-zinc-900 py-20 md:py-28 px-5 md:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-5">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 md:h-12 w-3/4" />
              <Skeleton className="h-10 md:h-12 w-2/3" />
              <Skeleton className="h-3 w-full mt-6" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-10/12" />
            </div>
            <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          </div>
        </div>

        {/* Pillars block — 4 cards */}
        <div className="bg-zinc-950 py-20 md:py-28 px-5 md:px-8">
          <div className="max-w-7xl mx-auto">
            <Skeleton className="h-3 w-28 mb-3 !bg-zinc-900" />
            <Skeleton className="h-10 md:h-12 w-2/3 mb-12 !bg-zinc-900" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-zinc-800 rounded-2xl p-6 space-y-3">
                  <Skeleton className="h-3 w-8 !bg-zinc-900" />
                  <Skeleton className="h-4 w-3/4 !bg-zinc-900" />
                  <Skeleton className="h-3 w-full !bg-zinc-900" />
                  <Skeleton className="h-3 w-5/6 !bg-zinc-900" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Newsletter — dark rounded CTA card ────────────────────────── */}
      <section className="bg-white dark:bg-zinc-950 py-16 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-3xl bg-zinc-950 px-8 md:px-16 py-16 md:py-20">
            <Skeleton className="h-7 w-28 rounded-full !bg-zinc-900 mb-8" />
            <Skeleton className="h-10 md:h-14 w-3/4 !bg-zinc-900 mb-3" />
            <Skeleton className="h-10 md:h-14 w-1/2 !bg-zinc-900 mb-8" />
            <Skeleton className="h-3 w-80 !bg-zinc-900 mb-2" />
            <Skeleton className="h-3 w-64 !bg-zinc-900 mb-10" />
            <div className="flex flex-col sm:flex-row gap-2.5 max-w-md">
              <Skeleton className="h-12 flex-1 rounded-full !bg-zinc-900" />
              <Skeleton className="h-12 w-32 rounded-full !bg-zinc-900" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
