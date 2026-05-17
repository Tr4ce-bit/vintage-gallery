"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, Heart, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShirtColor {
  name:  string;
  hex:   string;
  light: boolean; // true = shirt is light, use dark text/borders
}

// ─── Colour options ───────────────────────────────────────────────────────────

const SHIRT_COLORS: ShirtColor[] = [
  { name: "Bone White",    hex: "#F3EDE3", light: true  },
  { name: "Pitch Black",   hex: "#111111", light: false },
  { name: "Royal Indigo",  hex: "#1B1464", light: false },
  { name: "Vintage Khaki", hex: "#C8B89A", light: true  },
  { name: "Forest",        hex: "#2D4A3E", light: false },
  { name: "Slate",         hex: "#3A4A5C", light: false },
  { name: "Burgundy",      hex: "#6B2737", light: false },
  { name: "Sand",          hex: "#D4C4A0", light: true  },
  { name: "Ash",           hex: "#B0AEAC", light: true  },
  { name: "Rust",          hex: "#8B3A2A", light: false },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const DESIGN_TYPES = [
  { id: "none",    label: "Plain Tee"   },
  { id: "text",    label: "Add Text"    },
  { id: "graphic", label: "Add Graphic" },
];

// ─── Realistic plain T-Shirt SVG ──────────────────────────────────────────────
// Fully blank — no prints, no logos. Color fills dynamically.

function PlainShirt({ color, light }: { color: string; light: boolean }) {
  // Derive subtle shadow/highlight colours
  const shadowAlpha  = light ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.30)";
  const hiAlpha      = light ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)";
  const seam         = light ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.25)";
  const collarInner  = light ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.22)";
  const hemLine      = light ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.28)";

  return (
    <svg
      viewBox="0 0 400 480"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.28))" }}
    >
      <defs>
        {/* Fabric depth gradient – left/right edge shadows */}
        <linearGradient id="g-sides" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="22%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="78%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>
        {/* Top highlight / bottom shadow */}
        <linearGradient id="g-topbot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={hiAlpha} />
          <stop offset="35%"  stopColor="rgba(255,255,255,0)" />
          <stop offset="80%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
        </linearGradient>
        {/* Subtle centre chest highlight (shirt catch-light) */}
        <radialGradient id="g-chest" cx="50%" cy="42%" r="32%">
          <stop offset="0%"   stopColor={hiAlpha} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        {/* Sleeve underside shadow */}
        <linearGradient id="g-lsleeve" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="g-rsleeve" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>

      {/* ── Main shirt body ── */}
      {/*
        Path anatomy:
          Collar left (162,54) → left shoulder (80,82)
          → left sleeve outer tip (16,162)
          → left sleeve hem (16,184) curve to armhole (112,180)
          → left body down to hem (112,450)
          → bottom hem (288,450)
          → right body up to armhole (288,180)
          → right sleeve hem curve (384,184) to outer tip (384,162)
          → right shoulder (320,82) → collar right (238,54)
          → collar curve through (200,105) back to start
      */}
      <path
        d={`
          M 162,54
          C 146,56 110,70 80,82
          L 16,162
          L 14,186
          C 52,198 94,188 112,182
          L 112,450
          L 288,450
          L 288,182
          C 306,188 348,198 386,186
          L 384,162
          L 320,82
          C 290,70 254,56 238,54
          C 227,88 214,106 200,106
          C 186,106 173,88 162,54
          Z
        `}
        fill={color}
      />

      {/* Fabric gradient overlays — applied on top of the fill */}
      <path
        d={`
          M 162,54 C 146,56 110,70 80,82 L 16,162 L 14,186
          C 52,198 94,188 112,182 L 112,450 L 288,450 L 288,182
          C 306,188 348,198 386,186 L 384,162 L 320,82
          C 290,70 254,56 238,54
          C 227,88 214,106 200,106 C 186,106 173,88 162,54 Z
        `}
        fill="url(#g-sides)"
      />
      <path
        d={`
          M 162,54 C 146,56 110,70 80,82 L 16,162 L 14,186
          C 52,198 94,188 112,182 L 112,450 L 288,450 L 288,182
          C 306,188 348,198 386,186 L 384,162 L 320,82
          C 290,70 254,56 238,54
          C 227,88 214,106 200,106 C 186,106 173,88 162,54 Z
        `}
        fill="url(#g-topbot)"
      />
      <path
        d={`
          M 162,54 C 146,56 110,70 80,82 L 16,162 L 14,186
          C 52,198 94,188 112,182 L 112,450 L 288,450 L 288,182
          C 306,188 348,198 386,186 L 384,162 L 320,82
          C 290,70 254,56 238,54
          C 227,88 214,106 200,106 C 186,106 173,88 162,54 Z
        `}
        fill="url(#g-chest)"
      />

      {/* ── Collar ribbing ── */}
      {/* Outer collar ridge */}
      <path
        d="M 165,56 C 174,87 186,104 200,104 C 214,104 226,87 235,56"
        stroke={shadowAlpha}
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Inner collar highlight */}
      <path
        d="M 168,58 C 176,86 187,102 200,102 C 213,102 224,86 232,58"
        stroke={collarInner}
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Collar top rib shine */}
      <path
        d="M 171,60 C 178,85 188,100 200,100 C 212,100 222,85 229,60"
        stroke={hiAlpha}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Shoulder seams ── */}
      <path d="M 163,56 C 140,64 110,72 82,82" stroke={seam} strokeWidth="1.5" fill="none" />
      <path d="M 237,56 C 260,64 290,72 318,82" stroke={seam} strokeWidth="1.5" fill="none" />

      {/* ── Sleeve hems ── */}
      <path d="M 14,186 C 52,200 93,189 113,183" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 386,186 C 348,200 307,189 287,183" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      {/* Sleeve hem inner shine */}
      <path d="M 16,183 C 52,195 91,186 112,180" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 384,183 C 348,195 309,186 288,180" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* ── Side seams ── */}
      <path d="M 112,190 L 112,450" stroke={seam} strokeWidth="1.2" fill="none" />
      <path d="M 288,190 L 288,450" stroke={seam} strokeWidth="1.2" fill="none" />

      {/* ── Bottom hem ── */}
      <path d="M 112,450 L 288,450" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 112,447 L 288,447" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />

      {/* ── Centre front placket crease (very subtle) ── */}
      <line x1="200" y1="108" x2="200" y2="444" stroke={seam} strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

// ─── Print zone overlay ───────────────────────────────────────────────────────
// Positioned in the chest area of the shirt SVG (approx 28–62% from top, 29–71% from left)

function PrintZone({
  light,
  designType,
  customText,
}: {
  light:      boolean;
  designType: string;
  customText: string;
}) {
  if (designType === "none") return null;

  const textCol = light ? "rgba(0,0,0,0.78)" : "rgba(255,255,255,0.90)";
  const borderCol = light ? "rgba(0,0,0,0.18)" : "rgba(255,255,255,0.22)";

  return (
    <div
      className="absolute pointer-events-none flex items-center justify-center"
      style={{ left: "29%", right: "29%", top: "30%", height: "28%" }}
    >
      {designType === "text" && customText && (
        <motion.span
          key={customText}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="font-serif text-center leading-tight break-words w-full"
          style={{
            fontSize:        "clamp(0.75rem, 2.8vw, 1.25rem)",
            fontWeight:      600,
            letterSpacing:   "0.12em",
            textTransform:   "uppercase",
            color:           textCol,
            textShadow:      light
              ? "0 1px 3px rgba(255,255,255,0.4)"
              : "0 1px 3px rgba(0,0,0,0.5)",
          }}
        >
          {customText}
        </motion.span>
      )}

      {designType === "text" && !customText && (
        <span
          className="font-sans text-center"
          style={{
            fontSize:  "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: borderCol,
          }}
        >
          Your text appears here
        </span>
      )}

      {designType === "graphic" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1.5"
          style={{ borderColor: borderCol }}
        >
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: borderCol, fontFamily: "sans-serif" }}>
            Print Area
          </span>
          <span style={{ fontSize: "0.55rem", color: borderCol, fontFamily: "sans-serif" }}>
            DM us your graphic
          </span>
        </motion.div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductCustomizer() {
  const { isSignedIn } = useAuth();
  const addItem        = useCartStore((s) => s.addItem);

  const [color,       setColor]       = useState<ShirtColor>(SHIRT_COLORS[0]);
  const [size,        setSize]        = useState("M");
  const [designType,  setDesignType]  = useState("none");
  const [customText,  setCustomText]  = useState("");
  const [quantity,    setQuantity]    = useState(1);
  const [wishlisted,  setWishlisted]  = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [authToast,   setAuthToast]   = useState(false);

  // Live pricing from admin
  const [basePriceGHS,   setBasePriceGHS]   = useState(150);
  const [designAddonGHS, setDesignAddonGHS] = useState(30);
  const [pricesLoaded,   setPricesLoaded]   = useState(false);

  useEffect(() => {
    fetch("/api/studio")
      .then(r => r.json())
      .then(d => {
        setBasePriceGHS(d.basePriceGHS   ?? 150);
        setDesignAddonGHS(d.designAddonGHS ?? 30);
        setPricesLoaded(true);
      })
      .catch(() => setPricesLoaded(true));
  }, []);

  const price = designType === "none" ? basePriceGHS : basePriceGHS + designAddonGHS;

  const handleWishlist = () => {
    if (!isSignedIn) { setAuthToast(true); setTimeout(() => setAuthToast(false), 3000); return; }
    setWishlisted(w => !w);
  };

  const handleAddToCart = () => {
    addItem({
      productId: `custom-${color.name}-${size}`,
      slug:       "custom-tee",
      name:       `Custom Tee — ${color.name}${customText ? ` · "${customText}"` : ""}`,
      collection: "Custom Studio",
      price,
      image:      "/asset/product-hope.jpg",
      size,
      color:      color.name,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleReset = () => {
    setColor(SHIRT_COLORS[0]);
    setSize("M");
    setDesignType("none");
    setCustomText("");
    setQuantity(1);
  };

  return (
    <section className="min-h-screen bg-zinc-950 pt-[60px]">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 md:py-20">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-500 font-light mb-3">
            Custom Studio
          </p>
          <h1 className="font-serif text-white leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300 }}>
            Design Your <em style={{ fontStyle: "italic" }}>Piece.</em>
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">

          {/* ── LEFT: Shirt preview ── */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {/* Mockup canvas */}
            <div
              className="relative rounded-2xl border border-zinc-800 flex items-center justify-center overflow-hidden"
              style={{
                background:  "radial-gradient(ellipse at 50% 40%, #1e1e1e 0%, #0d0d0d 100%)",
                minHeight:   "440px",
              }}
            >
              {/* Subtle studio dot-grid background */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{ backgroundImage: "radial-gradient(#fff 1px,transparent 1px)", backgroundSize: "24px 24px" }}
              />

              {/* Shirt + print zone */}
              <div className="relative w-full max-w-[280px] mx-auto py-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={color.hex}
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.25 }}
                    className="relative"
                  >
                    <PlainShirt color={color.hex} light={color.light} />
                    <PrintZone light={color.light} designType={designType} customText={customText} />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Colour badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/70">{color.name}</span>
              </div>

              {/* Price badge top-right */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="font-sans text-[10px] text-white/80 font-medium">
                  {pricesLoaded ? `GH₵ ${price}` : "…"}
                </span>
              </div>
            </div>

            {/* Colour swatches */}
            <div className="mt-5 rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-4">
                Shirt Colour
              </p>
              <div className="flex flex-wrap gap-3">
                {SHIRT_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(c)}
                    title={c.name}
                    className={`relative w-9 h-9 rounded-full transition-all duration-200 ${
                      color.hex === c.hex
                        ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                        : "opacity-60 hover:opacity-100 hover:scale-105"
                    }`}
                    style={{ backgroundColor: c.hex, border: "1px solid rgba(255,255,255,0.12)" }}
                  />
                ))}
              </div>
              <p className="font-sans text-[9px] text-zinc-600 font-light mt-3">
                10 colourways available · click a swatch to preview
              </p>
            </div>
          </motion.div>

          {/* ── RIGHT: Configurator ── */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col gap-8"
          >

            {/* Price */}
            <div>
              <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-500 font-light mb-1">
                Custom Tee — Made to Order
              </p>
              <motion.p
                key={price}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="font-serif text-white leading-none"
                style={{ fontSize: "2.5rem", fontWeight: 300 }}
              >
                {pricesLoaded ? `GH₵ ${price}` : "Loading…"}
              </motion.p>
              {designType !== "none" && (
                <p className="font-sans text-[10px] text-zinc-500 font-light mt-1.5">
                  Base GH₵ {basePriceGHS} + design add-on GH₵ {designAddonGHS}
                </p>
              )}
            </div>

            {/* Design type */}
            <div>
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-4">
                01 · Customisation
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DESIGN_TYPES.map(dt => (
                  <button
                    key={dt.id}
                    onClick={() => { setDesignType(dt.id); if (dt.id !== "text") setCustomText(""); }}
                    className={`py-3.5 rounded-xl font-sans text-[10px] tracking-[0.12em] uppercase font-light border transition-all duration-200 ${
                      designType === dt.id
                        ? "bg-white text-zinc-900 border-white"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {dt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Text input */}
            <AnimatePresence>
              {designType === "text" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-3">
                    Your Text · max 20 characters
                  </p>
                  <input
                    type="text"
                    value={customText}
                    onChange={e => setCustomText(e.target.value.slice(0, 20).toUpperCase())}
                    placeholder="E.G. ACCRA"
                    maxLength={20}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 font-serif text-white placeholder-zinc-700 focus:outline-none focus:border-zinc-600 transition-colors tracking-[0.35em] uppercase text-center"
                  />
                  <p className="font-sans text-[9px] text-zinc-600 font-light mt-2">
                    Text is screen-printed on the chest · preview updates live
                  </p>
                </motion.div>
              )}

              {designType === "graphic" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6 text-center">
                    <p className="font-sans text-sm text-zinc-300 font-light mb-2">
                      Custom graphic uploads coming soon.
                    </p>
                    <p className="font-sans text-xs text-zinc-600 mb-4">
                      For now, DM us your design on Instagram or WhatsApp and we&apos;ll create a mockup for you.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                        className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 border border-zinc-700 px-4 py-2 rounded-full hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                        Instagram
                      </a>
                      <a href="https://wa.me/" target="_blank" rel="noopener noreferrer"
                        className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 border border-zinc-700 px-4 py-2 rounded-full hover:border-zinc-500 hover:text-zinc-200 transition-colors">
                        WhatsApp
                      </a>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Size */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">
                  02 · Size — <span className="text-zinc-300">{size}</span>
                </p>
                <Link href="/sizing-guide"
                  className="font-sans text-[9px] tracking-[0.15em] uppercase text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2">
                  Size Guide
                </Link>
              </div>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-11 h-11 rounded-full font-sans text-[11px] border transition-all duration-200 ${
                      size === s
                        ? "bg-white text-zinc-900 border-white"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-4">
                03 · Quantity
              </p>
              <div className="flex items-center gap-5">
                <div className="flex items-center border border-zinc-800 rounded-full overflow-hidden">
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">
                    −
                  </button>
                  <span className="w-9 text-center font-sans text-sm text-zinc-300">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">
                    +
                  </button>
                </div>
                <span className="font-sans text-[10px] text-zinc-600 font-light">Max 10 per order</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!pricesLoaded}
                className="flex-1 flex items-center justify-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.18em] uppercase py-4 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-40"
              >
                {addedToCart
                  ? <><Check size={14} /> Added to Cart</>
                  : <><ShoppingBag size={14} /> Add to Cart — GH₵ {price * quantity}</>
                }
              </button>

              <button
                onClick={handleWishlist}
                className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center hover:border-zinc-600 transition-colors"
              >
                <Heart size={16} className={wishlisted ? "fill-white text-white" : "text-zinc-500"} />
              </button>

              <button
                onClick={handleReset}
                title="Reset"
                className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center hover:border-zinc-600 transition-colors text-zinc-500 hover:text-zinc-300"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {addedToCart && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Link href="/cart"
                  className="flex items-center justify-center gap-2 font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 hover:text-white transition-colors">
                  View Cart <ArrowRight size={11} />
                </Link>
              </motion.div>
            )}

            {/* Trust signals */}
            <div className="border-t border-zinc-800 pt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: "✦", label: "Made to Order",   sub: "Your spec, every time"      },
                { icon: "🚚", label: "48h Delivery",   sub: "Accra & surrounds"           },
                { icon: "💳", label: "MoMo Pay",       sub: "MTN · Telecel · AirtelTigo" },
              ].map(item => (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{item.icon}</span>
                  <p className="font-sans text-[10px] text-zinc-400 font-light leading-tight">{item.label}</p>
                  <p className="font-sans text-[9px] text-zinc-600 font-light leading-tight">{item.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

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
    </section>
  );
}
