"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, Heart, RotateCcw, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShirtColor {
  name: string;
  hex:  string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SHIRT_COLORS: ShirtColor[] = [
  { name: "Bone White",    hex: "#F5F0E8" },
  { name: "Pitch Black",   hex: "#0D0D0D" },
  { name: "Royal Indigo",  hex: "#1B1464" },
  { name: "Vintage Khaki", hex: "#C8B89A" },
  { name: "Forest",        hex: "#2D4A3E" },
  { name: "Slate",         hex: "#3A4A5C" },
  { name: "Burgundy",      hex: "#6B2737" },
  { name: "Sand",          hex: "#D4C4A0" },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const DESIGN_CATEGORIES = [
  { id: "text",    label: "Add Text"    },
  { id: "graphic", label: "Add Graphic" },
  { id: "none",    label: "Plain Tee"   },
];

// ─── T-Shirt SVG ──────────────────────────────────────────────────────────────

function TShirtSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 400 440" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-2xl">
      <path
        d="M 120 40 L 50 90 L 20 180 L 80 195 L 80 420 L 320 420 L 320 195 L 380 180 L 350 90 L 280 40
           C 260 70 220 80 200 80 C 180 80 140 70 120 40 Z"
        fill={color}
        stroke="rgba(0,0,0,0.10)"
        strokeWidth="1.5"
      />
      <ellipse cx="200" cy="78" rx="42" ry="14" fill={color} stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />
      <line x1="200" y1="110" x2="200" y2="395" stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProductCustomizer() {
  const { isSignedIn }                      = useAuth();
  const addItem                             = useCartStore((s) => s.addItem);

  const [shirtColor, setShirtColor]         = useState<ShirtColor>(SHIRT_COLORS[0]);
  const [selectedSize, setSelectedSize]     = useState<string>("M");
  const [customText, setCustomText]         = useState("");
  const [designType, setDesignType]         = useState("none");
  const [quantity, setQuantity]             = useState(1);
  const [wishlisted, setWishlisted]         = useState(false);
  const [addedToCart, setAddedToCart]       = useState(false);
  const [authToast, setAuthToast]           = useState(false);

  const price = designType === "none" ? 150 : 180;

  const showAuthToast = () => {
    setAuthToast(true);
    setTimeout(() => setAuthToast(false), 3000);
  };

  const handleWishlist = () => {
    if (!isSignedIn) { showAuthToast(); return; }
    setWishlisted((w) => !w);
  };

  const handleAddToCart = () => {
    addItem({
      productId: `custom-${shirtColor.name}`,
      slug:       "custom-tee",
      name:       `Custom Tee — ${shirtColor.name}`,
      collection: "Custom Studio",
      price,
      image:      "/asset/product-hope.jpg",
      size:       selectedSize,
      color:      shirtColor.name,
      quantity,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleReset = () => {
    setShirtColor(SHIRT_COLORS[0]);
    setSelectedSize("M");
    setCustomText("");
    setDesignType("none");
    setQuantity(1);
  };

  // Text color on shirt (readable against the shirt color)
  const isDarkShirt = ["#0D0D0D","#1B1464","#2D4A3E","#3A4A5C","#6B2737"].includes(shirtColor.hex);

  return (
    <section className="min-h-screen bg-zinc-950 pt-[60px]">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-16 md:py-24">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65 }}
          className="mb-16"
        >
          <p className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-500 font-light mb-3">
            Custom Studio
          </p>
          <h1
            className="font-serif text-white leading-none"
            style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 300 }}
          >
            Design Your <em style={{ fontStyle: "italic" }}>Piece.</em>
          </h1>
        </motion.div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-20">

          {/* LEFT — Shirt preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            {/* Mockup canvas */}
            <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 p-10 flex items-center justify-center overflow-hidden" style={{ minHeight: "400px" }}>
              {/* Subtle dot grid */}
              <div className="absolute inset-0 opacity-[0.04]"
                style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
              />

              <div className="relative w-full max-w-[260px] mx-auto">
                <TShirtSVG color={shirtColor.hex} />

                {/* Custom text overlay on shirt */}
                {designType === "text" && customText && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ top: "30%", left: "20%", width: "60%", height: "30%" }}
                  >
                    <span
                      className="font-serif text-center leading-tight break-words w-full"
                      style={{
                        fontSize: "clamp(0.7rem, 3vw, 1.1rem)",
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        color: isDarkShirt ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.75)",
                        textTransform: "uppercase",
                      }}
                    >
                      {customText}
                    </span>
                  </motion.div>
                )}

                {/* Graphic placeholder */}
                {designType === "graphic" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute flex items-center justify-center rounded-lg border border-dashed"
                    style={{
                      top: "28%", left: "28%", width: "44%", height: "32%",
                      borderColor: isDarkShirt ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)",
                    }}
                  >
                    <span
                      className="font-sans text-[8px] tracking-[0.2em] uppercase"
                      style={{ color: isDarkShirt ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.3)" }}
                    >
                      Your graphic
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Colour label badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-zinc-800/80 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-zinc-600" style={{ backgroundColor: shirtColor.hex }} />
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-400">{shirtColor.name}</span>
              </div>
            </div>

            {/* Colour swatches */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-4">Shirt Colour</p>
              <div className="flex flex-wrap gap-3">
                {SHIRT_COLORS.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => setShirtColor(c)}
                    title={c.name}
                    className={`w-9 h-9 rounded-full transition-all duration-200 ${
                      shirtColor.hex === c.hex
                        ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900 scale-110"
                        : "hover:scale-105 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundColor: c.hex, border: "1px solid rgba(255,255,255,0.1)" }}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* RIGHT — Configurator */}
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
              <motion.p key={price} initial={{ y: -6, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="font-serif text-white leading-none" style={{ fontSize: "2.5rem", fontWeight: 300 }}>
                GH₵ {price}
              </motion.p>
              {designType !== "none" && (
                <p className="font-sans text-[10px] text-zinc-500 font-light mt-1">
                  Includes custom design (+GH₵30)
                </p>
              )}
            </div>

            {/* Design type */}
            <div>
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-4">
                Customisation
              </p>
              <div className="flex gap-2">
                {DESIGN_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDesignType(cat.id)}
                    className={`flex-1 py-3 rounded-xl font-sans text-[10px] tracking-[0.15em] uppercase font-light border transition-all duration-200 ${
                      designType === cat.id
                        ? "bg-white text-zinc-900 border-white"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {cat.label}
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
                    Your Text (max 20 characters)
                  </p>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.slice(0, 20))}
                    placeholder="e.g. ACCRA"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 font-serif text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors tracking-widest uppercase"
                  />
                </motion.div>
              )}
              {designType === "graphic" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="rounded-xl border border-dashed border-zinc-700 p-6 text-center">
                    <p className="font-sans text-sm text-zinc-400 font-light mb-1">
                      Custom graphic uploads coming soon.
                    </p>
                    <p className="font-sans text-[10px] text-zinc-600">
                      DM us on Instagram to discuss your design.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Size */}
            <div>
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-4">
                Size — <span className="text-zinc-300">{selectedSize}</span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-11 h-11 rounded-full font-sans text-[11px] border transition-all duration-200 ${
                      selectedSize === s
                        ? "bg-white text-zinc-900 border-white"
                        : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div className="flex items-center gap-5">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">Qty</p>
              <div className="flex items-center border border-zinc-800 rounded-full overflow-hidden">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">−</button>
                <span className="w-8 text-center font-sans text-sm text-zinc-300">{quantity}</span>
                <button onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">+</button>
              </div>
              <span className="font-sans text-[10px] text-zinc-600 font-light">Max 10 per order</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.18em] uppercase py-4 rounded-full hover:bg-zinc-100 transition-colors"
              >
                {addedToCart
                  ? <><Check size={14} /> Added to Cart</>
                  : <><ShoppingBag size={14} /> Add to Cart — GH₵ {price * quantity}</>
                }
              </button>

              {/* Wishlist */}
              <button
                onClick={handleWishlist}
                className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center hover:border-zinc-600 transition-colors"
              >
                <Heart size={16} className={wishlisted ? "fill-white text-white" : "text-zinc-500"} />
              </button>

              {/* Reset */}
              <button
                onClick={handleReset}
                title="Reset"
                className="w-14 h-14 rounded-full border border-zinc-800 flex items-center justify-center hover:border-zinc-600 transition-colors text-zinc-500 hover:text-zinc-300"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Cart link */}
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
                { icon: "🚚", label: "48h Delivery",  sub: "Accra & surrounds"          },
                { icon: "✦",  label: "Made to Order", sub: "Your spec, every time"       },
                { icon: "💳", label: "MoMo Pay",      sub: "MTN · Telecel · AirtelTigo"  },
              ].map((item) => (
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-full px-5 py-3 shadow-xl"
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
