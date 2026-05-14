"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

// ─── Marquee ──────────────────────────────────────────────────────────────────

const MARQUEE = [
  "Vintage Gallery", "·", "Premium Streetwear", "·",
  "Ghana's Finest",  "·", "Limited Drops",       "·",
  "SS '25",          "·", "Accra",               "·",
];

function Marquee() {
  const d = [...MARQUEE, ...MARQUEE];
  return (
    <div className="overflow-hidden bg-zinc-950 border-y border-zinc-800 py-3.5">
      <div className="animate-marquee flex whitespace-nowrap gap-10">
        {d.map((t, i) => (
          <span key={i} className={`font-sans text-[10px] tracking-[0.4em] uppercase ${t === "·" ? "text-zinc-700" : "text-zinc-400 font-light"}`}>
            {t}
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
  { value: "48h",  label: "Fast Delivery" },
];

function Stats() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 bg-white">
      {STATS.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: i * 0.09, duration: 0.55 }}
          className={`py-9 flex flex-col items-center gap-1.5 ${i < 3 ? "border-r border-zinc-100" : ""} border-b border-zinc-100`}
        >
          <span className="font-serif text-[2.2rem] text-zinc-900 leading-none" style={{ fontWeight: 300 }}>{s.value}</span>
          <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-400 font-light">{s.label}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY   = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const imageY  = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section>
      {/* ── Main hero panel ── */}
      <div ref={ref} className="relative min-h-screen bg-zinc-950 overflow-hidden flex items-end pb-14 md:pb-20">

        {/* Full-bleed product image — right half */}
        <motion.div style={{ y: imageY }} className="absolute right-0 top-0 bottom-0 w-full md:w-[56%] will-change-transform">
          <Image
            src="/asset/product-hope.jpg"
            alt="Light in Darkness Tee"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Left gradient fade into dark */}
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/70 to-transparent" />
          {/* Bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />
        </motion.div>

        {/* Text — pinned left */}
        <motion.div style={{ y: textY, opacity }} className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10">
          <div className="max-w-xl">

            {/* Season pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 mb-10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              <span className="font-sans text-[10px] tracking-[0.3em] uppercase text-white/50 font-light">
                New Drop — SS&apos;25
              </span>
            </motion.div>

            {/* Headline — big, confident, editorial */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.8 }}
              className="font-serif leading-[0.95] text-white mb-8"
              style={{
                fontSize: "clamp(3.5rem, 9vw, 7.5rem)",
                fontWeight: 300,
                letterSpacing: "-0.01em",
              }}
            >
              Wear the
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>Culture.</em>
            </motion.h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.7 }}
              className="font-sans text-base text-white/50 font-light leading-relaxed max-w-sm mb-10"
            >
              Premium streetwear for the modern Ghanaian. Limited drops, curated pieces — built to make a statement.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.56, duration: 0.6 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href="#collection"
                className="inline-flex items-center gap-2.5 bg-white text-zinc-900 font-sans font-medium text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-100 transition-colors duration-200 group"
              >
                Shop the Drop
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </Link>
              <Link
                href="/customize"
                className="inline-flex items-center gap-2.5 border border-white/20 text-white font-sans font-light text-[11px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:border-white/40 hover:bg-white/5 transition-all duration-200"
              >
                Design Your Piece
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom-right product tag */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="absolute bottom-14 md:bottom-20 right-6 md:right-10 z-10 text-right hidden md:block"
        >
          <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-white/30 font-light mb-1">Featured</p>
          <p className="font-serif text-white text-xl font-light">&ldquo;Light in Darkness&rdquo;</p>
          <p className="font-sans text-[10px] text-white/35 font-light mt-0.5">HOPE Collection · GH₵ 320</p>
        </motion.div>
      </div>

      <Marquee />
      <Stats />
    </section>
  );
}
