"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Heart, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: "VG Monogram Tee",
    tag: "Signature",
    price: 280,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    badge: "Best Seller",
    badgeStyle: "bg-white text-black",
    hot: true,
  },
  {
    id: 2,
    name: "Heritage Drop Tee",
    tag: "SS'25 Drop",
    price: 320,
    originalPrice: null,
    sizes: ["S", "M", "L"],
    badge: "New Arrival",
    badgeStyle: "bg-black text-white border border-white/20",
    hot: false,
  },
  {
    id: 3,
    name: "Gold Label Oversized",
    tag: "Premium",
    price: 350,
    originalPrice: 420,
    sizes: ["M", "L", "XL", "2XL"],
    badge: "Limited",
    badgeStyle: "border border-white/30 text-white/70",
    hot: true,
  },
  {
    id: 4,
    name: "Accra Nights Hoodie",
    tag: "Exclusive",
    price: 480,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    badge: "Drop Soon",
    badgeStyle: "bg-white/10 text-white/60",
    hot: false,
  },
  {
    id: 5,
    name: "Vintage Archive Polo",
    tag: "Archive",
    price: 300,
    originalPrice: 360,
    sizes: ["S", "M", "L"],
    badge: "Sale",
    badgeStyle: "bg-white text-black",
    hot: false,
  },
  {
    id: 6,
    name: "Gallery Statement Tee",
    tag: "Art Series",
    price: 380,
    originalPrice: null,
    sizes: ["M", "L", "XL"],
    badge: "Exclusive",
    badgeStyle: "border border-white/30 text-white/70",
    hot: true,
  },
];

const FILTERS = ["All", "Tees", "Hoodies", "Polos", "Limited"];

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ p, index }: { p: typeof PRODUCTS[0]; index: number }) {
  const [liked, setLiked]               = useState(false);
  const [size, setSize]                 = useState("");
  const [added, setAdded]               = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className="group relative border border-brand-border hover:border-white/40 transition-colors duration-400"
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] bg-brand-surface overflow-hidden flex items-center justify-center">

        {/* VG watermark */}
        <div className="absolute inset-0 flex items-center justify-center select-none pointer-events-none">
          <span className="font-heading text-[7rem] font-black text-white/[0.04]">VG</span>
        </div>

        {/* Centered monogram */}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center">
            <span className="font-heading text-xl text-white/40 font-bold">
              {p.name.split(" ").slice(0, 2).map(w => w[0]).join("")}
            </span>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleAdd}
            className="flex items-center gap-2 bg-white text-black text-[10px] tracking-[0.25em] uppercase font-semibold px-5 py-3 hover:bg-brand-off transition-colors"
          >
            <ShoppingBag size={13} />
            {added ? "Added!" : "Add to Cart"}
          </motion.button>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className={`text-[9px] tracking-[0.2em] uppercase font-semibold px-2.5 py-1 ${p.badgeStyle}`}>
            {p.badge}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setLiked(l => !l)}
          className="absolute top-3 right-3 w-8 h-8 bg-black/60 border border-white/10 flex items-center justify-center hover:border-white/30 transition-colors"
        >
          <Heart
            size={12}
            className={liked ? "fill-white text-white" : "text-white/30"}
          />
        </button>

        {/* Hot dot */}
        {p.hot && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[8px] tracking-[0.3em] uppercase text-white/40">Hot</span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-5 bg-brand-black">
        <p className="text-[8px] tracking-[0.35em] uppercase text-white/30 mb-1">{p.tag}</p>
        <div className="flex items-start justify-between gap-2 mb-4">
          <h3 className="font-heading text-white text-[15px] font-semibold leading-snug">{p.name}</h3>
          <div className="text-right shrink-0">
            <p className="text-white font-bold text-base">GH₵ {p.price}</p>
            {p.originalPrice && (
              <p className="text-[10px] text-white/25 line-through">GH₵ {p.originalPrice}</p>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="flex gap-1.5 mb-4">
          {p.sizes.map(s => (
            <button
              key={s}
              onClick={() => setSize(cur => cur === s ? "" : s)}
              className={`text-[9px] w-8 h-8 flex items-center justify-center border font-medium tracking-wide transition-all duration-200 ${
                size === s
                  ? "border-white bg-white text-black"
                  : "border-brand-border text-white/30 hover:border-white/30 hover:text-white/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAdd}
          className="w-full py-3 bg-transparent border border-white/15 text-white/50 text-[9px] tracking-[0.3em] uppercase font-semibold hover:border-white hover:text-white hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          <ShoppingBag size={11} />
          {added ? "Added to Cart" : "Add to Cart"}
          <ArrowRight size={11} className="opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" />
        </button>
      </div>
    </motion.article>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function Collection() {
  const [activeFilter, setActiveFilter] = useState("All");
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-10%" });

  return (
    <section id="collection" className="py-28 px-6 bg-brand-black">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={headerRef} className="mb-16">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="text-[9px] tracking-[0.45em] uppercase text-white/30 mb-3"
              >
                SS&apos;25 Collection
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={headerInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-heading text-5xl md:text-6xl text-white font-black leading-none"
              >
                The Drop.
              </motion.h2>
            </div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex items-center gap-2 flex-wrap"
            >
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-[9px] tracking-[0.3em] uppercase px-4 py-2.5 border font-medium transition-all duration-200 ${
                    activeFilter === f
                      ? "border-white bg-white text-black"
                      : "border-brand-border text-white/30 hover:border-white/30 hover:text-white/60"
                  }`}
                >
                  {f}
                </button>
              ))}
            </motion.div>
          </div>

          {/* Underline */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={headerInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-brand-border mt-8 origin-left"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-border">
          {PRODUCTS.map((p, i) => (
            <div key={p.id} className="bg-brand-black">
              <ProductCard p={p} index={i} />
            </div>
          ))}
        </div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 flex items-center justify-between border-t border-brand-border pt-8"
        >
          <p className="text-[9px] tracking-[0.3em] uppercase text-white/20">6 of 24 pieces shown</p>
          <Link
            href="/collection"
            className="inline-flex items-center gap-2 text-[9px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors duration-200 group"
          >
            View All Pieces
            <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
