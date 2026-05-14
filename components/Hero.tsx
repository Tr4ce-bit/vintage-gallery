"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  Variants,
} from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
};

const lineReveal: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: { scaleX: 1, transition: { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.5 } },
};

// ─── Marquee ─────────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "Vintage Gallery", "·", "Premium Streetwear", "·",
  "Ghana's Finest",  "·", "Limited Drops",       "·",
  "Curated Pieces",  "·",
];

function MarqueeStrip({ inverted = false }: { inverted?: boolean }) {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className={`overflow-hidden border-y py-4 ${inverted ? "border-white/10 bg-white" : "border-brand-border bg-brand-surface"}`}>
      <div className="animate-marquee whitespace-nowrap flex gap-14">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`text-[10px] tracking-[0.35em] uppercase font-medium ${
              item === "·"
                ? (inverted ? "text-black/20" : "text-white/20")
                : (inverted ? "text-black/50" : "text-white/40")
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────

const STATS = [
  { value: "500+", label: "Pieces Sold" },
  { value: "100%", label: "Authentic"   },
  { value: "GH",   label: "Based"       },
  { value: "48h",  label: "Delivery"    },
];

function StatsBar() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 divide-x divide-brand-border border-b border-brand-border">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.6 }}
          className="flex flex-col items-center justify-center py-8 px-4 gap-1.5"
        >
          <span className="font-heading text-3xl text-white font-bold">{s.value}</span>
          <span className="text-[9px] tracking-[0.3em] uppercase text-white/30">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Scroll indicator ─────────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2.2, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-[9px] tracking-[0.35em] uppercase text-white/30">Scroll</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        <ArrowDown size={14} className="text-white/30" />
      </motion.div>
    </motion.div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const bgY     = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);

  return (
    <section className="relative">
      {/* ── Full-screen canvas ── */}
      <div
        ref={containerRef}
        className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center bg-brand-black noise-overlay"
      >
        {/* Animated background grid */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)
              `,
              backgroundSize: "100px 100px",
            }}
          />
          {/* Diagonal accent */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_60%)]" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-brand-black to-transparent" />
        </motion.div>

        {/* Corner brackets */}
        <div className="absolute top-24 left-8 w-10 h-10 border-t border-l border-white/15" />
        <div className="absolute top-24 right-8 w-10 h-10 border-t border-r border-white/15" />
        <div className="absolute bottom-24 left-8 w-10 h-10 border-b border-l border-white/15" />
        <div className="absolute bottom-24 right-8 w-10 h-10 border-b border-r border-white/15" />

        {/* ── Content ── */}
        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-6 max-w-5xl mx-auto w-full"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Drop badge */}
            <motion.div
              variants={fadeUp}
              custom={0.1}
              className="inline-flex items-center gap-3 border border-white/15 px-5 py-2 mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] tracking-[0.4em] uppercase text-white/50 font-medium">
                New Collection — SS&apos;25
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </motion.div>

            {/* Logo mark */}
            <motion.div variants={fadeUp} custom={0.25} className="mb-8 relative">
              <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto">
                <Image
                  src="/asset/logo.png"
                  alt="Vintage Gallery"
                  fill
                  priority
                  className="object-contain brightness-0 invert"
                />
              </div>
            </motion.div>

            {/* Headline */}
            <motion.div variants={fadeUp} custom={0.4} className="mb-3 overflow-hidden">
              <h1 className="font-heading text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] text-white font-black tracking-tight">
                VINTAGE
              </h1>
            </motion.div>
            <motion.div variants={fadeUp} custom={0.5} className="overflow-hidden mb-3">
              <h1 className="font-heading text-[clamp(3.5rem,10vw,8rem)] leading-[0.9] text-white font-black tracking-tight">
                GALLERY
              </h1>
            </motion.div>

            {/* Decorative line */}
            <motion.div
              variants={lineReveal}
              className="w-40 h-px bg-white mb-7 mt-2"
            />

            {/* Sub */}
            <motion.p
              variants={fadeUp}
              custom={0.7}
              className="text-white/35 text-[11px] tracking-[0.35em] uppercase mb-10 max-w-xs"
            >
              Curated vintage streetwear · Ghana&apos;s premier drop culture
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              custom={0.9}
              className="flex flex-col sm:flex-row gap-3 items-center"
            >
              <Link href="/customize" className="btn-primary inline-flex items-center gap-3">
                Design Your Piece
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
                >
                  <ArrowRight size={14} />
                </motion.span>
              </Link>
              <Link href="#collection" className="btn-outline">
                View Collection
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        <ScrollIndicator />
      </div>

      {/* ── Marquee ── */}
      <MarqueeStrip />

      {/* ── Stats ── */}
      <StatsBar />
    </section>
  );
}
