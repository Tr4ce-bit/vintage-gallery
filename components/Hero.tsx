"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Marquee ─────────────────────────────────────────────────────────────────

const MARQUEE = [
  "Vintage Gallery", "·", "Premium Streetwear", "·",
  "Ghana's Finest",  "·", "Limited Drops",       "·",
  "Curated Pieces",  "·", "SS '25",              "·",
];

function MarqueeStrip({ light = false }: { light?: boolean }) {
  const doubled = [...MARQUEE, ...MARQUEE];
  return (
    <div className={`overflow-hidden border-y py-4 ${light ? "border-vg-border-light bg-vg-cream" : "border-vg-border bg-vg-surface"}`}>
      <div className="animate-marquee whitespace-nowrap flex gap-14">
        {doubled.map((item, i) => (
          <span
            key={i}
            className={`font-sans text-[10px] tracking-[0.4em] uppercase font-light ${
              item === "·"
                ? (light ? "text-vg-ink/20" : "text-white/15")
                : (light ? "text-vg-ink/40" : "text-white/35")
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
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 divide-x divide-vg-border border-b border-vg-border">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
          className="flex flex-col items-center justify-center py-10 px-4 gap-2"
        >
          <span className="font-serif text-4xl text-white font-light">{s.value}</span>
          <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-white/30">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const bgY     = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.65], [1, 0]);

  return (
    <section className="relative">
      <div
        ref={containerRef}
        className="relative min-h-screen overflow-hidden flex items-center bg-vg-black noise-overlay"
      >
        {/* Background texture — cross-hatch at ultra-low opacity */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 will-change-transform">
          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Vertical accent lines — like Majlis */}
          <div className="absolute right-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.06]" />
          <div className="absolute left-[15%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.04]" />
          {/* Bottom fade */}
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-vg-black to-transparent" />
        </motion.div>

        {/* ── Content: two-column like Majlis ── */}
        <motion.div
          style={{ opacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center py-32 pt-36"
        >
          {/* Left — text */}
          <div>
            {/* Eyebrow */}
            <p
              className="animate-fade-up font-sans text-[10px] tracking-[0.5em] uppercase text-white/40 font-light mb-8"
              style={{ animationDelay: "0.1s" }}
            >
              New Collection — SS&apos;25
            </p>

            {/* Headline — Cormorant with italic accent */}
            <h1
              className="animate-fade-up font-serif text-[clamp(3.8rem,8vw,7rem)] leading-[1.0] text-white mb-8"
              style={{ fontWeight: 300, animationDelay: "0.25s" }}
            >
              Dressed in
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>Streetwear.</em>
              <br />
              Worn with
              <br />
              Intention.
            </h1>

            {/* Body */}
            <p
              className="animate-fade-up font-sans text-[15px] leading-[1.85] text-white/45 font-light max-w-sm mb-12"
              style={{ animationDelay: "0.4s" }}
            >
              Vintage Gallery curates premium streetwear for the modern Ghanaian — each piece a statement between heritage and contemporary style. Made in limited quantities. Built to last.
            </p>

            {/* CTAs */}
            <div
              className="animate-fade-up flex flex-wrap gap-4"
              style={{ animationDelay: "0.55s" }}
            >
              <Link href="/customize" className="btn-primary">
                Design Your Piece
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link href="#collection" className="btn-outline">
                View Collection
              </Link>
            </div>
          </div>

          {/* Right — floating product frame like Majlis kaftan card */}
          <div className="hidden lg:flex justify-end">
            <div
              className="relative w-[380px] h-[520px] animate-fade-up animate-float"
              style={{ animationDelay: "0.35s" }}
            >
              {/* Nested border frames */}
              <div className="absolute inset-0 border border-white opacity-[0.12]" />
              <div className="absolute inset-4 border border-white opacity-[0.06]" />

              {/* Inner card */}
              <div className="absolute inset-8 bg-vg-surface overflow-hidden flex items-center justify-center">
                {/* VG Logo centrepiece */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-40 h-40 opacity-20">
                    <Image
                      src="/asset/logo.png"
                      alt="VG"
                      fill
                      priority
                      className="object-contain brightness-0 invert"
                    />
                  </div>
                </div>

                {/* Tee silhouette SVG — like Majlis kaftan SVG */}
                <svg
                  viewBox="0 0 260 320"
                  className="w-[75%] opacity-30"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M130 20 C130 20 100 25 75 45 L30 90 L65 108 L80 80 L80 300 L180 300 L180 80 L195 108 L230 90 L185 45 C160 25 130 20 130 20Z"
                    stroke="rgba(255,255,255,0.6)"
                    strokeWidth="1"
                    fill="rgba(255,255,255,0.03)"
                  />
                  <line x1="130" y1="48" x2="130" y2="280" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" strokeDasharray="4 6" />
                  <path d="M100 280 Q130 295 160 280" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" fill="none" />
                  <path d="M97 290 Q130 307 163 290" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" fill="none" />
                </svg>

                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-vg-black/30 to-transparent" />
              </div>

              {/* Label chip — like Majlis gold chip */}
              <div className="absolute -bottom-4 left-8 bg-white px-4 py-2">
                <span className="font-sans text-[9px] tracking-[0.4em] uppercase text-vg-ink font-medium">
                  SS 2025 — No. 01
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          <span
            className="animate-fade-in font-sans text-[9px] tracking-[0.4em] uppercase text-white/30 font-light"
            style={{ animationDelay: "1.4s" }}
          >
            Scroll
          </span>
          <div className="w-px h-12 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-white to-transparent animate-scroll-line" />
          </div>
        </div>
      </div>

      <MarqueeStrip />
      <StatsBar />
    </section>
  );
}
