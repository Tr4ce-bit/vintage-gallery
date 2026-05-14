"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShoppingBag, Heart, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// ─── Real products ─────────────────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 1,
    name: "Light in Darkness",
    tag: "HOPE Collection",
    desc: "Floral rose graphic · Old English lettering · Oversized fit",
    price: 320,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL", "2XL"],
    badge: "Best Seller",
    badgeDark: true,
    image: "/asset/product-hope.jpg",
    hot: true,
  },
  {
    id: 2,
    name: "Be Yourself",
    tag: "Urban Series",
    desc: "Bold typography · Geometric graphic · Street style",
    price: 280,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    badge: "New Arrival",
    badgeDark: false,
    image: "/asset/product-beyourself.jpg",
    hot: true,
  },
  {
    id: 3,
    name: "All Eyez On Me",
    tag: "Icons Series",
    desc: "Tupac tribute · Yellow & black graphic · Oversized fit",
    price: 300,
    originalPrice: 360,
    sizes: ["M", "L", "XL"],
    badge: "Limited",
    badgeDark: true,
    image: "/asset/product-tupac.jpg",
    hot: false,
  },
  {
    id: 4,
    name: "VG Monogram Tee",
    tag: "Signature",
    desc: "VG logo centrepiece · Premium cotton · Clean silhouette",
    price: 260,
    originalPrice: null,
    sizes: ["S", "M", "L", "XL"],
    badge: "Coming Soon",
    badgeDark: false,
    image: null,
    hot: false,
  },
  {
    id: 5,
    name: "Accra Nights",
    tag: "Exclusive",
    desc: "Accra skyline graphic · Limited run · Night edition",
    price: 340,
    originalPrice: null,
    sizes: ["M", "L", "XL"],
    badge: "Drop Soon",
    badgeDark: false,
    image: null,
    hot: false,
  },
  {
    id: 6,
    name: "Heritage Script",
    tag: "Archive",
    desc: "Script calligraphy · Heritage colorway · Collector piece",
    price: 290,
    originalPrice: 350,
    sizes: ["S", "M", "L"],
    badge: "Sale",
    badgeDark: true,
    image: null,
    hot: false,
  },
];

const FILTERS = ["All", "Tees", "Icons Series", "Urban Series", "Limited"];

// ─── Product card ─────────────────────────────────────────────────────────────

function ProductCard({ p, i }: { p: typeof PRODUCTS[0]; i: number }) {
  const [liked, setLiked] = useState(false);
  const [size, setSize]   = useState("");
  const [added, setAdded] = useState(false);
  const [imgErr, setImgErr] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 0.61, 0.36, 1] }}
      className="group bg-white"
    >
      {/* Image area */}
      <div className="relative aspect-[3/4] bg-vg-cream overflow-hidden">

        {/* Real product photo */}
        {p.image && !imgErr ? (
          <Image
            src={p.image}
            alt={p.name}
            fill
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
            onError={() => setImgErr(true)}
          />
        ) : (
          /* SVG placeholder when no image yet */
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-vg-cream-dark">
            <svg viewBox="0 0 200 240" className="w-2/5 opacity-[0.12]" fill="none">
              <path
                d="M100 15 C100 15 76 20 58 36 L22 70 L50 84 L62 62 L62 225 L138 225 L138 62 L150 84 L178 70 L142 36 C124 20 100 15 100 15Z"
                stroke="#080808" strokeWidth="1.5" fill="rgba(8,8,8,0.04)"
              />
              <line x1="100" y1="37" x2="100" y2="210" stroke="#080808" strokeWidth="0.6" strokeDasharray="3 5" opacity="0.3" />
            </svg>
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-vg-ink/20 mt-5 font-light">Coming Soon</p>
          </div>
        )}

        {/* Dark hover overlay with CTA */}
        <div className="absolute inset-0 bg-vg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-center gap-4">
          <button
            onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
            className="btn-primary !text-[10px] !px-6 !py-3"
          >
            <ShoppingBag size={12} />
            {added ? "Added!" : "Add to Cart"}
          </button>
          <Link href="#" className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/50 hover:text-white transition-colors flex items-center gap-1">
            Quick View <ArrowUpRight size={10} />
          </Link>
        </div>

        {/* Badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className={`font-sans text-[9px] tracking-[0.2em] uppercase font-medium px-2.5 py-1 ${p.badgeDark ? "bg-vg-ink text-white" : "bg-white/90 text-vg-ink border border-vg-ink/10"}`}>
            {p.badge}
          </span>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => setLiked(l => !l)}
          className="absolute top-4 right-4 z-10 w-8 h-8 bg-white/90 border border-vg-ink/10 flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart size={11} className={liked ? "fill-vg-ink text-vg-ink" : "text-vg-ink/30"} />
        </button>

        {/* Hot indicator */}
        {p.hot && (
          <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-vg-ink animate-pulse" />
            <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-vg-ink/60 bg-white/80 px-1.5 py-0.5">Hot</span>
          </div>
        )}
      </div>

      {/* Details — on white bg */}
      <div className="pt-5 pb-7 border-b border-vg-border-light">
        <p className="font-sans text-[8px] tracking-[0.4em] uppercase text-vg-ink/30 mb-1.5 font-light">{p.tag}</p>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-serif text-vg-ink text-xl font-light leading-snug">{p.name}</h3>
          <div className="text-right shrink-0">
            <p className="font-serif text-vg-ink text-lg font-light">GH₵ {p.price}</p>
            {p.originalPrice && (
              <p className="font-sans text-[10px] text-vg-ink/25 line-through">GH₵ {p.originalPrice}</p>
            )}
          </div>
        </div>
        <p className="font-sans text-[12px] text-vg-ink-muted/50 font-light mb-5">{p.desc}</p>

        {/* Sizes */}
        <div className="flex gap-1.5 mb-5">
          {p.sizes.map(s => (
            <button
              key={s}
              onClick={() => setSize(c => c === s ? "" : s)}
              className={`font-sans text-[9px] w-8 h-8 flex items-center justify-center border font-medium tracking-wide transition-all duration-200 ${
                size === s
                  ? "border-vg-ink bg-vg-ink text-white"
                  : "border-vg-border-light text-vg-ink/30 hover:border-vg-ink/40 hover:text-vg-ink/60"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Add to cart */}
        <button
          onClick={() => { setAdded(true); setTimeout(() => setAdded(false), 1800); }}
          className="w-full py-3 border border-vg-ink/15 font-sans text-[9px] tracking-[0.3em] uppercase text-vg-ink/40 font-light hover:border-vg-ink hover:text-vg-ink hover:bg-vg-ink hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
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
    /* White section — the flip from dark hero */
    <section id="collection" className="bg-white py-24 md:py-32 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Section header */}
        <div ref={hRef} className="mb-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-10">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={hInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
                className="font-sans text-[10px] tracking-[0.45em] uppercase text-vg-ink/30 font-light mb-5"
              >
                SS&apos;25 Collection
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={hInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.75, delay: 0.1 }}
                className="font-serif text-[clamp(3rem,6vw,5.5rem)] text-vg-ink leading-none"
                style={{ fontWeight: 300 }}
              >
                The Drop.
              </motion.h2>
            </div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={hInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap gap-2"
            >
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`font-sans text-[9px] tracking-[0.3em] uppercase px-4 py-2.5 border font-light transition-all duration-200 ${
                    filter === f
                      ? "border-vg-ink bg-vg-ink text-white"
                      : "border-vg-border-light text-vg-ink/30 hover:border-vg-ink/30 hover:text-vg-ink/60"
                  }`}
                >
                  {f}
                </button>
              ))}
            </motion.div>
          </div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={hInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.3, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-vg-border-light origin-left"
          />
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-0">
          {PRODUCTS.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-14 flex items-center justify-between"
        >
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-vg-ink/20 font-light">
            Showing 6 pieces
          </p>
          <Link
            href="/collection"
            className="font-sans text-[9px] tracking-[0.3em] uppercase text-vg-ink/40 hover:text-vg-ink transition-colors duration-200 flex items-center gap-1.5 group"
          >
            View All Pieces
            <ArrowUpRight size={11} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
