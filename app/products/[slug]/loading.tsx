import { Skeleton } from "@/components/Skeleton";

// Suspense fallback for /products/[slug] — mirrors the 2-column layout
// (gallery left, details right) so the page doesn't reflow on data arrival.
export default function ProductLoading() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[80px]">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">
        <Skeleton className="h-3 w-32 mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image gallery */}
          <div className="space-y-3">
            <Skeleton className="aspect-square w-full rounded-2xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-xl" />
              ))}
            </div>
          </div>

          {/* Product details */}
          <div className="space-y-6">
            <div>
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-10 w-3/4 mb-3" />
              <Skeleton className="h-7 w-32" />
            </div>

            <div className="space-y-2 pt-4">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>

            {/* Size pills */}
            <div className="pt-4">
              <Skeleton className="h-3 w-16 mb-3" />
              <div className="flex gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-11 w-12 rounded-full" />
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex gap-3 pt-6">
              <Skeleton className="h-12 flex-1 rounded-full" />
              <Skeleton className="h-12 w-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
