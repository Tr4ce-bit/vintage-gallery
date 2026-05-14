"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Heart, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

// ─── Product data ────────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: "VG Monogram Tee",
    tag: "Signature",
    price: 280,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    color: "Midnight Black",
    badge: "Best Seller",
    gradient: "from-zinc-900 to-zinc-800",
    accent: "border-brand-gold/30",
    hot: true,
  },
  {
    id: 2,
    name: "Heritage Drop Tee",
    tag: "SS'25 Drop",
    price: 320,
    originalPrice: null,
    sizes: ["S", "M", "L"],
    color: "Cream White",
    badge: "New Arrival",
    gradient: "from-stone-800 to-stone-900",
    accent: "border-brand-indigo/30",
    hot: false,
  },
  {
    id: 3,
    name: "Gold Label Oversized",
    tag: "Premium",
    price: 350,
    originalPrice: 420,
    sizes: ["M", "L", "XL", "2XL"],
    color: "Forest Olive",
    badge: "Limited",
    gradient: "from-neutral-900 to-neutral-800",
    accent: "border-brand-gold/20",
    hot: true,
  },
  {
    id: 4,
    name: "Accra Nights Hoodie",
    tag: "Exclusive",
    price: 480,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    color: "Carbon Black",
    badge: "Drop Soon",
    gradient: "from-zinc-950 to-slate-900",
    accent: "border-white/10",
    hot: false,
  },
  {
    id: 5,
    name: "Vintage Archive Polo",
    tag: "Archive",
    price: 300,
    originalPrice: 360,
    sizes: ["S", "M", "L"],
    color: "Ivory",
    badge: "Sale",
    gradient: "from-stone-900 to-neutral-900",
    accent: "border-brand-gold/25",
    hot: false,
  },
  {
    id: 6,
    name: "Gallery Statement Tee",
    tag: "Art Series",
    price: 380,
    originalPrice: null,
    sizes: ["M", "L", "XL"],
    color: "Bone White",
    badge: "Exclusive",
    gradient: "from-zinc-800 to-zinc-900",
    accent: "border-brand-indigo/20",
    hot: true,
  },
];

const BADGE_COLORS: Record<string, string> = {
  "Best Seller": "bg-brand-gold text-brand-black",
  "New Arrival": "bg-brand-indigo text-white",
  Limited:       "bg-red-900/80 text-red-200",
  "Drop Soon":   "bg-zinc-800 text-brand-cream/70",
  Sale:          "bg-emerald-900/80 text-emerald-200",
  Exclusive:     "bg-brand-gold/20 text-brand-gold border border-brand-gold/30",
};

// ─── Product Card ────────────────────────────────────────────────────────────

function ProductCard({ product, index }: { product: typeof PRODUCTS[0]; index: number }) {
  const [liked, setLiked] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      {/* Card */}
      <div className={`relative overflow-hidden border ${product.accent} bg-gradient-to-br ${product.gradient} transition-all duration-500 group-hover:border-brand-gold/50`}>

        {/* Image placeholder — replaced with real product images when you have them */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 flex items-center justify-center">

          {/* VG monogram watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <span className="font-heading text-[8rem] font-black text-brand-gold select-none">VG</span>
          </div>

          {/* Product visual */}
          <div className="relative z-10 flex flex-col items-center gap-3 px-8">
            <div className="w-24 h-24 rounded-full border-2 border-brand-gold/30 flex items-center justify-center">
              <span className="font-heading text-2xl text-brand-gold font-bold">{product.name.split(" ").map(w => w[0]).join("").slice(0,2)}</span>
            </div>
            <span className="text-xs tracking-[0.3em] uppercase text-brand-cream/30 text-center">{product.color}</span>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-brand-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 glass-card flex items-center justify-center text-brand-gold border border-brand-gold/30 hover:bg-brand-gold hover:text-brand-black transition-all"
            >
              <Eye size={16} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-11 h-11 glass-card flex items-center justify-center text-brand-cream/60 border border-brand-border hover:text-brand-gold transition-all"
            >
              <ShoppingBag size={16} />
            </motion.button>
          </div>

          {/* Badge */}
          <div className="absolute top-4 left-4">
            <span className={`text-[10px] tracking-[0.2em] uppercase font-semibold px-3 py-1 ${BADGE_COLORS[product.badge] ?? "bg-zinc-800 text-brand-cream/60"}`}>
              {product.badge}
            </span>
          </div>

          {/* Wishlist */}
          <button
            onClick={() => setLiked(l => !l)}
            className="absolute top-4 right-4 w-9 h-9 glass-card flex items-center justify-center transition-all hover:border-brand-gold/40"
          >
            <Heart
              size={14}
              className={liked ? "fill-brand-gold text-brand-gold" : "text-brand-cream/40"}
            />
          </button>

          {/* Hot indicator */}
          {product.hot && (
            <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-[9px] tracking-[0.3em] uppercase text-brand-gold/70">Hot</span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className="text-[9px] tracking-[0.3em] uppercase text-brand-gold/60 mb-1">{product.tag}</p>
              <h3 className="font-heading text-base text-brand-cream font-semibold leading-snug">{product.name}</h3>
            </div>
            <div className="text-right shrink-0">
              <p className="font-heading text-lg text-brand-gold font-bold">GH₵ {product.price}</p>
              {product.originalPrice && (
                <p className="text-xs text-brand-cream/30 line-through">GH₵ {product.originalPrice}</p>
              )}
            </div>
          </div>

          {/* Size selector */}
          <div className="flex gap-1.5 mb-4">
            {product.sizes.map(size => (
              <button
                key={size}
                onClick={() => setSelectedSize(s => s === size ? "" : size)}
                className={`text-[10px] w-8 h-8 flex items-center justify-center border font-medium tracking-wide transition-all duration-200 ${
                  selectedSize === size
                    ? "border-brand-gold bg-brand-gold text-brand-black"
                    : "border-brand-border text-brand-cream/40 hover:border-brand-gold/40 hover:text-brand-cream/70"
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* Add to cart */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full py-3 bg-transparent border border-brand-gold/30 text-brand-gold text-xs tracking-[0.25em] uppercase font-semibold hover:bg-brand-gold hover:text-brand-black transition-all duration-300 flex items-center justify-center gap-2 group/btn"
          >
            <ShoppingBag size={13} />
            Add to Cart
            <ArrowRight size={13} className="opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-200" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} className="text-center mb-16">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-[10px] tracking-[0.4em] uppercase text-brand-gold mb-4"
      >
        {eyebrow}
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="font-heading text-4xl md:text-5xl text-brand-cream mb-4"
      >
        {title}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 1, delay: 0.3 }}
        className="w-20 h-px bg-brand-gold mx-auto mb-4 origin-left"
      />
      <motion.p
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="text-brand-cream/40 text-sm tracking-wider max-w-md mx-auto"
      >
        {subtitle}
      </motion.p>
    </div>
  );
}

// ─── Filter tabs ─────────────────────────────────────────────────────────────

const FILTERS = ["All", "Tees", "Hoodies", "Polos", "Limited"];

// ─── Main component ───────────────────────────────────────────────────────────

export default function Collection() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <section id="collection" className="py-24 px-6 bg-brand-black">
      <div className="max-w-7xl mx-auto">
        <SectionHeader
          eyebrow="SS'25 Collection"
          title="The Drop"
          subtitle="Limited pieces. Premium craft. Ghana-made culture."
        />

        {/* Filter tabs */}
        <div className="flex items-center justify-center gap-2 flex-wrap mb-12">
          {FILTERS.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`text-[10px] tracking-[0.3em] uppercase px-5 py-2.5 border font-medium transition-all duration-200 ${
                activeFilter === filter
                  ? "border-brand-gold bg-brand-gold text-brand-black"
                  : "border-brand-border text-brand-cream/40 hover:border-brand-gold/40 hover:text-brand-cream/70"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-brand-border">
          {PRODUCTS.map((product, i) => (
            <div key={product.id} className="bg-brand-black p-px">
              <ProductCard product={product} index={i} />
            </div>
          ))}
        </div>

        {/* View all CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mt-16"
        >
          <Link
            href="/collection"
            className="inline-flex items-center gap-3 border border-brand-gold/30 text-brand-gold text-xs tracking-[0.3em] uppercase px-10 py-4 hover:bg-brand-gold hover:text-brand-black transition-all duration-300"
          >
            View All Pieces
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
