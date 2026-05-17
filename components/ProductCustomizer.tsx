"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, Heart, RotateCcw, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface StudioDesign {
  id:       string;
  name:     string;
  imageUrl: string;
  category: string | null;
}

interface ShirtColor {
  name:  string;
  hex:   string;
  light: boolean;
}

// ─── Colour palette ───────────────────────────────────────────────────────────

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
  { id: "none",    label: "Plain"    },
  { id: "text",    label: "Text"     },
  { id: "graphic", label: "Graphic"  },
];

// ─── Plain Shirt SVG (front) ──────────────────────────────────────────────────

function PlainShirt({ color, light }: { color: string; light: boolean }) {
  const shadowAlpha = light ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.30)";
  const hiAlpha     = light ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)";
  const seam        = light ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.25)";
  const collarInner = light ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.22)";
  const hemLine     = light ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.28)";
  const BODY = `M 162,54 C 146,56 110,70 80,82 L 16,162 L 14,186
    C 52,198 94,188 112,182 L 112,450 L 288,450 L 288,182
    C 306,188 348,198 386,186 L 384,162 L 320,82
    C 290,70 254,56 238,54 C 227,88 214,106 200,106
    C 186,106 173,88 162,54 Z`;

  return (
    <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}>
      <defs>
        <linearGradient id="gs" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="22%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="78%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>
        <linearGradient id="gtb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={hiAlpha} />
          <stop offset="35%"  stopColor="rgba(255,255,255,0)" />
          <stop offset="80%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
        </linearGradient>
        <radialGradient id="gc" cx="50%" cy="42%" r="32%">
          <stop offset="0%"   stopColor={hiAlpha} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="gls" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
        <linearGradient id="grs" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </linearGradient>
      </defs>
      <path d={BODY} fill={color} />
      <path d={BODY} fill="url(#gs)" />
      <path d={BODY} fill="url(#gtb)" />
      <path d={BODY} fill="url(#gc)" />
      {/* Collar */}
      <path d="M 165,56 C 174,87 186,104 200,104 C 214,104 226,87 235,56"
        stroke={shadowAlpha} strokeWidth="8" strokeLinecap="round" fill="none" />
      <path d="M 168,58 C 176,86 187,102 200,102 C 213,102 224,86 232,58"
        stroke={collarInner} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M 171,60 C 178,85 188,100 200,100 C 212,100 222,85 229,60"
        stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Shoulder seams */}
      <path d="M 163,56 C 140,64 110,72 82,82" stroke={seam} strokeWidth="1.5" fill="none" />
      <path d="M 237,56 C 260,64 290,72 318,82" stroke={seam} strokeWidth="1.5" fill="none" />
      {/* Sleeve hems */}
      <path d="M 14,186 C 52,200 93,189 113,183" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 386,186 C 348,200 307,189 287,183" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 16,183 C 52,195 91,186 112,180" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 384,183 C 348,195 309,186 288,180" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Side seams */}
      <path d="M 112,190 L 112,450" stroke={seam} strokeWidth="1.2" fill="none" />
      <path d="M 288,190 L 288,450" stroke={seam} strokeWidth="1.2" fill="none" />
      {/* Bottom hem */}
      <path d="M 112,450 L 288,450" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 112,447 L 288,447" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Centre placket */}
      <line x1="200" y1="108" x2="200" y2="444" stroke={seam} strokeWidth="0.8" opacity="0.5" />
    </svg>
  );
}

// ─── Plain Shirt SVG (back) ───────────────────────────────────────────────────

function PlainShirtBack({ color, light }: { color: string; light: boolean }) {
  const shadowAlpha = light ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.30)";
  const hiAlpha     = light ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)";
  const seam        = light ? "rgba(0,0,0,0.10)" : "rgba(0,0,0,0.25)";
  const hemLine     = light ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.28)";
  // Back body: same shape but collar path is a shallow arc (back neckline)
  const BODY = `M 162,54 C 146,56 110,70 80,82 L 16,162 L 14,186
    C 52,198 94,188 112,182 L 112,450 L 288,450 L 288,182
    C 306,188 348,198 386,186 L 384,162 L 320,82
    C 290,70 254,56 238,54 C 225,60 175,60 162,54 Z`;

  return (
    <svg viewBox="0 0 400 480" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full" style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.5))" }}>
      <defs>
        <linearGradient id="gsb" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(0,0,0,0.18)" />
          <stop offset="22%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="78%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>
        <linearGradient id="gtbb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={hiAlpha} />
          <stop offset="35%"  stopColor="rgba(255,255,255,0)" />
          <stop offset="80%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.10)" />
        </linearGradient>
        <radialGradient id="gcb" cx="50%" cy="42%" r="32%">
          <stop offset="0%"   stopColor={hiAlpha} />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
      </defs>
      <path d={BODY} fill={color} />
      <path d={BODY} fill="url(#gsb)" />
      <path d={BODY} fill="url(#gtbb)" />
      <path d={BODY} fill="url(#gcb)" />
      {/* Back neckline rib */}
      <path d="M 162,54 C 175,62 225,62 238,54" stroke={shadowAlpha} strokeWidth="6" strokeLinecap="round" fill="none" />
      <path d="M 165,56 C 178,63 222,63 235,56" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Shoulder seams */}
      <path d="M 163,56 C 140,64 110,72 82,82" stroke={seam} strokeWidth="1.5" fill="none" />
      <path d="M 237,56 C 260,64 290,72 318,82" stroke={seam} strokeWidth="1.5" fill="none" />
      {/* Sleeve hems */}
      <path d="M 14,186 C 52,200 93,189 113,183" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 386,186 C 348,200 307,189 287,183" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 16,183 C 52,195 91,186 112,180" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <path d="M 384,183 C 348,195 309,186 288,180" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
      {/* Side seams */}
      <path d="M 112,190 L 112,450" stroke={seam} strokeWidth="1.2" fill="none" />
      <path d="M 288,190 L 288,450" stroke={seam} strokeWidth="1.2" fill="none" />
      {/* Bottom hem */}
      <path d="M 112,450 L 288,450" stroke={hemLine} strokeWidth="5" strokeLinecap="round" fill="none" />
      <path d="M 112,447 L 288,447" stroke={hiAlpha} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ─── Print Zone overlay ───────────────────────────────────────────────────────

function PrintZone({
  light, designType, customText, selectedDesign,
}: {
  light: boolean; designType: string; customText: string; selectedDesign: StudioDesign | null;
}) {
  if (designType === "none") return null;
  const textCol   = light ? "rgba(0,0,0,0.78)"   : "rgba(255,255,255,0.90)";
  const borderCol = light ? "rgba(0,0,0,0.18)"   : "rgba(255,255,255,0.22)";
  return (
    <div className="absolute pointer-events-none flex items-center justify-center"
      style={{ left: "29%", right: "29%", top: "30%", height: "28%" }}>
      {designType === "text" && customText && (
        <motion.span key={customText} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }} className="font-serif text-center leading-tight break-words w-full"
          style={{ fontSize: "clamp(0.75rem,2.8vw,1.25rem)", fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: textCol,
            textShadow: light ? "0 1px 3px rgba(255,255,255,0.4)" : "0 1px 3px rgba(0,0,0,0.5)" }}>
          {customText}
        </motion.span>
      )}
      {designType === "text" && !customText && (
        <span className="font-sans text-center"
          style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: borderCol }}>
          Your text here
        </span>
      )}
      {designType === "graphic" && selectedDesign && (
        <motion.div key={selectedDesign.id} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }} className="relative w-full h-full">
          <Image src={selectedDesign.imageUrl} alt={selectedDesign.name} fill
            className="object-contain" style={{ mixBlendMode: light ? "multiply" : "screen" }} unoptimized />
        </motion.div>
      )}
      {designType === "graphic" && !selectedDesign && (
        <div className="w-full h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1"
          style={{ borderColor: borderCol }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: borderCol, fontFamily: "sans-serif" }}>
            Pick a graphic
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Ambient glow ─────────────────────────────────────────────────────────────

function AmbientGlow({ hex }: { hex: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Main color glow */}
      <div className="absolute top-[10%] left-[20%] w-[60%] h-[55%] rounded-full blur-[80px] opacity-25 transition-all duration-700"
        style={{ background: hex }} />
      {/* Floor reflection */}
      <div className="absolute bottom-0 left-[30%] w-[40%] h-[30%] rounded-full blur-[60px] opacity-10 transition-all duration-700"
        style={{ background: hex }} />
    </div>
  );
}

// ─── Perspective grid floor ───────────────────────────────────────────────────

function GridFloor() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[38%] overflow-hidden pointer-events-none">
      <div className="w-full h-full"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          transform: "perspective(350px) rotateX(52deg)",
          transformOrigin: "center top",
          maskImage: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.5))",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 30%, rgba(0,0,0,0.5))",
        }} />
    </div>
  );
}

// ─── Holographic glass panel ──────────────────────────────────────────────────

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border ${className}`}
      style={{
        background:     "rgba(255,255,255,0.04)",
        borderColor:    "rgba(255,255,255,0.08)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductCustomizer() {
  const { isSignedIn } = useAuth();
  const addItem        = useCartStore((s) => s.addItem);

  // Shirt config
  const [color,          setColor]          = useState<ShirtColor>(SHIRT_COLORS[0]);
  const [size,           setSize]           = useState("M");
  const [designType,     setDesignType]     = useState("none");
  const [customText,     setCustomText]     = useState("");
  const [quantity,       setQuantity]       = useState(1);
  const [selectedDesign, setSelectedDesign] = useState<StudioDesign | null>(null);

  // 3D rotation
  const [rotateY,    setRotateY]    = useState(-18);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startRotY: 0 });

  // Remote data
  const [designs,        setDesigns]        = useState<StudioDesign[]>([]);
  const [designsLoaded,  setDesignsLoaded]  = useState(false);
  const [basePriceGHS,   setBasePriceGHS]   = useState(150);
  const [designAddonGHS, setDesignAddonGHS] = useState(30);
  const [pricesLoaded,   setPricesLoaded]   = useState(false);

  // UI state
  const [wishlisted,  setWishlisted]  = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [authToast,   setAuthToast]   = useState(false);
  const [sizeError,   setSizeError]   = useState(false);
  const [mobileTab,   setMobileTab]   = useState<"color" | "design">("color");

  useEffect(() => {
    fetch("/api/studio").then(r => r.json()).then(d => {
      setBasePriceGHS(d.basePriceGHS ?? 150);
      setDesignAddonGHS(d.designAddonGHS ?? 30);
      setPricesLoaded(true);
    }).catch(() => setPricesLoaded(true));

    fetch("/api/studio/designs").then(r => r.json()).then(d => {
      setDesigns(d.designs ?? []);
      setDesignsLoaded(true);
    }).catch(() => setDesignsLoaded(true));
  }, []);

  const price = designType === "none" ? basePriceGHS : basePriceGHS + designAddonGHS;

  // ── 3D drag handlers ─────────────────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startRotY: rotateY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, [rotateY]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    setRotateY(dragRef.current.startRotY + dx * 0.45);
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    setRotateY(prev => {
      const mod = ((prev % 360) + 360) % 360;
      if (mod <= 90 || mod >= 270) return Math.round(prev / 360) * 360;
      return Math.round((prev - 180) / 360) * 360 + 180;
    });
  }, []);

  // ── Cart handler ─────────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (!size) { setSizeError(true); return; }
    setSizeError(false);
    addItem({
      productId: `custom-${color.name}-${size}`,
      slug:       "custom-tee",
      name:       `Custom Tee — ${color.name}${customText ? ` · "${customText}"` : ""}${selectedDesign ? ` · ${selectedDesign.name}` : ""}`,
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
    setSelectedDesign(null);
    setQuantity(1);
    setRotateY(-18);
  };

  // ── Shared control sections ───────────────────────────────────────────────────

  const ColorControls = () => (
    <div className="p-5 space-y-4">
      <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-light">
        Shirt Colour
      </p>
      <div className="flex flex-wrap gap-3">
        {SHIRT_COLORS.map(c => (
          <button key={c.hex} onClick={() => setColor(c)} title={c.name}
            className={`relative w-9 h-9 rounded-full transition-all duration-200 ${
              color.hex === c.hex
                ? "ring-2 ring-white ring-offset-2 ring-offset-black scale-110"
                : "opacity-50 hover:opacity-100 hover:scale-105"
            }`}
            style={{ backgroundColor: c.hex, border: "1px solid rgba(255,255,255,0.12)" }}
          />
        ))}
      </div>
      <p className="font-sans text-[10px] text-white/30 font-light">{color.name}</p>
    </div>
  );

  const DesignControls = () => (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
      {/* Type tabs */}
      <div>
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-light mb-3">
          Customisation
        </p>
        <div className="flex gap-1.5">
          {DESIGN_TYPES.map(dt => (
            <button key={dt.id}
              onClick={() => {
                setDesignType(dt.id);
                if (dt.id !== "text")    setCustomText("");
                if (dt.id !== "graphic") setSelectedDesign(null);
              }}
              className={`flex-1 py-2.5 rounded-xl font-sans text-[10px] tracking-[0.1em] uppercase font-light border transition-all duration-200 ${
                designType === dt.id
                  ? "bg-white text-zinc-900 border-white"
                  : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-200"
              }`}>
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text input */}
      <AnimatePresence>
        {designType === "text" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-light">
              Your Text · max 20 chars
            </p>
            <input type="text" value={customText}
              onChange={e => setCustomText(e.target.value.slice(0, 20).toUpperCase())}
              placeholder="E.G. ACCRA"
              className="w-full rounded-xl px-4 py-3 font-serif text-white text-center tracking-[0.3em] uppercase placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            />
            <p className="font-sans text-[9px] text-zinc-600 font-light">
              Printed on chest · live preview updates above
            </p>
          </motion.div>
        )}

        {designType === "graphic" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-light">
              Choose a Graphic
            </p>
            {!designsLoaded ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
                <span className="font-sans text-xs text-zinc-500">Loading…</span>
              </div>
            ) : designs.length === 0 ? (
              <div className="rounded-xl py-6 text-center" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
                <p className="font-sans text-xs text-zinc-500 font-light">No graphics yet.</p>
                <p className="font-sans text-[10px] text-zinc-700 mt-1">DM us your design on Instagram.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-0.5">
                {designs.map(d => {
                  const active = selectedDesign?.id === d.id;
                  return (
                    <button key={d.id} onClick={() => setSelectedDesign(active ? null : d)}
                      title={d.name}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        active ? "border-white" : "border-transparent hover:border-white/30"
                      }`}
                      style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Image src={d.imageUrl} alt={d.name} fill className="object-contain p-1.5" unoptimized />
                    </button>
                  );
                })}
              </div>
            )}
            {selectedDesign && (
              <p className="font-sans text-[10px] text-zinc-400">
                {selectedDesign.name}
                <button onClick={() => setSelectedDesign(null)} className="ml-2 text-zinc-600 hover:text-zinc-300 underline underline-offset-2">Clear</button>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <section className="relative min-h-screen overflow-hidden" style={{ background: "linear-gradient(160deg, #0a0a0f 0%, #030303 60%, #050508 100%)" }}>

      {/* Global keyframes */}
      <style>{`
        @keyframes vr-float {
          0%,100% { transform: translateY(0px) rotateZ(-0.5deg); }
          50%      { transform: translateY(-14px) rotateZ(0.5deg); }
        }
        @keyframes vr-pulse {
          0%,100% { opacity: 0.25; }
          50%      { opacity: 0.38; }
        }
      `}</style>

      {/* Atmosphere */}
      <AmbientGlow hex={color.hex} />
      <GridFloor />

      {/* Subtle top vignette */}
      <div className="absolute top-0 left-0 right-0 h-[35%] pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)" }} />

      {/* Header bar */}
      <div className="relative z-10 pt-[72px] pb-6 px-6 flex items-end justify-between">
        <div>
          <p className="font-sans text-[8px] tracking-[0.5em] uppercase text-zinc-600 font-light mb-1">Vintage Gallery</p>
          <h1 className="font-serif text-white leading-none" style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 300 }}>
            Custom Studio
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {pricesLoaded && (
            <motion.div key={price} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="font-sans text-sm text-white/60 font-light">
              GH₵ {price}
            </motion.div>
          )}
          <button onClick={handleReset} title="Reset"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex relative z-10 items-start justify-center gap-6 px-8 pb-8" style={{ minHeight: "calc(100vh - 170px)" }}>

        {/* Left panel — colours */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15, duration: 0.7 }}
          className="w-[220px] shrink-0 mt-6 sticky top-6">
          <GlassPanel>
            <ColorControls />
          </GlassPanel>

          {/* Drag hint */}
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-700 font-light text-center mt-4">
            ← drag shirt to rotate →
          </p>
        </motion.div>

        {/* Center — 3D shirt */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.8 }}
          className="flex-1 flex flex-col items-center justify-center py-6 max-w-[420px]">

          {/* 3D shirt container */}
          <div style={{ perspective: "900px" }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
            className={isDragging ? "cursor-grabbing" : "cursor-grab"}>
            <motion.div
              animate={isDragging ? {} : { y: [0, -14, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <div style={{
                width: "300px", height: "360px",
                transformStyle: "preserve-3d",
                transform: `rotateY(${rotateY}deg)`,
                transition: isDragging ? "none" : "transform 0.7s cubic-bezier(0.34,1.4,0.64,1)",
              }}>
                {/* Front face */}
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                  <div className="relative w-full h-full">
                    <PlainShirt color={color.hex} light={color.light} />
                    <PrintZone light={color.light} designType={designType} customText={customText} selectedDesign={selectedDesign} />
                  </div>
                </div>
                {/* Back face */}
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <div className="relative w-full h-full">
                    <PlainShirtBack color={color.hex} light={color.light} />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="font-sans text-[9px] tracking-[0.3em] uppercase opacity-20"
                        style={{ color: color.light ? "#000" : "#fff" }}>Back</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Rotation indicator dots */}
          <div className="flex gap-2 mt-6">
            {[0, 180].map(angle => {
              const mod = ((rotateY % 360) + 360) % 360;
              const isFront = mod <= 90 || mod >= 270;
              const active  = angle === 0 ? isFront : !isFront;
              return (
                <button key={angle} onClick={() => setRotateY(angle)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${active ? "w-6 bg-white" : "w-1.5 bg-white/20"}`} />
              );
            })}
          </div>

          {/* Size selector */}
          <div className="mt-8 w-full">
            <div className="flex items-center justify-between mb-3">
              <p className={`font-sans text-[9px] tracking-[0.3em] uppercase font-light ${sizeError ? "text-red-400" : "text-zinc-500"}`}>
                {sizeError ? "Please select a size" : "Size"}
              </p>
              <Link href="/sizing-guide" className="font-sans text-[9px] uppercase tracking-[0.15em] text-zinc-700 hover:text-zinc-400 transition-colors underline underline-offset-2">
                Size Guide
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {SIZES.map(s => (
                <button key={s} onClick={() => { setSize(s); setSizeError(false); }}
                  className={`w-11 h-11 rounded-full font-sans text-[11px] border transition-all duration-200 ${
                    size === s ? "bg-white text-zinc-900 border-white"
                      : "border-white/15 text-zinc-500 hover:border-white/40 hover:text-zinc-200"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-6 flex items-center gap-4">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">Qty</p>
            <div className="flex items-center rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">
                −
              </button>
              <span className="w-8 text-center font-sans text-sm text-zinc-300">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">
                +
              </button>
            </div>
            <span className="font-sans text-[9px] text-zinc-700 font-light">max 10</span>
          </div>
        </motion.div>

        {/* Right panel — design */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2, duration: 0.7 }}
          className="w-[240px] shrink-0 mt-6 space-y-4 sticky top-6">
          <GlassPanel>
            <DesignControls />
          </GlassPanel>

          {/* Price display */}
          <GlassPanel>
            <div className="p-5 space-y-1">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">Total</p>
              <motion.p key={price} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="font-serif text-white text-3xl font-light">
                {pricesLoaded ? `GH₵ ${price * quantity}` : "—"}
              </motion.p>
              {designType !== "none" && (
                <p className="font-sans text-[9px] text-zinc-600 font-light">
                  Base GH₵{basePriceGHS} + design GH₵{designAddonGHS}
                </p>
              )}
            </div>
          </GlassPanel>

          {/* Actions */}
          <div className="space-y-2">
            <button onClick={handleAddToCart} disabled={!pricesLoaded}
              className="w-full flex items-center justify-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.15em] uppercase py-4 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-40">
              {addedToCart ? <><Check size={14} /> Added!</> : <><ShoppingBag size={14} /> Add to Cart</>}
            </button>
            <div className="flex gap-2">
              <button onClick={() => { if (!isSignedIn) { setAuthToast(true); setTimeout(() => setAuthToast(false), 3000); return; } setWishlisted(w => !w); }}
                className="flex-1 flex items-center justify-center gap-2 font-sans text-[10px] tracking-[0.12em] uppercase py-3 rounded-full transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)", color: wishlisted ? "#fff" : "rgba(255,255,255,0.4)" }}>
                <Heart size={12} className={wishlisted ? "fill-white" : ""} />
                {wishlisted ? "Saved" : "Wishlist"}
              </button>
              {addedToCart && (
                <Link href="/cart"
                  className="flex items-center justify-center gap-1.5 font-sans text-[10px] tracking-[0.12em] uppercase py-3 px-4 rounded-full transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)" }}>
                  Cart <ArrowRight size={10} />
                </Link>
              )}
            </div>
          </div>

          {/* Trust signals */}
          <GlassPanel>
            <div className="p-4 space-y-2.5">
              {[
                { icon: "✦", text: "Made to Order" },
                { icon: "🚚", text: "48h Accra Delivery" },
                { icon: "💳", text: "MoMo · Card" },
              ].map(t => (
                <div key={t.text} className="flex items-center gap-2.5">
                  <span className="text-sm">{t.icon}</span>
                  <span className="font-sans text-[10px] text-zinc-500 font-light">{t.text}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* ── MOBILE LAYOUT ──────────────────────────────────────────────────────── */}
      <div className="lg:hidden relative z-10 pb-36">

        {/* 3D Shirt */}
        <div className="flex flex-col items-center pt-2 pb-4">
          <div style={{ perspective: "900px" }}
            onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
            className={isDragging ? "cursor-grabbing" : "cursor-grab"}>
            <motion.div animate={isDragging ? {} : { y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <div style={{
                width: "240px", height: "288px",
                transformStyle: "preserve-3d",
                transform: `rotateY(${rotateY}deg)`,
                transition: isDragging ? "none" : "transform 0.7s cubic-bezier(0.34,1.4,0.64,1)",
              }}>
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
                  <div className="relative w-full h-full">
                    <PlainShirt color={color.hex} light={color.light} />
                    <PrintZone light={color.light} designType={designType} customText={customText} selectedDesign={selectedDesign} />
                  </div>
                </div>
                <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  <div className="relative w-full h-full">
                    <PlainShirtBack color={color.hex} light={color.light} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          {/* Rotation dots */}
          <div className="flex gap-2 mt-3">
            {[0, 180].map(angle => {
              const mod = ((rotateY % 360) + 360) % 360;
              const active = angle === 0 ? (mod <= 90 || mod >= 270) : !(mod <= 90 || mod >= 270);
              return <button key={angle} onClick={() => setRotateY(angle)}
                className={`h-1 rounded-full transition-all duration-300 ${active ? "w-5 bg-white" : "w-1 bg-white/20"}`} />;
            })}
          </div>
          <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-zinc-700 font-light mt-2">drag to rotate</p>
        </div>

        {/* Mobile control tabs */}
        <div className="px-4 mb-3">
          <div className="flex rounded-xl overflow-hidden" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {(["color", "design"] as const).map(tab => (
              <button key={tab} onClick={() => setMobileTab(tab)}
                className={`flex-1 py-2.5 font-sans text-[10px] tracking-[0.15em] uppercase transition-all duration-200 ${
                  mobileTab === tab ? "bg-white text-zinc-900" : "text-zinc-500"
                }`}>
                {tab === "color" ? "Colour" : "Design"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4">
          <GlassPanel>
            {mobileTab === "color" ? <ColorControls /> : <DesignControls />}
          </GlassPanel>
        </div>

        {/* Size + qty on mobile */}
        <div className="px-4 mt-4 space-y-4">
          <GlassPanel>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className={`font-sans text-[9px] tracking-[0.3em] uppercase font-light ${sizeError ? "text-red-400" : "text-zinc-500"}`}>
                  {sizeError ? "Select a size" : "Size"}
                </p>
                <Link href="/sizing-guide" className="font-sans text-[9px] uppercase tracking-[0.1em] text-zinc-700 underline underline-offset-2">
                  Size Guide
                </Link>
              </div>
              <div className="flex gap-2 flex-wrap">
                {SIZES.map(s => (
                  <button key={s} onClick={() => { setSize(s); setSizeError(false); }}
                    className={`w-10 h-10 rounded-full font-sans text-[11px] border transition-all duration-200 ${
                      size === s ? "bg-white text-zinc-900 border-white" : "border-white/15 text-zinc-500 hover:border-white/40"
                    }`}>{s}</button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light">Qty</p>
                <div className="flex items-center rounded-full overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white text-lg font-light">−</button>
                  <span className="w-7 text-center font-sans text-sm text-zinc-300">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))} className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white text-lg font-light">+</button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* ── Sticky bottom action bar (mobile) ───────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4"
        style={{ background: "linear-gradient(to top, rgba(3,3,3,0.98), transparent)" }}>
        <div className="flex gap-3">
          <div className="flex flex-col justify-center px-4 py-2 rounded-2xl min-w-[90px]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-zinc-600">Total</p>
            <p className="font-serif text-white text-xl font-light">{pricesLoaded ? `GH₵${price * quantity}` : "—"}</p>
          </div>
          <button onClick={handleAddToCart} disabled={!pricesLoaded}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.15em] uppercase rounded-2xl h-14 hover:bg-zinc-100 transition-colors disabled:opacity-40">
            {addedToCart ? <><Check size={14} /> Added!</> : <><ShoppingBag size={14} /> Add to Cart</>}
          </button>
          <button onClick={() => { if (!isSignedIn) { setAuthToast(true); setTimeout(() => setAuthToast(false), 3000); return; } setWishlisted(w => !w); }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <Heart size={16} className={wishlisted ? "fill-white text-white" : "text-zinc-500"} />
          </button>
        </div>
      </div>

      {/* ── Navigation arrows ────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-10 items-center gap-3">
        <button onClick={() => setRotateY(r => r - 90)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <ChevronLeft size={15} />
        </button>
        <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-zinc-700">rotate</span>
        <button onClick={() => setRotateY(r => r + 90)}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
          style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Auth toast */}
      <AnimatePresence>
        {authToast && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 lg:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full px-5 py-3 shadow-xl whitespace-nowrap"
            style={{ background: "rgba(24,24,27,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span className="font-sans text-sm text-zinc-300 font-light">Sign in to save to wishlist</span>
            <Link href="/sign-in" className="font-sans text-[10px] tracking-[0.15em] uppercase bg-white text-zinc-900 px-4 py-1.5 rounded-full font-medium hover:bg-zinc-100 transition-colors">
              Sign In
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
