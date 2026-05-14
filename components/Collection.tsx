"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Heart, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const PRODUCTS = [
  {
    id: 1,
    name: "Light in Darkness",
    tag: "HOPE Collection",
    price: 320,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL", "2XL"],
    badge: "Best Seller",
    image: "/asset/product-hope.jpg",
    accent: "#8B1A1A",   // deep rose from the tee graphic
    hot: true,
  },
  {
    id: 2,
    name: "Be Yourself",
    tag: "Urban Series",
    price: 280,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    badge: "New Arrival",
    image: "/asset/product-beyourself.jpg",
    accent: "#6B4FBB",   // purple from the tee
    hot: true,
  },
  {
    id: 3,
    name: "All Eyez On Me",
    tag: "Icons Series",
    price: 300,
    originalPrice: 360,
    sizes: ["M", "L", "XL"],
    badge: "Limited",
    image: "/asset/product-tupac.jpg",
    accent: "#C9A800",   // yellow from the tee
    hot: false,
  },
  {
    id: 4,
    name: "VG Monogram",
    tag: "Signature",
    price: 260,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    badge: "Coming Soon",
    image: null,
    accent: "#222222",
    hot: false,
  },
  {
    id: 5,
    name: "Accra Nights",
    tag: "Exclusive",
    price: 340,
    originalPrice: null,
    sizes: ["M", "L", "XL"],
    badge: "Drop Soon",
    image: null,
    accent: "#222222",
    hot: false,
  },
  {
    id: 6,
    name: "Heritage Script",
    tag: "Archive",
    price: 290,
    originalPrice: 350,
    sizes: ["S", "M", "L"],
    badge: "Sale",
    image: null,
    accent: "#222222",
    hot: false,
  },
];

const FILTERS = ["All", "Tees", "Icons Series", "Urban Series", "Limited"];

// ─── Single product card ──────────────────────────────────────────────────────

function ProductCard({ p, i }: { p: typeof PRODUCTS[0]; i: number }) {
  const [liked, setLiked]   = useState(false);
  const [size, setSize]     = useState("");
  const [added, setAdded]   = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const hasImage = p.image && !imgErr;

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.65, delay: i * 0.07, ease: [0.22, 0.61, 0.36, 1] }}
      className="group"
    >
      {/* Image card — rounded, floating */}
      <div className="relative rounded-2xl overflow-hidden bg-vg-cream mb-5 card-float aspect-[3/4]">

        {hasImage ? (
          <Image
            src={p.image!}
            alt={p.name}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
            onError={() => setImgErr(true)}
          />
        ) : (
          /* Placeholder */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-vg-cream">
            <svg viewBox="0 0 200 240" className="w-2/5 opacity-[0.13]" fill="none">
              <path
                d="M100 15 C100 15 76 20 58 36 L22 70 L50 84 L62 62 L62 225 L138 225 L138 62 L150 84 L178 70 L142 36 C124 20 100 15 100 15Z"
                stroke="#0F0F0E" strokeWidth="1.5" fill="rgba(15,15,14,0.04)"
              />
              <line x1="100" y1="37" x2="100" y2="210" stroke="#0F0F0E" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.25" />
            </svg>
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-vg-ink/20 mt-5 font-light">Coming Soon</p>
          </div>
        )}

        {/* Gradient overlay always present on real images */}
        {hasImage && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
        )}

        {/* Hover CTA — floats up from bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-400 ease-out flex flex-col gap-2">
          <button
            onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
            className="w-full py-3 rounded-xl bg-white text-vg-ink font-sans text-[10px] tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 hover:bg-vg-cream transition-colors"
          >
            <ShoppingBag size={12} />
            {added ? "Added!" : "Add to Cart"}
          </button>
        </div>

        {/* Badge — pill */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`font-sans text-[9px] tracking-[0.15em] uppercase font-medium px-3 py-1 rounded-full ${
            p.badge === "Best Seller" || p.badge === "Limited" || p.badge === "Sale"
              ? "bg-vg-ink text-white"
              : "bg-white/90 text-vg-ink shadow-sm"
          }`}>
            {p.badge}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setLiked(l => !l)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart size={12} className={liked ? "fill-vg-ink text-vg-ink" : "text-vg-ink/35"} />
        </button>

        {/* Hot dot */}
        {p.hot && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="font-sans text-[8px] tracking-[0.25em] uppercase text-white/70 glass rounded-full px-2 py-0.5">Hot</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-1">
        <p className="font-sans text-[8px] tracking-[0.4em] uppercase text-vg-ink-muted/40 mb-1.5 font-light">{p.tag}</p>
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-serif text-vg-ink text-xl font-light leading-tight">{p.name}</h3>
          <div className="text-right shrink-0">
            <p className="font-serif text-vg-ink text-lg font-light">GH₵ {p.price}</p>
            {p.originalPrice && (
              <p className="font-sans text-[10px] text-vg-ink/25 line-through">GH₵ {p.originalPrice}</p>
            )}
          </div>
        </div>

        {/* Size pills */}
        <div className="flex gap-1.5 mb-4">
          {p.sizes.map(s => (
            <button
              key={s}
              onClick={() => setSize(c => c === s ? "" : s)}
              className={`font-sans text-[9px] px-2.5 py-1.5 rounded-full border font-medium tracking-wide transition-all duration-200 ${
                size === s
                  ? "border-vg-ink bg-vg-ink text-white"
                  : "border-vg-border text-vg-ink/35 hover:border-vg-ink/40 hover:text-vg-ink/70"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
          className="w-full py-3 rounded-xl border border-vg-border font-sans text-[10px] tracking-[0.2em] uppercase text-vg-ink/40 font-light hover:border-vg-ink hover:bg-vg-ink hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
        >
          <ShoppingBag size={11} />
          {added ? "Added to Cart" : "Add to Cart"}
        </button>
      </div>
    </motion.article>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

export default function Collection() {
  const [filter, setFilter] = useState("All");
  const hRef    = useRef(null);
  const hInView = useInView(hRef, { once: true, margin: "-10%" });

  return (
    <section id="collection" className="bg-white py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div ref={hRef} className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-14">
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={hInView ? { opacity: 1 } : {}}
              className="font-sans text-[10px] tracking-[0.45em] uppercase text-vg-ink-muted/40 font-light mb-4"
            >
              SS&apos;25 Collection
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={hInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-serif text-[clamp(2.8rem,5vw,5rem)] text-vg-ink leading-none"
              style={{ fontWeight: 300 }}
            >
              The Drop.
            </motion.h2>
          </div>

          {/* Filter pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={hInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap gap-2"
          >
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`font-sans text-[9px] tracking-[0.2em] uppercase px-4 py-2 rounded-full border font-light transition-all duration-200 ${
                  filter === f
                    ? "border-vg-ink bg-vg-ink text-white"
                    : "border-vg-border text-vg-ink/40 hover:border-vg-ink/30 hover:text-vg-ink/70"
                }`}
              >
                {f}
              </button>
            ))}
          </motion.div>
        </div>

        {/* ── Bento hero row — first 3 real products featured large ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
          {PRODUCTS.slice(0, 3).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.08 }}
              className="group relative rounded-3xl overflow-hidden bg-vg-cream card-float"
              style={{ aspectRatio: i === 0 ? "2/3" : "3/4" }}
            >
              {/* Photo */}
              {p.image && (
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  priority={i === 0}
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
                />
              )}

              {/* Always-on bottom info */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className={`inline-block font-sans text-[9px] tracking-[0.2em] uppercase font-medium px-3 py-1 rounded-full mb-3 ${
                  p.badge === "Best Seller" || p.badge === "Limited"
                    ? "bg-white text-vg-ink"
                    : "bg-white/20 text-white backdrop-blur-sm"
                }`}>
                  {p.badge}
                </span>
                <h3 className="font-serif text-white text-2xl font-light leading-tight mb-1">{p.name}</h3>
                <div className="flex items-center justify-between">
                  <p className="font-sans text-white/55 text-[12px] font-light">{p.tag}</p>
                  <p className="font-serif text-white text-lg font-light">GH₵ {p.price}</p>
                </div>

                {/* Hover add to cart */}
                <button
                  onClick={() => {}}
                  className="w-full mt-4 py-3 rounded-xl bg-white text-vg-ink font-sans text-[10px] tracking-[0.2em] uppercase font-medium flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-350"
                >
                  <ShoppingBag size={12} /> Add to Cart
                </button>
              </div>

              {/* Wishlist */}
              <button className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors group/heart">
                <Heart size={13} className="text-white group-hover/heart:text-vg-ink transition-colors" />
              </button>
            </motion.div>
          ))}
        </div>

        {/* ── Standard grid — remaining products ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
          {PRODUCTS.slice(3).map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>

        {/* View all */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <Link href="/collection" className="btn-pill-outline">
            View All Pieces <ArrowUpRight size={14} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
