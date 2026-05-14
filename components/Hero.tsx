"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight, ArrowDown } from "lucide-react";

// ─── Marquee ──────────────────────────────────────────────────────────────────

const MARQUEE = [
  "Vintage Gallery", "★", "Premium Streetwear", "★",
  "Ghana's Finest",  "★", "Limited Drops",       "★",
  "Curated Pieces",  "★", "SS '25",              "★",
];

function MarqueeStrip() {
  const doubled = [...MARQUEE, ...MARQUEE];
  return (
    <div className="overflow-hidden bg-vg-ink py-4">
      <div className="animate-marquee whitespace-nowrap flex gap-10">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`font-sans text-[10px] tracking-[0.4em] uppercase font-medium ${
              item === "★" ? "text-white/20" : "text-white/50"
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS = [
  { value: "500+", label: "Pieces Sold" },
  { value: "100%", label: "Authentic"   },
  { value: "GH",   label: "Based"       },
  { value: "48h",  label: "Delivery"    },
];

function StatsBar() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 bg-white border-b border-vg-border">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.6 }}
          className={`flex flex-col items-center justify-center py-8 gap-1.5 ${i < 3 ? "border-r border-vg-border" : ""}`}
        >
          <span className="font-serif text-3xl text-vg-ink" style={{ fontWeight: 300 }}>{s.value}</span>
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-vg-ink-muted/50 font-light">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const y       = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);

  return (
    <section className="relative">
      {/* ── Full-screen hero ── */}
      <div
        ref={containerRef}
        className="relative min-h-screen overflow-hidden bg-vg-ink flex items-center"
      >
        {/* Subtle noise grain */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        <motion.div style={{ opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-160px)]">

            {/* ── Left: text ── */}
            <div className="flex flex-col justify-center">
              {/* Pill badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 w-fit mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/60 font-light">
                  New Drop — SS&apos;25
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="font-serif text-[clamp(4rem,8vw,7rem)] leading-[0.95] text-white mb-8"
                style={{ fontWeight: 300 }}
              >
                Dressed in
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>Streetwear.</em>
                <br />
                Worn with
                <br />
                Intention.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.38 }}
                className="font-sans text-[15px] text-white/40 font-light leading-[1.8] max-w-sm mb-10"
              >
                Premium streetwear curated for the modern Ghanaian. Limited drops. No compromises.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.52 }}
                className="flex flex-wrap gap-3"
              >
                <Link href="#collection" className="btn-pill-white">
                  Shop the Drop <ArrowRight size={14} />
                </Link>
                <Link href="/customize" className="btn-pill-outline-white">
                  Design Your Piece
                </Link>
              </motion.div>
            </div>

            {/* ── Right: product showcase (bento cards) ── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, delay: 0.3 }}
              className="hidden lg:grid grid-cols-2 gap-4 items-start"
            >
              {/* Card 1 — HOPE tee, tall */}
              <motion.div
                style={{ y }}
                className="relative rounded-3xl overflow-hidden bg-zinc-900 aspect-[3/4]"
              >
                <Image
                  src="/asset/product-hope.jpg"
                  alt="Light in Darkness Tee"
                  fill
                  priority
                  className="object-cover object-center"
                  onError={() => {}}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {/* Label */}
                <div className="absolute bottom-5 left-5 right-5">
                  <span className="inline-block bg-white/15 backdrop-blur-sm rounded-full px-3 py-1 font-sans text-[9px] tracking-[0.25em] uppercase text-white/80 mb-2">HOPE Collection</span>
                  <p className="font-serif text-white text-lg font-light">Light in Darkness</p>
                  <p className="font-sans text-white/50 text-[11px] font-light mt-0.5">GH₵ 320</p>
                </div>
              </motion.div>

              {/* Right column — 2 stacked cards */}
              <div className="flex flex-col gap-4 pt-8">
                {/* Card 2 — Be Yourself */}
                <motion.div
                  style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "8%"]) }}
                  className="relative rounded-3xl overflow-hidden bg-zinc-900 aspect-square"
                >
                  <Image
                    src="/asset/product-beyourself.jpg"
                    alt="Be Yourself Tee"
                    fill
                    className="object-cover object-center"
                    onError={() => {}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="font-serif text-white text-base font-light">Be Yourself</p>
                    <p className="font-sans text-white/50 text-[11px] font-light">GH₵ 280</p>
                  </div>
                </motion.div>

                {/* Card 3 — Tupac */}
                <motion.div
                  style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "5%"]) }}
                  className="relative rounded-3xl overflow-hidden bg-zinc-900 aspect-square"
                >
                  <Image
                    src="/asset/product-tupac.jpg"
                    alt="All Eyez On Me Tee"
                    fill
                    className="object-cover object-center"
                    onError={() => {}}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="inline-block bg-white text-vg-ink rounded-full px-2.5 py-0.5 font-sans text-[8px] tracking-[0.2em] uppercase font-medium mb-1.5">Limited</span>
                    <p className="font-serif text-white text-base font-light">All Eyez On Me</p>
                    <p className="font-sans text-white/50 text-[11px] font-light">GH₵ 300</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          >
            <ArrowDown size={16} className="text-white/25" />
          </motion.div>
        </div>
      </div>

      {/* Marquee — dark strip */}
      <MarqueeStrip />

      {/* Stats — white strip */}
      <StatsBar />
    </section>
  );
}
