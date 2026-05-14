"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  Variants,
} from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { LogoGold } from "@/components/Logo";

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94], delay },
  }),
};

const letterReveal: Variants = {
  hidden: { opacity: 0, y: "100%" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.33, 1, 0.68, 1],
      delay: 0.05 * i,
    },
  }),
};

const lineReveal: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.6 },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SplitText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`inline-flex flex-wrap overflow-hidden ${className ?? ""}`}>
      {text.split("").map((char, i) => (
        <span key={i} className="overflow-hidden inline-block">
          <motion.span
            className="inline-block"
            variants={letterReveal}
            custom={i}
          >
            {char === " " ? " " : char}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

// ─── Floating badge ───────────────────────────────────────────────────────────

function DropsoonBadge() {
  return (
    <motion.div
      variants={fadeUp}
      custom={0.2}
      className="inline-flex items-center gap-2 glass-card rounded-full px-5 py-2 mb-8"
    >
      <motion.span
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Sparkles size={14} className="text-brand-gold" />
      </motion.span>
      <span className="text-xs tracking-[0.25em] uppercase text-brand-gold font-medium">
        New Collection — SS&apos;25
      </span>
      <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
    </motion.div>
  );
}

// ─── Scroll indicator ─────────────────────────────────────────────────────────

function ScrollIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 1 }}
      className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold/60">
        Scroll
      </span>
      <div className="w-px h-12 bg-gradient-to-b from-brand-gold/60 to-transparent relative overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-0 h-4 bg-brand-gold"
          animate={{ y: ["0%", "300%"] }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

// ─── Marquee strip ────────────────────────────────────────────────────────────

const MARQUEE_ITEMS = [
  "Vintage Gallery",
  "★",
  "Premium Streetwear",
  "★",
  "Ghana's Finest",
  "★",
  "Limited Drops",
  "★",
  "Curated Pieces",
  "★",
];

function MarqueeStrip() {
  const doubled = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-brand-border py-4 bg-brand-surface">
      <div className="animate-marquee whitespace-nowrap flex gap-12">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={
              item === "★"
                ? "text-brand-gold text-sm"
                : "text-xs tracking-[0.3em] uppercase text-brand-cream/50 font-medium"
            }
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
  { value: "100%", label: "Authentic" },
  { value: "GH", label: "Based" },
  { value: "48h", label: "Delivery" },
];

function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 divide-x divide-brand-border border-b border-brand-border">
      {STATS.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.6 }}
          className="flex flex-col items-center justify-center py-8 px-4 gap-1"
        >
          <span className="font-heading text-3xl text-brand-gold font-bold">
            {stat.value}
          </span>
          <span className="text-xs tracking-[0.2em] uppercase text-brand-cream/40">
            {stat.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax: background image moves slower than scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const bgY      = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity  = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale    = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section className="relative">
      {/* ── Full-screen hero canvas ── */}
      <div
        ref={containerRef}
        className="relative h-screen min-h-[700px] overflow-hidden flex items-center justify-center noise-overlay bg-brand-black"
      >
        {/* Background — CSS gradient (no external image dependency) */}
        <motion.div
          style={{ y: bgY, scale }}
          className="absolute inset-0 will-change-transform"
        >
          {/* Rich dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0d0c0e] to-[#080808]" />
          {/* Subtle gold diagonal sweep */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(201,168,76,0.04)_0%,transparent_50%,rgba(27,20,100,0.05)_100%)]" />
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(rgba(201,168,76,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.5) 1px, transparent 1px)`,
              backgroundSize: "80px 80px",
            }}
          />
          {/* Bottom fade to black */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-black" />
        </motion.div>

        {/* Ambient glow orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-indigo/10 rounded-full blur-[100px]" />
        </div>

        {/* ── Content ── */}
        <motion.div
          style={{ opacity }}
          className="relative z-10 text-center px-6 max-w-6xl mx-auto"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            {/* Badge */}
            <DropsoonBadge />

            {/* Logo mark — the real VG monogram, tinted gold */}
            <motion.div variants={fadeUp} custom={0.3} className="mb-6">
              <LogoGold size={120} />
            </motion.div>

            {/* Decorative line */}
            <motion.div
              variants={lineReveal}
              className="w-32 h-px bg-brand-gold mb-8"
            />

            {/* Sub-headline */}
            <motion.p
              variants={fadeUp}
              custom={0.8}
              className="text-brand-cream/60 text-base md:text-lg tracking-[0.15em] uppercase max-w-md mb-12"
            >
              Curated vintage streetwear. <br className="hidden md:block" />
              Ghana&apos;s premier drop culture.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={fadeUp}
              custom={1.0}
              className="flex flex-col sm:flex-row gap-4 items-center"
            >
              <Link href="/customize" className="btn-gold inline-flex items-center gap-3">
                Design Your Piece
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight size={16} />
                </motion.span>
              </Link>
              <Link href="#collection" className="btn-outline-gold">
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
