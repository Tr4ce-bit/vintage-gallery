"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, Heart, RotateCcw, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShirtColor {
  name: string;
  hex:  string;
  // Real product photo to use when this color is selected (or null for CSS tint)
  photo?: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

// Each color maps to either a real product photo or falls back to CSS tinting
// over the base (white/light) shirt photo
const SHIRT_COLORS: ShirtColor[] = [
  { name: "Bone White",    hex: "#F5F0E8", photo: "/asset/product-hope.jpg"       },
  { name: "Pitch Black",   hex: "#0D0D0D", photo: "/asset/product-tupac.jpg"      },
  { name: "Royal Indigo",  hex: "#1B1464", photo: "/asset/product-beyourself.jpg" },
  { name: "Vintage Khaki", hex: "#C8B89A"                                          },
  { name: "Forest",        hex: "#2D4A3E"                                          },
  { name: "Slate",         hex: "#3A4A5C"                                          },
  { name: "Burgundy",      hex: "#6B2737"                                          },
  { name: "Sand",          hex: "#D4C4A0"                                          },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const DESIGN_CATEGORIES = [
  { id: "text",    label: "Add Text"    },
  { id: "graphic", label: "Add Graphic" },
  { id: "none",    label: "Plain Tee"   },
];

// ─── Gallery thumbnails of real shirts ────────────────────────────────────────

const GALLERY = [
  { src: "/asset/product-hope.jpg",       caption: "HOPE Collection" },
  { src: "/asset/product-tupac.jpg",      caption: "Icons Series"    },
  { src: "/asset/product-beyourself.jpg", caption: "Be Yourself"     },
];

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
  const [activeGallery, setActiveGallery]   = useState(0);

  // Live prices from admin
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
      image:      shirtColor.photo ?? "/asset/product-hope.jpg",
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

  // Text readable on the selected shirt photo
  const isDarkShirt = ["#0D0D0D","#1B1464","#2D4A3E","#3A4A5C","#6B2737"].includes(shirtColor.hex);

  // Preview image: use real photo if available, else use base shirt with CSS tint
  const previewPhoto = shirtColor.photo ?? "/asset/product-hope.jpg";

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

          {/* LEFT — Real shirt preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex flex-col gap-5"
          >
            {/* Main preview: real shirt photo */}
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800"
              style={{ aspectRatio: "3/4" }}>

              {/* Real shirt photo */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={previewPhoto}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={previewPhoto}
                    alt={shirtColor.name}
                    fill
                    className="object-cover object-center"
                    priority
                  />
                  {/* Color tint for colors without a real photo */}
                  {!shirtColor.photo && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundColor: shirtColor.hex,
                        mixBlendMode: "multiply",
                        opacity: 0.55,
                      }}
                    />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Text overlay on the shirt */}
              {designType === "text" && customText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  style={{ paddingTop: "20%" }}
                >
                  <span
                    className="font-serif text-center leading-tight break-words px-8 py-3 rounded-lg"
                    style={{
                      fontSize: "clamp(1rem, 3vw, 1.6rem)",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      color: isDarkShirt ? "rgba(255,255,255,0.92)" : "rgba(0,0,0,0.82)",
                      textTransform: "uppercase",
                      textShadow: isDarkShirt
                        ? "0 1px 4px rgba(0,0,0,0.5)"
                        : "0 1px 4px rgba(255,255,255,0.5)",
                    }}
                  >
                    {customText}
                  </span>
                </motion.div>
              )}

              {/* Graphic placeholder */}
              {designType === "graphic" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute flex items-center justify-center rounded-xl border-2 border-dashed"
                  style={{
                    top: "25%", left: "20%", width: "60%", height: "35%",
                    borderColor: isDarkShirt ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)",
                    background: isDarkShirt ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                  }}
                >
                  <span
                    className="font-sans text-[9px] tracking-[0.2em] uppercase"
                    style={{ color: isDarkShirt ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.35)" }}
                  >
                    Your Graphic
                  </span>
                </motion.div>
              )}

              {/* Colour label badge */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="w-2.5 h-2.5 rounded-full border border-white/20"
                  style={{ backgroundColor: shirtColor.hex }} />
                <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-white/80">
                  {shirtColor.name}
                </span>
              </div>

              {/* "Real shirt" label */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5">
                <span className="font-sans text-[9px] tracking-[0.15em] uppercase text-white/60">
                  Studio Shot
                </span>
              </div>
            </div>

            {/* Real shirt gallery thumbnails */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-3">
                Our Shirts — Real Studio Photos
              </p>
              <div className="grid grid-cols-3 gap-2">
                {GALLERY.map((g, i) => (
                  <button
                    key={g.src}
                    onClick={() => setActiveGallery(i)}
                    className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                      activeGallery === i
                        ? "ring-2 ring-white ring-offset-2 ring-offset-zinc-900"
                        : "opacity-60 hover:opacity-90"
                    }`}
                    style={{ aspectRatio: "3/4" }}
                  >
                    <Image src={g.src} alt={g.caption} fill className="object-cover object-center" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <p className="font-sans text-[8px] text-white/80 uppercase tracking-wide leading-tight">
                        {g.caption}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Colour swatches */}
              <div className="mt-4 pt-4 border-t border-zinc-800">
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light mb-3">
                  Shirt Colour
                </p>
                <div className="flex flex-wrap gap-2.5">
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
                      style={{ backgroundColor: c.hex, border: "1px solid rgba(255,255,255,0.12)" }}
                    />
                  ))}
                </div>
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
                <p className="font-sans text-[10px] text-zinc-500 font-light mt-1">
                  Includes custom design (+GH₵ {designAddonGHS})
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
              <Link href="/sizing-guide"
                className="inline-block font-sans text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2 mt-2">
                Sizing guide →
              </Link>
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
                disabled={!pricesLoaded}
                className="flex-1 flex items-center justify-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.18em] uppercase py-4 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-50"
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
