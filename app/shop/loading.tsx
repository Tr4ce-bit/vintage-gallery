import { Skeleton, SkeletonProductCard } from "@/components/Skeleton";

// Suspense fallback for the /shop product grid.
export default function ShopLoading() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">
      {/* Header */}
      <section className="px-5 md:px-8 py-12 max-w-7xl mx-auto text-center">
        <Skeleton className="h-3 w-24 mx-auto mb-3" />
        <Skeleton className="h-12 w-72 mx-auto mb-4" />
        <Skeleton className="h-3 w-96 mx-auto" />
      </section>

      {/* Filter pills */}
      <div className="px-5 md:px-8 mb-10 max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
      </div>

      {/* Grid */}
      <section className="px-5 md:px-8 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonProductCard key={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
