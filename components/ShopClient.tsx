"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store";
import Footer from "@/components/Footer";
import type { Product } from "@/lib/products";

const FILTERS = ["All", "HOPE Collection", "Icons Series", "Limited Drops", "New Arrivals"];

export default function ShopClient({ products }: { products: Product[] }) {
  const { isSignedIn } = useAuth();
  const addItem        = useCartStore((s) => s.addItem);
  const searchParams   = useSearchParams();

  const [active,    setActive]    = useState("All");
  const [liked,     setLiked]     = useState<Record<string, boolean>>({});
  const [added,     setAdded]     = useState<Record<string, boolean>>({});
  const [authToast, setAuthToast] = useState(false);

  // Pre-set filter from URL ?filter=HOPE+Collection
  useEffect(() => {
    const f = searchParams.get("filter");
    if (f && FILTERS.includes(f)) setActive(f);
  }, [searchParams]);

  const filtered = active === "All"
    ? products
    : active === "New Arrivals"
      ? products.filter((p) => p.badge === "New" || p.featured)
      : active === "Limited Drops"
        ? products.filter((p) => p.badge === "Limited" || p.badge === "Sold Out")
        : products.filter((p) => p.collection === active);

  const handleAdd = (e: React.MouseEvent, p: Product) => {
    e.preventDefault();
    addItem({
      productId:  p.id,
      slug:       p.slug,
      name:       p.name,
      collection: p.collection,
      price:      p.price,
      image:      p.image,
      size:       p.sizes[2] ?? p.sizes[0],
      color:      p.color,
    });
    setAdded((prev) => ({ ...prev, [p.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [p.id]: false })), 1800);
  };

  const handleWishlist = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!isSignedIn) {
      setAuthToast(true);
      setTimeout(() => setAuthToast(false), 3000);
      return;
    }
    setLiked((l) => ({ ...l, [id]: !l[id] }));
  };

  return (
    <>
      <main className="min-h-screen bg-white dark:bg-zinc-950 pt-[60px]">

        {/* Header */}
        <div className="border-b border-zinc-100 dark:border-zinc-800 px-5 md:px-8 py-14">
          <div className="max-w-7xl mx-auto">
            <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-3">
              SS&apos;25 — Available Now
            </p>
            <h1 className="font-serif text-zinc-900 dark:text-zinc-50 leading-none"
              style={{ fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300 }}>
              The Collection.
            </h1>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-5 md:px-8 py-10">

          {/* Filter bar */}
          <div className="flex items-center gap-2 flex-wrap mb-10">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`font-sans text-[10px] tracking-[0.2em] uppercase px-5 py-2 rounded-full border transition-all duration-200 font-light ${
                  active === f
                    ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 border-zinc-900 dark:border-white"
                    : "border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200"
                }`}
              >
                {f}
              </button>
            ))}
            <span className="font-sans text-[10px] text-zinc-400 dark:text-zinc-500 font-light ml-2">
              {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
            </span>
          </div>

          {/* Grid */}
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((p) => (
                <motion.article
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="group relative"
                >
                  <Link href={`/product/${p.slug}`}
                    className="block relative overflow-hidden rounded-2xl bg-zinc-100 dark:bg-zinc-800"
                    style={{ aspectRatio: "3/4" }}>
                    <Image src={p.image} alt={p.name} fill
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {p.badge && (
                      <span className="absolute top-3 left-3 font-sans text-[9px] tracking-[0.15em] uppercase font-medium bg-white text-zinc-900 px-3 py-1 rounded-full">
                        {p.badge}
                      </span>
                    )}

                    <button
                      onClick={(e) => handleWishlist(e, p.id)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Heart size={12} className={liked[p.id] ? "fill-zinc-900 text-zinc-900" : "text-zinc-400"} />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button onClick={(e) => handleAdd(e, p)}
                        className="w-full flex items-center justify-center gap-2 bg-white text-zinc-900 font-sans font-medium text-[10px] tracking-[0.15em] uppercase py-3 rounded-full hover:bg-zinc-100 transition-colors">
                        <ShoppingBag size={12} />
                        {added[p.id] ? "Added ✓" : `Quick Add · ${p.sizes[2] ?? p.sizes[0]}`}
                      </button>
                    </div>
                  </Link>

                  <div className="mt-4 px-1">
                    <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 dark:text-zinc-500 font-light mb-1">{p.collection}</p>
                    <div className="flex items-start justify-between">
                      <Link href={`/product/${p.slug}`}
                        className="font-serif text-zinc-900 dark:text-zinc-100 text-xl font-light hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">
                        {p.name}
                      </Link>
                      <span className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light mt-1 shrink-0 ml-3">GH₵ {p.price}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2.5">
                      {p.sizes.map((s) => (
                        <span key={s} className="font-sans text-[8px] text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>

      <Footer />

      {/* Auth toast */}
      <AnimatePresence>
        {authToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 shadow-xl whitespace-nowrap"
          >
            <span className="font-sans text-sm text-zinc-300 font-light">Sign in to save to wishlist</span>
            <Link href="/sign-in"
              className="font-sans text-[10px] tracking-[0.15em] uppercase bg-white text-zinc-900 px-4 py-1.5 rounded-full font-medium hover:bg-zinc-100 transition-colors">
              Sign In
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
