"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Heart, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const PRODUCTS = [
  { id: 1, name: "VG Monogram Tee",       tag: "Signature",  price: 280, originalPrice: null,  sizes: ["S","M","L","XL"],    badge: "Best Seller", badgeDark: true },
  { id: 2, name: "Heritage Drop Tee",     tag: "SS'25 Drop", price: 320, originalPrice: null,  sizes: ["S","M","L"],          badge: "New Arrival", badgeDark: false },
  { id: 3, name: "Gold Label Oversized",  tag: "Premium",    price: 350, originalPrice: 420,   sizes: ["M","L","XL","2XL"],   badge: "Limited",     badgeDark: false },
  { id: 4, name: "Accra Nights Hoodie",   tag: "Exclusive",  price: 480, originalPrice: null,  sizes: ["S","M","L","XL"],     badge: "Drop Soon",   badgeDark: false },
  { id: 5, name: "Vintage Archive Polo",  tag: "Archive",    price: 300, originalPrice: 360,   sizes: ["S","M","L"],          badge: "Sale",        badgeDark: true  },
  { id: 6, name: "Gallery Statement Tee", tag: "Art Series", price: 380, originalPrice: null,  sizes: ["M","L","XL"],         badge: "Exclusive",   badgeDark: false },
];

const FILTERS = ["All", "Tees", "Hoodies", "Polos", "Limited"];

function ProductCard({ p, i }: { p: typeof PRODUCTS[0]; i: number }) {
  const [liked, setLiked]   = useState(false);
  const [size, setSize]     = useState("");
  const [added, setAdded]   = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
      className="group"
    >
      {/* Image area — nested frame like Majlis */}
      <div className="relative aspect-[3/4] bg-vg-surface border border-vg-border overflow-hidden">

        {/* Nested inner border */}
        <div className="absolute inset-3 border border-white/[0.04] pointer-events-none z-10" />

        {/* VG watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-serif text-[9rem] font-light text-white/[0.03]">VG</span>
        </div>

        {/* Tee SVG placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 200 240" className="w-1/2 opacity-20" fill="none">
            <path
              d="M100 15 C100 15 76 20 58 36 L22 70 L50 84 L62 62 L62 225 L138 225 L138 62 L150 84 L178 70 L142 36 C124 20 100 15 100 15Z"
              stroke="white" strokeWidth="1" fill="rgba(255,255,255,0.02)"
            />
            <line x1="100" y1="37" x2="100" y2="210" stroke="white" strokeWidth="0.5" strokeDasharray="3 5" opacity="0.4" />
          </svg>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-vg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-4">
          <button
            onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
            className="btn-primary !text-[10px] !px-6 !py-3"
          >
            <ShoppingBag size={12} />
            {added ? "Added!" : "Add to Cart"}
          </button>
          <Link href="#" className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors flex items-center gap-1">
            View Details <ArrowUpRight size={10} />
          </Link>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4 z-20">
          <span className={`font-sans text-[9px] tracking-[0.2em] uppercase font-medium px-2.5 py-1 ${p.badgeDark ? "bg-white text-vg-ink" : "border border-white/25 text-white/60"}`}>
            {p.badge}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setLiked(l => !l)}
          className="absolute top-4 right-4 z-20 w-8 h-8 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors"
        >
          <Heart size={11} className={liked ? "fill-white text-white" : "text-white/30"} />
        </button>
      </div>

      {/* Card details */}
      <div className="pt-5 pb-6">
        <p className="font-sans text-[8px] tracking-[0.4em] uppercase text-white/25 mb-1 font-light">{p.tag}</p>
        <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="font-serif text-white text-[1.15rem] font-light leading-snug">{p.name}</h3>
          <div className="text-right shrink-0">
            <p className="font-serif text-white text-lg font-light">GH₵ {p.price}</p>
            {p.originalPrice && (
              <p className="font-sans text-[10px] text-white/20 line-through">GH₵ {p.originalPrice}</p>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex gap-1.5 mb-5">
          {p.sizes.map(s => (
            <button
              key={s}
              onClick={() => setSize(c => c === s ? "" : s)}
              className={`font-sans text-[9px] w-8 h-8 flex items-center justify-center border font-medium tracking-wide transition-all duration-200 ${
                size === s
                  ? "border-white bg-white text-vg-black"
                  : "border-vg-border text-white/25 hover:border-white/30 hover:text-white/50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Add btn */}
        <button
          onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
          className="w-full py-3 border border-vg-border font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 font-light hover:border-white hover:text-white transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingBag size={11} />
          {added ? "Added" : "Add to Cart"}
        </button>
      </div>
    </motion.article>
  );
}

export default function Collection() {
  const [filter, setFilter] = useState("All");
  const hRef    = useRef(null);
  const hInView = useInView(hRef, { once: true, margin: "-10%" });

  return (
    <section id="collection" className="bg-vg-black py-28 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={hRef} className="mb-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={hInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
                className="font-sans text-[10px] tracking-[0.45em] uppercase text-white/30 font-light mb-5"
              >
                SS&apos;25 Collection
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={hInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.75, delay: 0.1 }}
                className="font-serif text-[clamp(3rem,6vw,5.5rem)] text-white leading-none"
                style={{ fontWeight: 300 }}
              >
                The Drop.
              </motion.h2>
            </div>

            {/* Filter tabs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={hInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`font-sans text-[9px] tracking-[0.3em] uppercase px-4 py-2.5 border font-light transition-all duration-200 ${
                    filter === f
                      ? "border-white bg-white text-vg-black"
                      : "border-vg-border text-white/30 hover:border-white/25 hover:text-white/55"
                  }`}
                >
                  {f}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Hairline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={hInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-vg-border origin-left"
          />
        </div>

        {/* Grid — gap-based, no bg-border trick to preserve card look */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {PRODUCTS.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>

        {/* Footer row */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-16 pt-10 border-t border-vg-border flex items-center justify-between"
        >
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/20 font-light">6 of 24 pieces</p>
          <Link
            href="/collection"
            className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 hover:text-white transition-colors duration-200 flex items-center gap-1.5 group"
          >
            View All
            <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
