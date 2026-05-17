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
  { name: "White",        hex: "#FAFAF8", light: true  },
  { name: "Black",        hex: "#111111", light: false },
  { name: "Dark Grey",    hex: "#2E2E2E", light: false },
  { name: "Cream",        hex: "#EDE8D8", light: true  },
  { name: "Coffee Brown", hex: "#5C3317", light: false },
  { name: "Pink",         hex: "#F5B8C8", light: true  },
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const DESIGN_TYPES = [
  { id: "none",    label: "Plain"   },
  { id: "text",    label: "Text"    },
  { id: "graphic", label: "Graphic" },
];

// ─── Canvas shirt — real photo with per-pixel recolouring ─────────────────────
// The source image (public/shirt-base.png) is a black shirt on white.
// For every pixel that isn't near-white background we map its luminance to the
// target colour: dark shadows stay dark, light highlights stay light.

function ShirtCanvas({
  color,
  children,
}: {
  color:    ShirtColor;
  children?: React.ReactNode;
}) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const baseRef    = useRef<HTMLImageElement | null>(null);
  const colorRef   = useRef(color);
  colorRef.current = color;
  const [ready,    setReady]    = useState(false);
  const [fallback, setFallback] = useState(false);

  // ── pixel recolour ───────────────────────────────────────────────────────────
  const applyColor = useCallback((img: HTMLImageElement, c: ShirtColor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // Draw at native resolution then let CSS scale to fit
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data      = imageData.data;

    // Parse hex target
    const tr = parseInt(c.hex.slice(1, 3), 16);
    const tg = parseInt(c.hex.slice(3, 5), 16);
    const tb = parseInt(c.hex.slice(5, 7), 16);

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Perceptual luminance
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Skip near-white background
      if (lum > 0.90) continue;

      // The source shirt (black) ranges lum ≈ 0 (deep shadow) → ≈ 0.45 (highlight)
      // Normalise to [0,1] then remap to target colour.
      // factor range: 0.15 (darkest shadow) → 1.0 (full colour at highlight)
      const t      = Math.min(lum / 0.45, 1.0);
      const factor = 0.15 + 0.85 * t;

      data[i]     = Math.min(255, Math.round(tr * factor));
      data[i + 1] = Math.min(255, Math.round(tg * factor));
      data[i + 2] = Math.min(255, Math.round(tb * factor));
    }

    ctx.putImageData(imageData, 0, 0);
    setReady(true);
  }, []);

  // Load once
  useEffect(() => {
    const img      = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload     = () => {
      baseRef.current = img;
      applyColor(img, colorRef.current);
    };
    img.onerror = () => setFallback(true);
    img.src     = "/shirt-base.png";
  }, [applyColor]);

  // Re-colour whenever selected colour changes
  useEffect(() => {
    if (baseRef.current) applyColor(baseRef.current, color);
  }, [color, applyColor]);

  // ── Fallback SVG while image loads / if file missing ────────────────────────
  if (fallback) {
    return <PlainShirtSVG color={color.hex} light={color.light}>{children}</PlainShirtSVG>;
  }

  return (
    <div className="relative w-full h-full">
      {/* Canvas fills container; CSS scaling preserves aspect ratio */}
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          objectFit: "contain",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.25s ease",
          filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.55)) drop-shadow(0 2px 10px rgba(0,0,0,0.35))",
        }}
      />
      {/* Spinner while loading */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
        </div>
      )}
      {/* Design overlay */}
      {children}
    </div>
  );
}

// ─── Fallback / back-face SVG shirt ──────────────────────────────────────────
// Used as: (a) front fallback if photo missing, (b) back face of 3-D flip.

function PlainShirtSVG({
  color, light, children,
}: {
  color: string; light: boolean; children?: React.ReactNode;
}) {
  const shadowA = light ? "rgba(0,0,0,0.11)" : "rgba(0,0,0,0.28)";
  const shadowB = light ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.20)";
  const hiA     = light ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)";
  const seam    = light ? "rgba(0,0,0,0.07)"  : "rgba(0,0,0,0.18)";
  const hemClr  = light ? "rgba(0,0,0,0.09)"  : "rgba(0,0,0,0.22)";
  const labelBg = light ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.90)";

  const BODY = `
    M 172,64 C 142,70 86,85 74,97
    L 4,183 C 18,204 43,218 63,221
    C 83,215 110,204 117,196
    L 117,493 Q 117,509 134,511
    L 426,511 Q 443,509 443,493
    L 443,196 C 450,204 477,215 497,221
    C 517,218 542,204 556,183
    L 486,97 C 474,85 418,70 388,64
    C 366,96 336,118 280,118
    C 224,118 194,96 172,64 Z
  `;

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 6px 28px rgba(0,0,0,0.50)) drop-shadow(0 2px 8px rgba(0,0,0,0.30))" }}>
        <defs>
          <radialGradient id="svg-edge" cx="280" cy="290" r="260" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
            <stop offset="62%"  stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor={shadowA} />
          </radialGradient>
          <linearGradient id="svg-light" x1="280" y1="64" x2="280" y2="511" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={hiA} />
            <stop offset="30%"  stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor={shadowB} />
          </linearGradient>
          <radialGradient id="svg-chest" cx="280" cy="310" r="140" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={hiA} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>

        <path d={BODY} fill={color} />
        <path d={BODY} fill="url(#svg-edge)" />
        <path d={BODY} fill="url(#svg-light)" />
        <path d={BODY} fill="url(#svg-chest)" />

        {/* Collar */}
        <path d="M 177,68 C 197,98 228,116 280,118 C 332,116 363,98 383,68"
          stroke={shadowA} strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M 181,72 C 200,100 230,116 280,117 C 330,116 360,100 379,72"
          stroke={shadowB} strokeWidth="4"  strokeLinecap="round" fill="none" />
        <path d="M 185,75 C 204,102 232,115 280,116 C 328,115 356,102 375,75"
          stroke={hiA}    strokeWidth="2"  strokeLinecap="round" fill="none" />

        {/* Brand label */}
        <g transform="translate(251,100)">
          <rect width="58" height="20" rx="2" fill={labelBg} />
          <rect width="58" height="20" rx="2" stroke="rgba(0,0,0,0.10)" strokeWidth="0.5" fill="none" />
          <text x="29" y="8"    textAnchor="middle" fill="rgba(0,0,0,0.55)" fontSize="4.2" fontFamily="sans-serif" letterSpacing="0.9" fontWeight="600">VINTAGE</text>
          <text x="29" y="15.5" textAnchor="middle" fill="rgba(0,0,0,0.55)" fontSize="4.2" fontFamily="sans-serif" letterSpacing="0.9" fontWeight="600">GALLERY</text>
        </g>

        {/* Seams / hems */}
        <path d="M 175,67 C 150,73 102,86 76,97"  stroke={seam} strokeWidth="1" fill="none" />
        <path d="M 385,67 C 410,73 458,86 484,97"  stroke={seam} strokeWidth="1" fill="none" />
        <path d="M 6,185 C 20,206 44,220 65,223"   stroke={hemClr} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M 554,185 C 540,206 516,220 495,223" stroke={hemClr} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M 117,202 L 117,493" stroke={seam} strokeWidth="1" fill="none" />
        <path d="M 443,202 L 443,493" stroke={seam} strokeWidth="1" fill="none" />
        <path d="M 117,493 Q 117,509 134,511 L 426,511 Q 443,509 443,493"
          stroke={hemClr} strokeWidth="5.5" strokeLinecap="round" fill="none" />
        <path d="M 127,504 L 433,504" stroke={seam} strokeWidth="0.5" fill="none" />
      </svg>
      {children}
    </div>
  );
}

// ─── Back of shirt (SVG) ──────────────────────────────────────────────────────

function PlainShirtBack({ color, light }: { color: string; light: boolean }) {
  const shadowA = light ? "rgba(0,0,0,0.11)" : "rgba(0,0,0,0.28)";
  const shadowB = light ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.20)";
  const hiA     = light ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)";
  const seam    = light ? "rgba(0,0,0,0.07)"  : "rgba(0,0,0,0.18)";
  const hemClr  = light ? "rgba(0,0,0,0.09)"  : "rgba(0,0,0,0.22)";
  const labelBg = light ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.90)";

  const BODY = `
    M 172,64 C 142,70 86,85 74,97
    L 4,183 C 18,204 43,218 63,221
    C 83,215 110,204 117,196
    L 117,493 Q 117,509 134,511
    L 426,511 Q 443,509 443,493
    L 443,196 C 450,204 477,215 497,221
    C 517,218 542,204 556,183
    L 486,97 C 474,85 418,70 388,64
    C 366,74 330,82 280,82
    C 230,82 194,74 172,64 Z
  `;

  return (
    <svg viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full"
      style={{ filter: "drop-shadow(0 6px 28px rgba(0,0,0,0.50)) drop-shadow(0 2px 8px rgba(0,0,0,0.30))" }}>
      <defs>
        <radialGradient id="sb-edge" cx="280" cy="290" r="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="rgba(255,255,255,0)" />
          <stop offset="62%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor={shadowA} />
        </radialGradient>
        <linearGradient id="sb-light" x1="280" y1="64" x2="280" y2="511" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor={hiA} />
          <stop offset="30%"  stopColor="rgba(255,255,255,0)" />
          <stop offset="100%" stopColor={shadowB} />
        </linearGradient>
      </defs>

      <path d={BODY} fill={color} />
      <path d={BODY} fill="url(#sb-edge)" />
      <path d={BODY} fill="url(#sb-light)" />

      {/* Back collar */}
      <path d="M 177,68 C 205,78 255,84 280,84 C 305,84 355,78 383,68"
        stroke={shadowA} strokeWidth="9" strokeLinecap="round" fill="none" />
      <path d="M 181,71 C 208,80 257,85 280,85 C 303,85 352,80 379,71"
        stroke={hiA} strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Back neck label */}
      <g transform="translate(251,68)">
        <rect width="58" height="20" rx="2" fill={labelBg} />
        <rect width="58" height="20" rx="2" stroke="rgba(0,0,0,0.10)" strokeWidth="0.5" fill="none" />
        <text x="29" y="8"    textAnchor="middle" fill="rgba(0,0,0,0.55)" fontSize="4.2" fontFamily="sans-serif" letterSpacing="0.9" fontWeight="600">VINTAGE</text>
        <text x="29" y="15.5" textAnchor="middle" fill="rgba(0,0,0,0.55)" fontSize="4.2" fontFamily="sans-serif" letterSpacing="0.9" fontWeight="600">GALLERY</text>
      </g>

      {/* Seams / hems */}
      <path d="M 175,67 C 150,73 102,86 76,97"  stroke={seam} strokeWidth="1" fill="none" />
      <path d="M 385,67 C 410,73 458,86 484,97"  stroke={seam} strokeWidth="1" fill="none" />
      <path d="M 6,185 C 20,206 44,220 65,223"   stroke={hemClr} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M 554,185 C 540,206 516,220 495,223" stroke={hemClr} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M 117,202 L 117,493" stroke={seam} strokeWidth="1" fill="none" />
      <path d="M 443,202 L 443,493" stroke={seam} strokeWidth="1" fill="none" />
      <path d="M 117,493 Q 117,509 134,511 L 426,511 Q 443,509 443,493"
        stroke={hemClr} strokeWidth="5.5" strokeLinecap="round" fill="none" />
      <path d="M 127,504 L 433,504" stroke={seam} strokeWidth="0.5" fill="none" />
    </svg>
  );
}

// ─── Print zone ───────────────────────────────────────────────────────────────
// Positioned over the chest area of the real photo.
// The shirt in the photo: chest spans ~22%–78% horizontally, ~33%–65% vertically.

function PrintZone({
  light, designType, customText, selectedDesign,
}: {
  light: boolean; designType: string; customText: string; selectedDesign: StudioDesign | null;
}) {
  if (designType === "none") return null;
  const textCol   = light ? "rgba(0,0,0,0.80)"  : "rgba(255,255,255,0.92)";
  const borderCol = light ? "rgba(0,0,0,0.16)"  : "rgba(255,255,255,0.20)";

  return (
    <div className="absolute pointer-events-none flex items-center justify-center"
      style={{ left: "24%", right: "24%", top: "34%", height: "28%" }}>

      {designType === "text" && customText && (
        <motion.span key={customText}
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="font-serif text-center leading-tight break-words w-full"
          style={{
            fontSize: "clamp(0.8rem,3vw,1.3rem)", fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase", color: textCol,
            textShadow: light ? "0 1px 4px rgba(255,255,255,0.5)" : "0 1px 4px rgba(0,0,0,0.6)",
          }}>
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
        <motion.div key={selectedDesign.id}
          initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }} className="relative w-full h-full">
          <Image src={selectedDesign.imageUrl} alt={selectedDesign.name} fill
            className="object-contain"
            style={{ mixBlendMode: light ? "multiply" : "screen" }} unoptimized />
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
      <div className="absolute top-[8%] left-[18%] w-[64%] h-[58%] rounded-full blur-[90px] transition-all duration-700"
        style={{ background: hex, opacity: hex === "#FAFAF8" ? 0.15 : 0.22 }} />
      <div className="absolute bottom-0 left-[28%] w-[44%] h-[28%] rounded-full blur-[70px] transition-all duration-700"
        style={{ background: hex, opacity: 0.10 }} />
    </div>
  );
}

// ─── Perspective grid floor ───────────────────────────────────────────────────

function GridFloor() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[38%] overflow-hidden pointer-events-none">
      <div className="w-full h-full" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)`,
        backgroundSize: "60px 60px",
        transform: "perspective(350px) rotateX(52deg)",
        transformOrigin: "center top",
        maskImage: "linear-gradient(to bottom,transparent,rgba(0,0,0,0.5) 30%,rgba(0,0,0,0.5))",
        WebkitMaskImage: "linear-gradient(to bottom,transparent,rgba(0,0,0,0.5) 30%,rgba(0,0,0,0.5))",
      }} />
    </div>
  );
}

// ─── Glass panel ─────────────────────────────────────────────────────────────

function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border ${className}`} style={{
      background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)",
      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    }}>
      {children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ProductCustomizer() {
  const { isSignedIn } = useAuth();
  const addItem        = useCartStore((s) => s.addItem);

  const [color,          setColor]          = useState<ShirtColor>(SHIRT_COLORS[1]); // default Black (matches photo)
  const [size,           setSize]           = useState("M");
  const [designType,     setDesignType]     = useState("none");
  const [customText,     setCustomText]     = useState("");
  const [quantity,       setQuantity]       = useState(1);
  const [selectedDesign, setSelectedDesign] = useState<StudioDesign | null>(null);

  // 3D rotation
  const [rotateY,    setRotateY]    = useState(-15);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startRotY: 0 });

  // Remote data
  const [designs,        setDesigns]        = useState<StudioDesign[]>([]);
  const [designsLoaded,  setDesignsLoaded]  = useState(false);
  const [basePriceGHS,   setBasePriceGHS]   = useState(150);
  const [designAddonGHS, setDesignAddonGHS] = useState(30);
  const [pricesLoaded,   setPricesLoaded]   = useState(false);

  // UI
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

  // ── 3D drag ──────────────────────────────────────────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragRef.current = { startX: e.clientX, startRotY: rotateY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, [rotateY]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    setRotateY(dragRef.current.startRotY + (e.clientX - dragRef.current.startX) * 0.45);
  }, [isDragging]);

  const onPointerUp = useCallback(() => {
    setIsDragging(false);
    setRotateY(prev => {
      const mod = ((prev % 360) + 360) % 360;
      return (mod <= 90 || mod >= 270)
        ? Math.round(prev / 360) * 360
        : Math.round((prev - 180) / 360) * 360 + 180;
    });
  }, []);

  // ── Cart ─────────────────────────────────────────────────────────────────────

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
    setColor(SHIRT_COLORS[1]);
    setSize("M");
    setDesignType("none");
    setCustomText("");
    setSelectedDesign(null);
    setQuantity(1);
    setRotateY(-15);
  };

  // ── Colour panel ─────────────────────────────────────────────────────────────

  const ColorControls = () => (
    <div className="p-5 space-y-5">
      <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-light">
        Shirt Colour
      </p>
      <div className="grid grid-cols-3 gap-3">
        {SHIRT_COLORS.map(c => (
          <button key={c.hex} onClick={() => setColor(c)}
            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
              color.hex === c.hex ? "ring-2 ring-white ring-offset-2 ring-offset-black" : "hover:bg-white/5"
            }`}>
            <div className="w-10 h-10 rounded-full transition-transform duration-200 hover:scale-110"
              style={{
                backgroundColor: c.hex,
                boxShadow: c.hex === "#FAFAF8"
                  ? "inset 0 0 0 1px rgba(255,255,255,0.3), 0 2px 8px rgba(0,0,0,0.4)"
                  : `0 2px 12px ${c.hex}60`,
              }} />
            <span className="font-sans text-[8.5px] tracking-[0.1em] text-center leading-tight"
              style={{ color: color.hex === c.hex ? "#fff" : "rgba(255,255,255,0.35)" }}>
              {c.name}
            </span>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2.5 pt-1">
        <div className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color.hex, boxShadow: `0 0 8px ${color.hex}80` }} />
        <span className="font-sans text-[10px] text-white/50 font-light">{color.name} selected</span>
      </div>
    </div>
  );

  // ── Design panel ─────────────────────────────────────────────────────────────

  const DesignControls = () => (
    <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
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

      <AnimatePresence>
        {designType === "text" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-500 font-light">
              Your Text · max 20 chars
            </p>
            <input type="text" value={customText}
              onChange={e => setCustomText(e.target.value.slice(0, 20).toUpperCase())}
              placeholder="E.G. ACCRA"
              className="w-full rounded-xl px-4 py-3 font-serif text-white text-center tracking-[0.3em] uppercase placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <p className="font-sans text-[9px] text-zinc-600 font-light">Screen-printed on chest · updates live</p>
          </motion.div>
        )}

        {designType === "graphic" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-500 font-light">
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
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {designs.map(d => {
                  const active = selectedDesign?.id === d.id;
                  return (
                    <button key={d.id} onClick={() => setSelectedDesign(active ? null : d)} title={d.name}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        active ? "border-white" : "border-transparent hover:border-white/30"
                      }`} style={{ background: "rgba(255,255,255,0.05)" }}>
                      <Image src={d.imageUrl} alt={d.name} fill className="object-contain p-1.5" unoptimized />
                    </button>
                  );
                })}
              </div>
            )}
            {selectedDesign && (
              <p className="font-sans text-[10px] text-zinc-400">
                {selectedDesign.name}
                <button onClick={() => setSelectedDesign(null)}
                  className="ml-2 text-zinc-600 hover:text-zinc-300 underline underline-offset-2">Clear</button>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ─── Shirt scene — shared between desktop + mobile ────────────────────────────

  function ShirtScene({ width, height }: { width: number; height: number }) {
    return (
      <div style={{ perspective: "900px" }}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove}
        onPointerUp={onPointerUp} onPointerLeave={onPointerUp}
        className={isDragging ? "cursor-grabbing" : "cursor-grab"}>
        <motion.div
          animate={isDragging ? {} : { y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
          <div style={{
            width: `${width}px`, height: `${height}px`,
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotateY}deg)`,
            transition: isDragging ? "none" : "transform 0.7s cubic-bezier(0.34,1.4,0.64,1)",
          }}>
            {/* Front — real photo via canvas */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
              <ShirtCanvas color={color}>
                <PrintZone light={color.light} designType={designType}
                  customText={customText} selectedDesign={selectedDesign} />
              </ShirtCanvas>
            </div>
            {/* Back — SVG illustration */}
            <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <PlainShirtBack color={color.hex} light={color.light} />
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <section className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg,#0a0a0f 0%,#030303 60%,#050508 100%)" }}>

      <AmbientGlow hex={color.hex} />
      <GridFloor />

      {/* Top vignette */}
      <div className="absolute top-0 left-0 right-0 h-[35%] pointer-events-none"
        style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.5),transparent)" }} />

      {/* Header */}
      <div className="relative z-10 pt-[72px] pb-6 px-6 flex items-end justify-between">
        <div>
          <p className="font-sans text-[8px] tracking-[0.5em] uppercase text-zinc-600 font-light mb-1">Vintage Gallery</p>
          <h1 className="font-serif text-white leading-none"
            style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 300 }}>
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

      {/* ── DESKTOP ────────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex relative z-10 items-start justify-center gap-6 px-8 pb-8"
        style={{ minHeight: "calc(100vh - 170px)" }}>

        {/* Left — colours */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }} className="w-[230px] shrink-0 mt-6 sticky top-6">
          <GlassPanel><ColorControls /></GlassPanel>
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-700 font-light text-center mt-4">
            ← drag to rotate →
          </p>
        </motion.div>

        {/* Center — 3D shirt */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.8 }}
          className="flex-1 flex flex-col items-center justify-center py-6 max-w-[440px]">

          <ShirtScene width={310} height={380} />

          {/* Front / back dots */}
          <div className="flex gap-2 mt-5">
            {[0, 180].map(angle => {
              const mod    = ((rotateY % 360) + 360) % 360;
              const active = angle === 0 ? (mod <= 90 || mod >= 270) : !(mod <= 90 || mod >= 270);
              return <button key={angle} onClick={() => setRotateY(angle)}
                className={`h-1.5 rounded-full transition-all duration-300 ${active ? "w-6 bg-white" : "w-1.5 bg-white/20"}`} />;
            })}
          </div>

          {/* Size */}
          <div className="mt-8 w-full">
            <div className="flex items-center justify-between mb-3">
              <p className={`font-sans text-[9px] tracking-[0.3em] uppercase font-light ${sizeError ? "text-red-400" : "text-zinc-500"}`}>
                {sizeError ? "Please select a size" : "Size"}
              </p>
              <Link href="/sizing-guide"
                className="font-sans text-[9px] uppercase tracking-[0.15em] text-zinc-700 hover:text-zinc-400 underline underline-offset-2 transition-colors">
                Size Guide
              </Link>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {SIZES.map(s => (
                <button key={s} onClick={() => { setSize(s); setSizeError(false); }}
                  className={`w-11 h-11 rounded-full font-sans text-[11px] border transition-all duration-200 ${
                    size === s
                      ? "bg-white text-zinc-900 border-white"
                      : "border-white/15 text-zinc-500 hover:border-white/40 hover:text-zinc-200"
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-6 flex items-center gap-4">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">Qty</p>
            <div className="flex items-center rounded-full overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">−</button>
              <span className="w-8 text-center font-sans text-sm text-zinc-300">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">+</button>
            </div>
            <span className="font-sans text-[9px] text-zinc-700 font-light">max 10</span>
          </div>
        </motion.div>

        {/* Right — design + actions */}
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="w-[240px] shrink-0 mt-6 space-y-4 sticky top-6">

          <GlassPanel><DesignControls /></GlassPanel>

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

          <div className="space-y-2">
            <button onClick={handleAddToCart} disabled={!pricesLoaded}
              className="w-full flex items-center justify-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.15em] uppercase py-4 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-40">
              {addedToCart ? <><Check size={14} /> Added!</> : <><ShoppingBag size={14} /> Add to Cart</>}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (!isSignedIn) { setAuthToast(true); setTimeout(() => setAuthToast(false), 3000); return; }
                  setWishlisted(w => !w);
                }}
                className="flex-1 flex items-center justify-center gap-2 font-sans text-[10px] tracking-[0.12em] uppercase py-3 rounded-full transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.10)", color: wishlisted ? "#fff" : "rgba(255,255,255,0.4)" }}>
                <Heart size={12} className={wishlisted ? "fill-white" : ""} />
                {wishlisted ? "Saved" : "Wishlist"}
              </button>
              {addedToCart && (
                <Link href="/cart"
                  className="flex items-center justify-center gap-1.5 font-sans text-[10px] tracking-[0.12em] uppercase py-3 px-4 rounded-full transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.4)" }}>
                  Cart <ArrowRight size={10} />
                </Link>
              )}
            </div>
          </div>

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

      {/* ── MOBILE ─────────────────────────────────────────────────────────────── */}
      <div className="lg:hidden relative z-10 pb-36">

        <div className="flex flex-col items-center pt-2 pb-4">
          <ShirtScene width={250} height={300} />
          <div className="flex gap-2 mt-3">
            {[0, 180].map(angle => {
              const mod    = ((rotateY % 360) + 360) % 360;
              const active = angle === 0 ? (mod <= 90 || mod >= 270) : !(mod <= 90 || mod >= 270);
              return <button key={angle} onClick={() => setRotateY(angle)}
                className={`h-1 rounded-full transition-all duration-300 ${active ? "w-5 bg-white" : "w-1 bg-white/20"}`} />;
            })}
          </div>
          <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-zinc-700 font-light mt-2">drag to rotate</p>
        </div>

        {/* Tabs */}
        <div className="px-4 mb-3">
          <div className="flex rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
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

        {/* Size + qty */}
        <div className="px-4 mt-4">
          <GlassPanel>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className={`font-sans text-[9px] tracking-[0.3em] uppercase font-light ${sizeError ? "text-red-400" : "text-zinc-500"}`}>
                  {sizeError ? "Select a size" : "Size"}
                </p>
                <Link href="/sizing-guide"
                  className="font-sans text-[9px] uppercase tracking-[0.1em] text-zinc-700 underline underline-offset-2">
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
                <div className="flex items-center rounded-full overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white text-lg font-light">−</button>
                  <span className="w-7 text-center font-sans text-sm text-zinc-300">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white text-lg font-light">+</button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Mobile sticky bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4"
        style={{ background: "linear-gradient(to top,rgba(3,3,3,0.98),transparent)" }}>
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
          <button
            onClick={() => {
              if (!isSignedIn) { setAuthToast(true); setTimeout(() => setAuthToast(false), 3000); return; }
              setWishlisted(w => !w);
            }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            <Heart size={16} className={wishlisted ? "fill-white text-white" : "text-zinc-500"} />
          </button>
        </div>
      </div>

      {/* Desktop rotate buttons */}
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
