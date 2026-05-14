"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Check, ShoppingBag, Heart, ZoomIn, RotateCcw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Design {
  id: string;
  name: string;
  category: string;
  imageUrl: string; // relative to /public/asset/designs/
}

interface ShirtColor {
  name: string;
  hex: string;
  textColor: "light" | "dark";
}

// ─── Static data (replace with DB fetch in production) ────────────────────────

const DESIGNS: Design[] = [
  { id: "d1", name: "Arch Logo",      category: "graphic",  imageUrl: "/asset/designs/design-arch.png" },
  { id: "d2", name: "Crown Crest",    category: "vintage",  imageUrl: "/asset/designs/design-crown.png" },
  { id: "d3", name: "Gallery Script", category: "text",     imageUrl: "/asset/designs/design-script.png" },
  { id: "d4", name: "Varsity Star",   category: "graphic",  imageUrl: "/asset/designs/design-star.png" },
  { id: "d5", name: "Fleur De Lis",   category: "vintage",  imageUrl: "/asset/designs/design-fleur.png" },
  { id: "d6", name: "Block Type",     category: "text",     imageUrl: "/asset/designs/design-block.png" },
  { id: "d7", name: "Heritage Badge", category: "vintage",  imageUrl: "/asset/designs/design-badge.png" },
  { id: "d8", name: "Minimal VG",     category: "graphic",  imageUrl: "/asset/designs/design-minimal.png" },
];

const SHIRT_COLORS: ShirtColor[] = [
  { name: "Bone White",    hex: "#F5F0E8", textColor: "dark" },
  { name: "Pitch Black",   hex: "#0D0D0D", textColor: "light" },
  { name: "Royal Indigo",  hex: "#1B1464", textColor: "light" },
  { name: "Vintage Khaki", hex: "#C8B89A", textColor: "dark" },
  { name: "Forest",        hex: "#2D4A3E", textColor: "light" },
  { name: "Slate",         hex: "#3A4A5C", textColor: "light" },
  { name: "Burgundy",      hex: "#6B2737", textColor: "light" },
  { name: "Sand",          hex: "#D4C4A0", textColor: "dark" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const CATEGORIES = ["all", "graphic", "vintage", "text"] as const;

// ─── Animation variants ───────────────────────────────────────────────────────

const designCard: Variants = {
  hidden:  { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] },
  }),
  exit:    { opacity: 0, scale: 0.85, transition: { duration: 0.2 } },
};

const overlayVariant: Variants = {
  hidden:  { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] } },
  exit:    { opacity: 0, scale: 0.9, transition: { duration: 0.25 } },
};

// ─── T-Shirt SVG Mockup ───────────────────────────────────────────────────────
// Clean SVG silhouette so design overlays land perfectly on the print area

function TShirtSVG({ color }: { color: string }) {
  return (
    <svg
      viewBox="0 0 400 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
    >
      <defs>
        <filter id="shirt-shadow">
          <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="rgba(0,0,0,0.4)" />
        </filter>
      </defs>
      {/* T-shirt body + sleeves */}
      <path
        d="
          M 120 40
          L 50  90
          L 20 180
          L 80 195
          L 80 420
          L 320 420
          L 320 195
          L 380 180
          L 350 90
          L 280 40
          C 260 70 220 80 200 80
          C 180 80 140 70 120 40
          Z
        "
        fill={color}
        filter="url(#shirt-shadow)"
        stroke="rgba(0,0,0,0.12)"
        strokeWidth="1.5"
      />
      {/* Neck rib */}
      <ellipse
        cx="200"
        cy="75"
        rx="42"
        ry="14"
        fill={color}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="2"
      />
      {/* Subtle crease lines for realism */}
      <line x1="200" y1="110" x2="200" y2="390" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      <line x1="140" y1="200" x2="155" y2="400" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
      <line x1="260" y1="200" x2="245" y2="400" stroke="rgba(0,0,0,0.03)" strokeWidth="1" />
    </svg>
  );
}

// ─── Design overlay (sits on top of shirt in print area) ─────────────────────

function DesignOverlay({ design }: { design: Design | null }) {
  return (
    <AnimatePresence mode="wait">
      {design && (
        <motion.div
          key={design.id}
          variants={overlayVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute"
          // Print area: centred chest, 28% width of shirt canvas
          style={{ top: "28%", left: "30%", width: "40%", aspectRatio: "1" }}
        >
          <Image
            src={design.imageUrl}
            alt={design.name}
            fill
            className="object-contain mix-blend-multiply"
            onError={(e) => {
              // Show placeholder when design image is missing
              const el = e.currentTarget as HTMLImageElement;
              el.style.display = "none";
              const parent = el.parentElement;
              if (parent) {
                parent.style.background = "rgba(201,168,76,0.15)";
                parent.style.borderRadius = "8px";
                parent.style.display = "flex";
                parent.style.alignItems = "center";
                parent.style.justifyContent = "center";
                parent.innerHTML = `<span style="color:#C9A84C;font-size:11px;letter-spacing:0.1em;text-align:center;padding:8px">${design.name}</span>`;
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Design grid card ─────────────────────────────────────────────────────────

function DesignCard({
  design,
  selected,
  index,
  onClick,
}: {
  design: Design;
  selected: boolean;
  index: number;
  onClick: () => void;
}) {
  return (
    <motion.button
      variants={designCard}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors duration-200 cursor-pointer ${
        selected
          ? "border-brand-gold shadow-[0_0_20px_rgba(201,168,76,0.35)]"
          : "border-brand-border hover:border-brand-gold/40"
      }`}
    >
      <div className="absolute inset-0 bg-brand-surface" />
      <Image
        src={design.imageUrl}
        alt={design.name}
        fill
        className="object-contain p-3"
        onError={(e) => {
          const el = e.currentTarget as HTMLImageElement;
          el.style.display = "none";
          const parent = el.parentElement;
          if (parent) {
            parent.style.display = "flex";
            parent.style.alignItems = "center";
            parent.style.justifyContent = "center";
            parent.innerHTML = `<span style="color:#C9A84C;font-size:10px;text-align:center;padding:4px">${design.name}</span>`;
          }
        }}
      />
      {/* Selected checkmark */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-1.5 right-1.5 w-5 h-5 bg-brand-gold rounded-full flex items-center justify-center"
          >
            <Check size={11} className="text-brand-black" strokeWidth={3} />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Hover label */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-brand-black/90 to-transparent py-2 px-2 translate-y-full group-hover:translate-y-0 transition-transform">
        <p className="text-[10px] text-brand-cream/80 truncate">{design.name}</p>
      </div>
    </motion.button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductCustomizer() {
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);
  const [shirtColor, setShirtColor]         = useState<ShirtColor>(SHIRT_COLORS[0]);
  const [selectedSize, setSelectedSize]     = useState<string>("M");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [quantity, setQuantity]             = useState(1);
  const [isWishlisted, setIsWishlisted]     = useState(false);
  const [addedToCart, setAddedToCart]       = useState(false);

  const filteredDesigns =
    activeCategory === "all"
      ? DESIGNS
      : DESIGNS.filter((d) => d.category === activeCategory);

  // Price: base GHS 150, +30 for custom design
  const price = selectedDesign ? 180 : 150;

  function handleAddToCart() {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
    // TODO: dispatch to cart state / call API
  }

  function handleReset() {
    setSelectedDesign(null);
    setShirtColor(SHIRT_COLORS[0]);
    setSelectedSize("M");
    setQuantity(1);
  }

  return (
    <section className="min-h-screen bg-brand-black py-20 px-4">
      <div className="max-w-7xl mx-auto">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <p className="text-brand-gold text-xs tracking-[0.4em] uppercase mb-4">
            Product Studio
          </p>
          <h2 className="font-heading text-5xl md:text-7xl font-bold text-brand-cream mb-4">
            Design Your Piece
          </h2>
          <div className="w-20 h-px bg-brand-gold mx-auto mb-6" />
          <p className="text-brand-cream/50 max-w-lg mx-auto text-sm leading-relaxed">
            Choose a design, pick your color, select your fit. Every piece is made
            to order — crafted for the culture.
          </p>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">

          {/* ─── LEFT: Mockup preview ─── */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* Shirt canvas */}
            <div className="relative glass-card rounded-2xl p-8 aspect-[4/5] flex items-center justify-center overflow-hidden">
              {/* Subtle grid background */}
              <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: "linear-gradient(#C9A84C 1px, transparent 1px), linear-gradient(90deg, #C9A84C 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* T-shirt + design overlay */}
              <div className="relative w-full max-w-xs mx-auto">
                <TShirtSVG color={shirtColor.hex} />
                <DesignOverlay design={selectedDesign} />
              </div>

              {/* Zoom hint */}
              <div className="absolute top-4 right-4 glass-card rounded-full p-2 opacity-40">
                <ZoomIn size={14} className="text-brand-gold" />
              </div>

              {/* No design placeholder */}
              {!selectedDesign && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-end justify-center pb-10 pointer-events-none"
                >
                  <p className="text-brand-cream/20 text-xs tracking-widest uppercase">
                    Select a design →
                  </p>
                </motion.div>
              )}
            </div>

            {/* Color swatches */}
            <div className="glass-card rounded-xl p-5">
              <p className="text-xs tracking-[0.25em] uppercase text-brand-gold mb-4">
                Shirt Colour — <span className="text-brand-cream">{shirtColor.name}</span>
              </p>
              <div className="flex flex-wrap gap-3">
                {SHIRT_COLORS.map((color) => (
                  <motion.button
                    key={color.hex}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShirtColor(color)}
                    title={color.name}
                    className={`w-9 h-9 rounded-full border-2 transition-all duration-200 ${
                      shirtColor.hex === color.hex
                        ? "border-brand-gold shadow-[0_0_12px_rgba(201,168,76,0.5)]"
                        : "border-transparent hover:border-brand-gold/40"
                    }`}
                    style={{ backgroundColor: color.hex }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* ─── RIGHT: Configurator ─── */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* Product info */}
            <div>
              <p className="text-brand-gold/60 text-xs tracking-widest uppercase mb-2">
                Vintage Gallery Store
              </p>
              <h3 className="font-heading text-4xl font-bold text-brand-cream mb-2">
                Premium Drop Tee
              </h3>
              <div className="flex items-baseline gap-3">
                <motion.span
                  key={price}
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-3xl font-bold text-brand-gold"
                >
                  GHS {price}
                </motion.span>
                {selectedDesign && (
                  <span className="text-xs text-brand-cream/40 line-through">GHS 150</span>
                )}
              </div>
            </div>

            {/* Size selector */}
            <div>
              <p className="text-xs tracking-[0.25em] uppercase text-brand-gold mb-4">
                Size — <span className="text-brand-cream">{selectedSize}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((size) => (
                  <motion.button
                    key={size}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 text-sm font-semibold tracking-wider border transition-all duration-200 ${
                      selectedSize === size
                        ? "border-brand-gold bg-brand-gold text-brand-black"
                        : "border-brand-border text-brand-cream/60 hover:border-brand-gold/50"
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Design picker */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs tracking-[0.25em] uppercase text-brand-gold">
                  Available Designs
                </p>
                {/* Category filter */}
                <div className="flex gap-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`text-[10px] px-2.5 py-1 tracking-wider uppercase transition-colors duration-200 ${
                        activeCategory === cat
                          ? "bg-brand-gold text-brand-black"
                          : "text-brand-cream/40 hover:text-brand-cream"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design grid */}
              <motion.div layout className="grid grid-cols-4 gap-2.5">
                <AnimatePresence mode="popLayout">
                  {filteredDesigns.map((design, i) => (
                    <DesignCard
                      key={design.id}
                      design={design}
                      selected={selectedDesign?.id === design.id}
                      index={i}
                      onClick={() =>
                        setSelectedDesign(
                          selectedDesign?.id === design.id ? null : design
                        )
                      }
                    />
                  ))}
                </AnimatePresence>
              </motion.div>

              {selectedDesign && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-brand-gold text-xs mt-3 tracking-wider"
                >
                  ✦ {selectedDesign.name} — {selectedDesign.category}
                </motion.p>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <p className="text-xs tracking-widest uppercase text-brand-gold">Qty</p>
              <div className="flex items-center border border-brand-border">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-brand-cream/60 hover:text-brand-gold transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center text-sm text-brand-cream">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(10, quantity + 1))}
                  className="w-10 h-10 flex items-center justify-center text-brand-cream/60 hover:text-brand-gold transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-brand-cream/30 text-xs">Max 10 per order</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <motion.button
                onClick={handleAddToCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 btn-gold inline-flex items-center justify-center gap-3"
              >
                <AnimatePresence mode="wait">
                  {addedToCart ? (
                    <motion.span
                      key="added"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <Check size={16} />
                      Added to Cart
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingBag size={16} />
                      Add to Cart — GHS {price * quantity}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Wishlist */}
              <motion.button
                onClick={() => setIsWishlisted((w) => !w)}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                className="w-14 h-14 border border-brand-border flex items-center justify-center hover:border-brand-gold/50 transition-colors"
              >
                <motion.span
                  animate={{ scale: isWishlisted ? [1, 1.4, 1] : 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Heart
                    size={18}
                    className={isWishlisted ? "fill-brand-gold text-brand-gold" : "text-brand-cream/40"}
                  />
                </motion.span>
              </motion.button>

              {/* Reset */}
              <motion.button
                onClick={handleReset}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                title="Reset customization"
                className="w-14 h-14 border border-brand-border flex items-center justify-center hover:border-brand-gold/50 transition-colors text-brand-cream/40 hover:text-brand-gold"
              >
                <RotateCcw size={16} />
              </motion.button>
            </div>

            {/* Trust signals */}
            <div className="border-t border-brand-border pt-6 grid grid-cols-3 gap-4 text-center">
              {[
                { icon: "🚚", label: "48h Delivery", sub: "Accra & surrounds" },
                { icon: "✦",  label: "Made to Order", sub: "Your spec, every time" },
                { icon: "💳", label: "MoMo Pay",     sub: "MTN · Telecel · AirtelTigo" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{item.icon}</span>
                  <p className="text-[11px] font-semibold text-brand-cream/70 leading-tight">
                    {item.label}
                  </p>
                  <p className="text-[10px] text-brand-cream/30 leading-tight">
                    {item.sub}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
