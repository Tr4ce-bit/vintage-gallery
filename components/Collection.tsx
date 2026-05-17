"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Heart, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { PRODUCTS, type Product } from "@/lib/products";
import { useCartStore } from "@/lib/store";

// products prop is optional — falls back to hardcoded PRODUCTS if not provided

// ─── Photo card ───────────────────────────────────────────────────────────────

function PhotoCard({ p, i, featured }: { p: Product; i: number; featured?: boolean }) {
  const [liked, setLiked]   = useState(false);
  const [size, setSize]     = useState("");
  const [added, setAdded]   = useState(false);
  const addItem             = useCartStore((s) => s.addItem);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    const selectedSize = size || p.sizes[2]; // default to M
    addItem({
      productId: p.id,
      slug: p.slug,
      name: p.name,
      collection: p.collection,
      price: p.price,
      image: p.image,
      size: selectedSize,
      color: p.color,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl bg-zinc-100 ${
        featured
          ? "md:col-span-2 md:row-span-2 min-h-[280px] sm:min-h-[420px] md:min-h-[520px]"
          : "min-h-[260px] sm:min-h-[380px]"
      }`}
    >
      <Link href={`/product/${p.slug}`} className="absolute inset-0 z-10" aria-label={`View ${p.name}`} />

      {/* Photo */}
      <Image
        src={p.image}
        alt={p.name}
        fill
        priority={i === 0}
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
      />

      {/* Gradient + info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-white/45 font-light mb-1.5">{p.collection}</p>
            <h3 className="font-serif text-white leading-tight mb-0.5" style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.6rem)", fontWeight: 300 }}>
              {p.name}
            </h3>
            <p className="font-sans text-white/50 text-sm font-light">GH₵ {p.price}</p>
          </div>

          {/* Hover actions */}
          <div className="flex flex-col items-end gap-2 relative z-30">
            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              {p.sizes.slice(0, 4).map((s) => (
                <button
                  key={s}
                  onClick={(e) => { e.preventDefault(); setSize((c) => (c === s ? "" : s)); }}
                  className={`font-sans text-[8px] w-7 h-7 rounded-full border flex items-center justify-center font-medium transition-all ${
                    size === s
                      ? "border-white bg-white text-zinc-900"
                      : "border-white/25 text-white/60 hover:border-white/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-white text-zinc-900 font-sans font-medium text-[10px] tracking-[0.15em] uppercase px-4 py-2.5 rounded-full hover:bg-zinc-100 transition-colors opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 duration-300 delay-75 whitespace-nowrap"
            >
              <ShoppingBag size={11} />
              {added ? "Added ✓" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>

      {/* Badge */}
      {p.badge && (
        <div className="absolute top-4 left-4 z-20">
          <span className="font-sans text-[9px] tracking-[0.15em] uppercase font-medium bg-white text-zinc-900 px-3 py-1 rounded-full">
            {p.badge}
          </span>
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); setLiked((l) => !l); }}
        className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-colors"
      >
        <Heart size={12} className={liked ? "fill-white text-white" : "text-white/70"} />
      </button>
    </motion.article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Collection({ products: propProducts }: { products?: Product[] }) {
  const hRef    = useRef(null);
  const hInView = useInView(hRef, { once: true, margin: "-10%" });
  const products = propProducts ?? PRODUCTS;

  return (
    <section id="collection" className="bg-white py-20 md:py-28 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={hRef} className="flex items-end justify-between mb-12 border-b border-zinc-100 pb-8">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={hInView ? { opacity: 1 } : {}}
              className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-3"
            >
              SS&apos;25 — Available Now
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={hInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-serif text-zinc-900 leading-none"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 300 }}
            >
              The Drop.
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={hInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Link
              href="/shop"
              className="hidden md:inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors group"
            >
              View All <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Product grid — real photos only */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((p, i) => (
            <PhotoCard key={p.id} p={p} i={i} featured={p.featured && products.length > 2} />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-10 text-center md:hidden">
          <Link href="/shop" className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.2em] uppercase text-zinc-500 border border-zinc-200 px-6 py-3 rounded-full">
            View All Pieces <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </section>
  );
}
