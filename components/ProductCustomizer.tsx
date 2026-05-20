"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ShoppingBag, Heart, RotateCcw, ArrowRight } from "lucide-react";
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

interface SideDesign {
  type:    string;           // "none" | "text" | "graphic"
  text:    string;
  graphic: StudioDesign | null;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const SHIRT_COLORS: ShirtColor[] = [
  { name: "White",        hex: "#F5F5F0", light: true  }, // warm off-white — shadow reads as light grey
  { name: "Black",        hex: "#111111", light: false },
  { name: "Dark Grey",    hex: "#4A4A4A", light: false }, // raised from #2E2E2E so it reads clearly as grey, not black
  { name: "Cream",        hex: "#E8D5A0", light: true  }, // golden cream — visually distinct from white
  { name: "Coffee Brown", hex: "#5C3317", light: false },
  { name: "Pink",         hex: "#F0A0BA", light: true  }, // slightly richer pink — shadow reads as deep rose
];

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const DESIGN_TYPES = [
  { id: "none",    label: "Plain"   },
  { id: "text",    label: "Text"    },
  { id: "graphic", label: "Graphic" },
];

const BLANK_DESIGN: SideDesign = { type: "none", text: "", graphic: null };

// ─── Shared image cache ───────────────────────────────────────────────────────

const _cache: Record<string, HTMLImageElement> = {};

function loadImg(src: string): Promise<HTMLImageElement> {
  if (_cache[src]) return Promise.resolve(_cache[src]);
  return new Promise((resolve, reject) => {
    const img       = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload      = () => { _cache[src] = img; resolve(img); };
    img.onerror     = reject;
    img.src         = src;
  });
}

// ─── Canvas shirt ─────────────────────────────────────────────────────────────

function ShirtCanvas({
  color, side = "front", children,
}: {
  color:     ShirtColor;
  side?:     "front" | "back";
  children?: React.ReactNode;
}) {
  const src        = side === "back" ? "/back-new.jpeg" : "/front-new.png";
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const colorRef   = useRef(color);
  colorRef.current = color;

  const [ready,    setReady]    = useState(false);
  const [fallback, setFallback] = useState(false);

  // ── Recolour: background → transparent, shirt pixels → target colour ────────
  const paint = useCallback((img: HTMLImageElement, c: ShirtColor) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data      = imageData.data;

    const tr = parseInt(c.hex.slice(1, 3), 16);
    const tg = parseInt(c.hex.slice(3, 5), 16);
    const tb = parseInt(c.hex.slice(5, 7), 16);

    // Shadow floor scales with the target colour's own brightness.
    // Light colours (white, cream, pink) stay visibly coloured even in deep shadow.
    // Dark colours (black, grey) can get very close to black in shadow.
    const targetLum  = (0.299 * tr + 0.587 * tg + 0.114 * tb) / 255;
    const shadowBase = 0.14 + targetLum * 0.42; // white≈0.55, pink≈0.43, dark-grey≈0.22, black≈0.15

    for (let i = 0; i < data.length; i += 4) {
      // Skip already-transparent pixels (back PNG has pre-baked alpha)
      if (data[i + 3] < 10) continue;

      const r   = data[i], g = data[i + 1], b = data[i + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Near-white → transparent background
      if (lum > 0.88) { data[i + 3] = 0; continue; }

      // Map source luminance (black shirt, 0–0.45 range) to 0–1, then blend
      // from shadowBase up to 1.0 so highlights show the full target colour.
      const t      = Math.min(lum / 0.45, 1.0);
      const factor = shadowBase + (1.0 - shadowBase) * t;
      data[i]     = Math.min(255, Math.round(tr * factor));
      data[i + 1] = Math.min(255, Math.round(tg * factor));
      data[i + 2] = Math.min(255, Math.round(tb * factor));
    }

    ctx.putImageData(imageData, 0, 0);
    setReady(true);
  }, []);

  useEffect(() => {
    loadImg(src)
      .then(img => paint(img, colorRef.current))
      .catch(() => setFallback(true));
  }, [src, paint]);

  useEffect(() => {
    const img = _cache[src];
    if (!img) return;
    paint(img, color);
  }, [color, src, paint]);

  if (fallback) return <FallbackShirt color={color.hex} light={color.light} flip={side === "back"}>{children}</FallbackShirt>;

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        style={{
          width: "100%", height: "100%", objectFit: "contain",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Fallback SVG ─────────────────────────────────────────────────────────────

function FallbackShirt({ color, light, flip = false, children }: {
  color: string; light: boolean; flip?: boolean; children?: React.ReactNode;
}) {
  const sA  = light ? "rgba(0,0,0,0.11)" : "rgba(0,0,0,0.28)";
  const sB  = light ? "rgba(0,0,0,0.07)" : "rgba(0,0,0,0.20)";
  const hi  = light ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.06)";
  const sm  = light ? "rgba(0,0,0,0.07)"  : "rgba(0,0,0,0.18)";
  const hem = light ? "rgba(0,0,0,0.09)"  : "rgba(0,0,0,0.22)";
  const lb  = light ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.90)";
  const nk  = flip
    ? "C 366,74 330,82 280,82 C 230,82 194,74 172,64 Z"
    : "C 366,96 336,118 280,118 C 224,118 194,96 172,64 Z";
  const BODY = `M 172,64 C 142,70 86,85 74,97 L 4,183 C 18,204 43,218 63,221 C 83,215 110,204 117,196 L 117,493 Q 117,509 134,511 L 426,511 Q 443,509 443,493 L 443,196 C 450,204 477,215 497,221 C 517,218 542,204 556,183 L 486,97 C 474,85 418,70 388,64 ${nk}`;
  const uid = flip ? "b" : "f";
  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 560 560" fill="none" className="w-full h-full">
        <defs>
          <radialGradient id={`fe-${uid}`} cx="280" cy="290" r="260" gradientUnits="userSpaceOnUse">
            <stop offset="62%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor={sA} />
          </radialGradient>
          <linearGradient id={`fl-${uid}`} x1="280" y1="64" x2="280" y2="511" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={hi} /><stop offset="30%" stopColor="rgba(0,0,0,0)" /><stop offset="100%" stopColor={sB} />
          </linearGradient>
        </defs>
        <path d={BODY} fill={color} />
        <path d={BODY} fill={`url(#fe-${uid})`} />
        <path d={BODY} fill={`url(#fl-${uid})`} />
        <g transform="translate(251,100)">
          <rect width="58" height="20" rx="2" fill={lb} />
          <text x="29" y="8" textAnchor="middle" fill="rgba(0,0,0,0.55)" fontSize="4.2" fontFamily="sans-serif" letterSpacing="0.9" fontWeight="600">VINTAGE</text>
          <text x="29" y="15.5" textAnchor="middle" fill="rgba(0,0,0,0.55)" fontSize="4.2" fontFamily="sans-serif" letterSpacing="0.9" fontWeight="600">GALLERY</text>
        </g>
        <path d="M 117,202 L 117,493" stroke={sm} strokeWidth="1" fill="none" />
        <path d="M 443,202 L 443,493" stroke={sm} strokeWidth="1" fill="none" />
        <path d="M 117,493 Q 117,509 134,511 L 426,511 Q 443,509 443,493" stroke={hem} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
      {children}
    </div>
  );
}

// ─── Print zone ───────────────────────────────────────────────────────────────

function PrintZone({ light, design }: { light: boolean; design: SideDesign }) {
  if (design.type === "none") return null;
  const textCol   = light ? "rgba(0,0,0,0.80)"  : "rgba(255,255,255,0.92)";
  const borderCol = light ? "rgba(0,0,0,0.16)"  : "rgba(255,255,255,0.20)";
  return (
    <div className="absolute pointer-events-none flex items-center justify-center"
      style={{ left: "26%", right: "26%", top: "36%", height: "26%" }}>
      {design.type === "text" && design.text && (
        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }} className="font-serif text-center leading-tight break-words w-full"
          style={{ fontSize: "clamp(0.8rem,3vw,1.3rem)", fontWeight: 600,
            letterSpacing: "0.12em", textTransform: "uppercase", color: textCol,
            textShadow: light ? "0 1px 4px rgba(255,255,255,0.5)" : "0 1px 4px rgba(0,0,0,0.6)" }}>
          {design.text}
        </motion.span>
      )}
      {design.type === "text" && !design.text && (
        <span className="font-sans text-center"
          style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: borderCol }}>
          Your text here
        </span>
      )}
      {design.type === "graphic" && design.graphic && (
        <motion.div key={design.graphic.id} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }} className="relative w-full h-full">
          <Image src={design.graphic.imageUrl} alt={design.graphic.name} fill
            className="object-contain" style={{ mixBlendMode: light ? "multiply" : "screen" }} unoptimized />
        </motion.div>
      )}
      {design.type === "graphic" && !design.graphic && (
        <div className="w-full h-full rounded-xl border-2 border-dashed flex items-center justify-center"
          style={{ borderColor: borderCol }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: borderCol, fontFamily: "sans-serif" }}>
            Pick a graphic
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Stage spotlight (helps dark shirts stand out) ────────────────────────────

function StageLight({ light }: { light: boolean }) {
  // Soft overhead spotlight always visible; stronger for dark shirts
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div className="absolute left-1/2 top-[25%] -translate-x-1/2 -translate-y-1/2 w-[75%] h-[60%] rounded-full transition-all duration-700"
        style={{ background: `radial-gradient(ellipse at center, rgba(255,255,255,${light ? "0.035" : "0.07"}) 0%, transparent 68%)` }} />
    </div>
  );
}

// ─── Ambient glow ─────────────────────────────────────────────────────────────

function AmbientGlow({ hex, light }: { hex: string; light: boolean }) {
  // For dark colours, use a muted grey hint so we don't darken the already-dark bg
  const glowHex = light ? hex : "#3a3a3a";
  const opacity = light ? (hex === "#FAFAF8" ? 0.13 : 0.18) : 0.10;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[8%] left-[18%] w-[64%] h-[58%] rounded-full blur-[90px] transition-all duration-700"
        style={{ background: glowHex, opacity }} />
      <div className="absolute bottom-0 left-[28%] w-[44%] h-[28%] rounded-full blur-[70px] transition-all duration-700"
        style={{ background: glowHex, opacity: opacity * 0.6 }} />
    </div>
  );
}

// ─── Grid floor ───────────────────────────────────────────────────────────────

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

// ─── Glass panel ──────────────────────────────────────────────────────────────

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

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProductCustomizer() {
  const { isSignedIn } = useAuth();
  const addItem        = useCartStore((s) => s.addItem);

  const [color,      setColor]      = useState<ShirtColor>(SHIRT_COLORS[1]);
  const [size,       setSize]       = useState("M");
  const [quantity,   setQuantity]   = useState(1);

  // Per-side design state
  const [frontDesign, setFrontDesign] = useState<SideDesign>({ ...BLANK_DESIGN });
  const [backDesign,  setBackDesign]  = useState<SideDesign>({ ...BLANK_DESIGN });
  const [activeSide,  setActiveSide]  = useState<"front" | "back">("front");

  // Which side is facing us — derived from rotateY
  const [rotateY, setRotateY] = useState(0);
  const showingFront = (() => { const m = ((rotateY % 360) + 360) % 360; return m < 90 || m >= 270; })();

  // Rotation drag — use refs to avoid stale-closure bugs + DOM-direct writes for 60fps
  const isDraggingRef = useRef(false);
  const dragRef       = useRef({ startX: 0, startRotY: 0 });
  const rotateYRef    = useRef(0);                          // tracks live rotation without re-renders
  const [isDragging,  setIsDragging] = useState(false); // only for cursor style

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

  const hasAnyDesign = frontDesign.type !== "none" || backDesign.type !== "none";
  const price        = hasAnyDesign ? basePriceGHS + designAddonGHS : basePriceGHS;

  // Auto-switch active side when the user rotates to the back
  useEffect(() => {
    setActiveSide(showingFront ? "front" : "back");
  }, [showingFront]);

  // ── Drag handlers (ref-based — no stale closures) ────────────────────────────

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    // Use rotateYRef so this callback needs no deps and never goes stale
    dragRef.current = { startX: e.clientX, startRotY: rotateYRef.current };
    try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId); } catch {}
    setIsDragging(true);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const newY = dragRef.current.startRotY + (e.clientX - dragRef.current.startX) * 3.0;
    rotateYRef.current = newY;
    // Write directly to DOM — zero React re-render overhead, butter-smooth on mobile
    document.querySelectorAll<HTMLElement>("[data-shirt-rotate]").forEach(el => {
      el.style.transform = `rotateY(${newY}deg)`;
    });
  }, []);

  const onPointerUp = useCallback(() => {
    isDraggingRef.current = false;
    setIsDragging(false);
    // Sync React state now so showingFront indicator and side-auto-switch update
    setRotateY(rotateYRef.current);
  }, []);

  // ── Cart ─────────────────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (!size) { setSizeError(true); return; }
    setSizeError(false);
    const frontDesc = frontDesign.type !== "none" ? `Front: ${frontDesign.text || frontDesign.graphic?.name || ""}` : "";
    const backDesc  = backDesign.type  !== "none" ? `Back: ${backDesign.text  || backDesign.graphic?.name  || ""}` : "";
    const desc      = [frontDesc, backDesc].filter(Boolean).join(" · ");
    addItem({
      productId: `custom-${color.name}-${size}`,
      slug:       "custom-tee",
      name:       `Custom Tee — ${color.name}${desc ? ` · ${desc}` : ""}`,
      collection: "Custom Studio",
      price,
      image:      "/front-new.png",
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
    setFrontDesign({ ...BLANK_DESIGN });
    setBackDesign({ ...BLANK_DESIGN });
    setQuantity(1);
    rotateYRef.current = 0;
    setRotateY(0);
  };

  // ── Active side helpers ──────────────────────────────────────────────────────

  const activeDesign    = activeSide === "front" ? frontDesign    : backDesign;
  const setActiveDesign = activeSide === "front" ? setFrontDesign : setBackDesign;

  // ── Colour panel ─────────────────────────────────────────────────────────────

  const ColorControls = () => (
    <div className="p-5 space-y-5">
      <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-light">Shirt Colour</p>
      <div className="grid grid-cols-3 gap-3">
        {SHIRT_COLORS.map(c => (
          <button key={c.hex} onClick={() => setColor(c)} style={{ touchAction: "manipulation" }}
            className={`flex flex-col items-center gap-2 p-2 rounded-xl transition-all duration-200 ${
              color.hex === c.hex ? "ring-2 ring-white ring-offset-2 ring-offset-black" : "hover:bg-white/5"
            }`}>
            <div className="w-10 h-10 rounded-full"
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
    <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh]">

      {/* Front / Back toggle */}
      <div>
        <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 font-light mb-2">Customise</p>
        <div className="flex gap-1.5 mb-4">
          {(["front", "back"] as const).map(side => (
            <button key={side} onClick={() => setActiveSide(side)} style={{ touchAction: "manipulation" }}
              className={`flex-1 py-2.5 rounded-xl font-sans text-[10px] tracking-[0.12em] uppercase font-light border transition-all duration-200 ${
                activeSide === side
                  ? "bg-white/12 border-white/40 text-white"
                  : "border-white/08 text-zinc-600 hover:border-white/20 hover:text-zinc-400"
              }`}>
              {side}
              {/* dot if side has a design */}
              {((side === "front" && frontDesign.type !== "none") || (side === "back" && backDesign.type !== "none")) && (
                <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-white align-middle" />
              )}
            </button>
          ))}
        </div>

        {/* Design type */}
        <div className="flex gap-1.5">
          {DESIGN_TYPES.map(dt => (
            <button key={dt.id} style={{ touchAction: "manipulation" }}
              onClick={() => setActiveDesign(d => ({
                ...d, type: dt.id,
                text:    dt.id === "text"    ? d.text    : "",
                graphic: dt.id === "graphic" ? d.graphic : null,
              }))}
              className={`flex-1 py-2.5 rounded-xl font-sans text-[10px] tracking-[0.1em] uppercase font-light border transition-all duration-200 ${
                activeDesign.type === dt.id
                  ? "bg-white text-zinc-900 border-white"
                  : "border-white/10 text-zinc-500 hover:border-white/25 hover:text-zinc-200"
              }`}>
              {dt.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeDesign.type === "text" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-2">
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-500 font-light">
              {activeSide === "front" ? "Front" : "Back"} Text · max 20 chars
            </p>
            <input type="text" value={activeDesign.text}
              onChange={e => setActiveDesign(d => ({ ...d, text: e.target.value.slice(0, 20).toUpperCase() }))}
              placeholder="E.G. ACCRA"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              spellCheck={false}
              enterKeyHint="done"
              className="w-full rounded-xl px-4 py-3 font-serif text-white text-center tracking-[0.3em] uppercase placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-white/30 transition-all"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }} />
            <p className="font-sans text-[9px] text-zinc-600 font-light">Screen-printed · updates live</p>
          </motion.div>
        )}

        {activeDesign.type === "graphic" && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} className="overflow-hidden space-y-3">
            <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-zinc-500 font-light">
              {activeSide === "front" ? "Front" : "Back"} Graphic
            </p>
            {!designsLoaded ? (
              <div className="flex items-center gap-2 py-3">
                <div className="w-4 h-4 border-2 border-zinc-700 border-t-zinc-300 rounded-full animate-spin" />
                <span className="font-sans text-xs text-zinc-500">Loading…</span>
              </div>
            ) : designs.length === 0 ? (
              <div className="rounded-xl py-6 text-center" style={{ border: "1px dashed rgba(255,255,255,0.1)" }}>
                <p className="font-sans text-xs text-zinc-500 font-light">No graphics yet.</p>
                <p className="font-sans text-[10px] text-zinc-700 mt-1">DM us on Instagram.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {designs.map(d => {
                  const active = activeDesign.graphic?.id === d.id;
                  return (
                    <button key={d.id} onClick={() => setActiveDesign(sd => ({ ...sd, graphic: active ? null : d }))}
                      title={d.name}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        active ? "border-white" : "border-transparent hover:border-white/30"
                      }`} style={{ background: "rgba(255,255,255,0.05)", touchAction: "manipulation" }}>
                      <Image src={d.imageUrl} alt={d.name} fill className="object-contain p-1.5" unoptimized />
                    </button>
                  );
                })}
              </div>
            )}
            {activeDesign.graphic && (
              <p className="font-sans text-[10px] text-zinc-400">
                {activeDesign.graphic.name}
                <button onClick={() => setActiveDesign(d => ({ ...d, graphic: null }))}
                  style={{ touchAction: "manipulation" }}
                  className="ml-2 text-zinc-600 hover:text-zinc-300 underline underline-offset-2">Clear</button>
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ── 3-D shirt container ───────────────────────────────────────────────────────

  const shirtContainer = (w: number, h: number) => (
    <div
      style={{ perspective: "1000px", touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={isDragging ? "cursor-grabbing select-none" : "cursor-grab select-none"}
    >
      <div
        data-shirt-rotate
        style={{
          width: `${w}px`, height: `${h}px`,
          transformStyle: "preserve-3d",
          transform: `rotateY(${rotateY}deg)`,
          transition: isDragging ? "none" : "transform 0.05s linear",
        }}
      >
        {/* Front */}
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden" }}>
          <ShirtCanvas color={color} side="front">
            <PrintZone light={color.light} design={frontDesign} />
          </ShirtCanvas>
        </div>
        {/* Back */}
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          <ShirtCanvas color={color} side="back">
            <PrintZone light={color.light} design={backDesign} />
          </ShirtCanvas>
        </div>
      </div>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  // Background shifts to dark-slate for dark shirts so the eye can pick them out
  return (
    <section className="relative min-h-screen overflow-hidden"
      style={{
        background: color.light
          ? "linear-gradient(160deg,#0c0c14 0%,#050508 55%,#08080f 100%)"
          : "linear-gradient(160deg,#25253a 0%,#1a1a2b 50%,#1f1f30 100%)",
        transition: "background 0.6s ease",
        touchAction: "manipulation",
      }}>

      <AmbientGlow hex={color.hex} light={color.light} />
      <GridFloor />
      <StageLight light={color.light} />

      <div className="absolute top-0 left-0 right-0 h-[35%] pointer-events-none"
        style={{ background: "linear-gradient(to bottom,rgba(0,0,0,0.45),transparent)" }} />

      {/* Header */}
      <div className="relative z-10 pt-[72px] pb-6 px-6 flex items-end justify-between">
        <div>
          <p className="font-sans text-[8px] tracking-[0.5em] uppercase text-zinc-600 font-light mb-1">Vintage Gallery</p>
          <h1 className="font-serif text-white leading-none"
            style={{ fontSize: "clamp(1.6rem,4vw,2.8rem)", fontWeight: 300 }}>Custom Studio</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Viewing indicator */}
          <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-600 font-light">
            {showingFront ? "Front" : "Back"}
          </span>
          {pricesLoaded && (
            <motion.div key={price} initial={{ y: -4, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="font-sans text-sm text-white/60 font-light">GH₵ {price}</motion.div>
          )}
          <button onClick={handleReset} title="Reset"
            className="w-9 h-9 rounded-full flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
            style={{ border: "1px solid rgba(255,255,255,0.08)", touchAction: "manipulation" }}>
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ── DESKTOP ──────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex relative z-10 items-start justify-center gap-6 px-8 pb-8"
        style={{ minHeight: "calc(100vh - 170px)" }}>

        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }} className="w-[230px] shrink-0 mt-6 sticky top-6">
          <GlassPanel>{ColorControls()}</GlassPanel>
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-700 font-light text-center mt-4">
            drag shirt to rotate
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.8 }}
          className="flex-1 flex flex-col items-center justify-center py-6 max-w-[440px]">

          {shirtContainer(310, 390)}

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
                <button key={s} onClick={() => { setSize(s); setSizeError(false); }} style={{ touchAction: "manipulation" }}
                  className={`w-11 h-11 rounded-full font-sans text-[11px] border transition-all duration-200 ${
                    size === s ? "bg-white text-zinc-900 border-white" : "border-white/15 text-zinc-500 hover:border-white/40 hover:text-zinc-200"
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-6 flex items-center gap-4">
            <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">Qty</p>
            <div className="flex items-center rounded-full overflow-hidden"
              style={{ border: "1px solid rgba(255,255,255,0.10)" }}>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ touchAction: "manipulation" }}
                className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">−</button>
              <span className="w-8 text-center font-sans text-sm text-zinc-300">{quantity}</span>
              <button onClick={() => setQuantity(q => Math.min(10, q + 1))} style={{ touchAction: "manipulation" }}
                className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors text-lg font-light">+</button>
            </div>
            <span className="font-sans text-[9px] text-zinc-700 font-light">max 10</span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="w-[240px] shrink-0 mt-6 space-y-4 sticky top-6">

          <GlassPanel>{DesignControls()}</GlassPanel>

          <GlassPanel>
            <div className="p-5 space-y-1">
              <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-500 font-light">Total</p>
              <motion.p key={price} initial={{ y: -5, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="font-serif text-white text-3xl font-light">
                {pricesLoaded ? `GH₵ ${price * quantity}` : "—"}
              </motion.p>
              {hasAnyDesign && (
                <p className="font-sans text-[9px] text-zinc-600 font-light">
                  Base GH₵{basePriceGHS} + print GH₵{designAddonGHS}
                </p>
              )}
            </div>
          </GlassPanel>

          <div className="space-y-2">
            <button onClick={handleAddToCart} disabled={!pricesLoaded} style={{ touchAction: "manipulation" }}
              className="w-full flex items-center justify-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.15em] uppercase py-4 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-40">
              {addedToCart ? <><Check size={14} /> Added!</> : <><ShoppingBag size={14} /> Add to Cart</>}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => { if (!isSignedIn) { setAuthToast(true); setTimeout(() => setAuthToast(false), 3000); return; } setWishlisted(w => !w); }}
                className="flex-1 flex items-center justify-center gap-2 font-sans text-[10px] tracking-[0.12em] uppercase py-3 rounded-full transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.10)", color: wishlisted ? "#fff" : "rgba(255,255,255,0.4)", touchAction: "manipulation" }}>
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
              {[{ icon: "✦", text: "Made to Order" }, { icon: "🚚", text: "48h Accra Delivery" }, { icon: "💳", text: "MoMo · Card" }].map(t => (
                <div key={t.text} className="flex items-center gap-2.5">
                  <span className="text-sm">{t.icon}</span>
                  <span className="font-sans text-[10px] text-zinc-500 font-light">{t.text}</span>
                </div>
              ))}
            </div>
          </GlassPanel>
        </motion.div>
      </div>

      {/* ── MOBILE ───────────────────────────────────────────────────────────── */}
      <div className="lg:hidden relative z-10 pb-36">
        <div className="flex flex-col items-center pt-2 pb-4">
          {shirtContainer(250, 310)}
          <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-zinc-700 font-light mt-3">
            swipe to rotate · viewing {showingFront ? "front" : "back"}
          </p>
        </div>

        <div className="px-4 mb-3">
          <div className="flex rounded-xl overflow-hidden"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
            {(["color", "design"] as const).map(tab => (
              <button key={tab} onClick={() => setMobileTab(tab)} style={{ touchAction: "manipulation" }}
                className={`flex-1 py-2.5 font-sans text-[10px] tracking-[0.15em] uppercase transition-all duration-200 ${
                  mobileTab === tab ? "bg-white text-zinc-900" : "text-zinc-500"
                }`}>
                {tab === "color" ? "Colour" : "Design"}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4">
          <GlassPanel>{mobileTab === "color" ? ColorControls() : DesignControls()}</GlassPanel>
        </div>

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
                  <button key={s} onClick={() => { setSize(s); setSizeError(false); }} style={{ touchAction: "manipulation" }}
                    className={`w-10 h-10 rounded-full font-sans text-[11px] border transition-all duration-200 ${
                      size === s ? "bg-white text-zinc-900 border-white" : "border-white/15 text-zinc-500 hover:border-white/40"
                    }`}>{s}</button>
                ))}
              </div>
              <div className="flex items-center gap-3 pt-1">
                <p className="font-sans text-[9px] tracking-[0.2em] uppercase text-zinc-500 font-light">Qty</p>
                <div className="flex items-center rounded-full overflow-hidden"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ touchAction: "manipulation" }}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white text-lg font-light">−</button>
                  <span className="w-7 text-center font-sans text-sm text-zinc-300">{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(10, q + 1))} style={{ touchAction: "manipulation" }}
                    className="w-8 h-8 flex items-center justify-center text-zinc-500 hover:text-white text-lg font-light">+</button>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {/* Mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-4"
        style={{ background: "linear-gradient(to top,rgba(3,3,3,0.98),transparent)" }}>
        <div className="flex gap-3">
          <div className="flex flex-col justify-center px-4 py-2 rounded-2xl min-w-[90px]"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="font-sans text-[8px] tracking-[0.2em] uppercase text-zinc-600">Total</p>
            <p className="font-serif text-white text-xl font-light">{pricesLoaded ? `GH₵${price * quantity}` : "—"}</p>
          </div>
          <button onClick={handleAddToCart} disabled={!pricesLoaded} style={{ touchAction: "manipulation" }}
            className="flex-1 flex items-center justify-center gap-2 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.15em] uppercase rounded-2xl h-14 hover:bg-zinc-100 transition-colors disabled:opacity-40">
            {addedToCart ? <><Check size={14} /> Added!</> : <><ShoppingBag size={14} /> Add to Cart</>}
          </button>
          <button
            onClick={() => { if (!isSignedIn) { setAuthToast(true); setTimeout(() => setAuthToast(false), 3000); return; } setWishlisted(w => !w); }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ border: "1px solid rgba(255,255,255,0.1)", touchAction: "manipulation" }}>
            <Heart size={16} className={wishlisted ? "fill-white text-white" : "text-zinc-500"} />
          </button>
        </div>
      </div>

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
