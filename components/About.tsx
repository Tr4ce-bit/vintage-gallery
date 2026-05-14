"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Award, MapPin, Zap, Shield } from "lucide-react";

// ─── Brand pillars ────────────────────────────────────────────────────────────

const PILLARS = [
  {
    icon: Award,
    title: "Premium Quality",
    desc: "Every piece is handpicked and quality-checked. We settle for nothing less than exceptional.",
  },
  {
    icon: MapPin,
    title: "Ghana-Born",
    desc: "Rooted in Accra's energy — our culture, our aesthetic, our pride. Built for the African hype.",
  },
  {
    icon: Zap,
    title: "Limited Drops",
    desc: "Scarcity is our signature. Each drop is intentional, collectible, and never mass produced.",
  },
  {
    icon: Shield,
    title: "100% Authentic",
    desc: "Every item verified. Every tag traceable. Your trust is our most valuable currency.",
  },
];

// ─── Animated counter ─────────────────────────────────────────────────────────

function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay }}
      className="text-center"
    >
      <p className="font-heading text-5xl md:text-6xl text-brand-gold font-black mb-2">{value}</p>
      <p className="text-[10px] tracking-[0.35em] uppercase text-brand-cream/40">{label}</p>
    </motion.div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["5%", "-5%"]);

  const pillarsRef = useRef(null);
  const pillarsInView = useInView(pillarsRef, { once: true, margin: "-5%" });

  const textRef = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-10%" });

  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden bg-brand-surface py-24 md:py-36">

      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/20 to-transparent" />
        <motion.div style={{ y }} className="absolute -right-32 top-1/4 w-[500px] h-[500px] rounded-full bg-brand-gold/3 blur-[150px]" />
        <motion.div style={{ y }} className="absolute -left-32 bottom-1/4 w-[400px] h-[400px] rounded-full bg-brand-indigo/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative">

        {/* ── Brand story ── */}
        <div ref={textRef} className="grid md:grid-cols-2 gap-16 items-center mb-24 md:mb-32">

          {/* Left: Text */}
          <div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={textInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              className="text-[10px] tracking-[0.4em] uppercase text-brand-gold mb-6"
            >
              Our Story
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={textInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-heading text-4xl md:text-5xl text-brand-cream leading-tight mb-6"
            >
              Wear the<br />
              <span className="text-gold-shimmer">Culture.</span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={textInView ? { scaleX: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-16 h-0.5 bg-brand-gold mb-8 origin-left"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={textInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="space-y-5 text-brand-cream/50 leading-relaxed text-sm"
            >
              <p>
                Vintage Gallery was born from a simple belief: Ghanaian streetwear should carry the weight of our culture — the noise of Accra, the elegance of our heritage, the ambition of our generation.
              </p>
              <p>
                We don&apos;t do fast fashion. Every piece in our catalog is deliberately curated, limited in quantity, and built to outlast trends. When you wear VG, you wear a statement.
              </p>
              <p>
                From our first drop to our latest collection, the mission hasn&apos;t changed: bring premium hypebeast culture home — to Ghana, for Ghana.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={textInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full border border-brand-gold/30 flex items-center justify-center">
                <span className="font-heading text-brand-gold font-bold text-sm">VG</span>
              </div>
              <div>
                <p className="text-brand-cream text-sm font-medium">Vintage Gallery</p>
                <p className="text-brand-cream/30 text-xs tracking-widest uppercase">Accra, Ghana · Est. 2022</p>
              </div>
            </motion.div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={textInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative"
          >
            {/* Main visual card */}
            <div className="relative aspect-[4/5] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-brand-border overflow-hidden">
              {/* Try to load logo image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-48 h-48 opacity-20">
                  <Image
                    src="/asset/logo.png"
                    alt="Vintage Gallery"
                    fill
                    className="object-contain"
                    onError={() => {}}
                  />
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute inset-0">
                <div className="absolute top-8 left-8 w-16 h-16 border border-brand-gold/15" />
                <div className="absolute bottom-8 right-8 w-16 h-16 border border-brand-gold/15" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-brand-gold/5" />
              </div>

              {/* Text overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-brand-black to-transparent">
                <p className="text-[9px] tracking-[0.4em] uppercase text-brand-gold/60 mb-2">Premium Streetwear</p>
                <p className="font-heading text-2xl text-brand-cream">Ghana&apos;s Finest</p>
              </div>
            </div>

            {/* Floating accent card */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-6 -left-6 glass-card p-5 border border-brand-gold/20"
            >
              <p className="font-heading text-3xl text-brand-gold font-black">500+</p>
              <p className="text-[10px] tracking-[0.3em] uppercase text-brand-cream/40 mt-1">Pieces Delivered</p>
            </motion.div>

            {/* Second accent card */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-6 -right-6 glass-card p-4 border border-brand-gold/20"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-[10px] tracking-[0.25em] uppercase text-brand-cream/60">Drop Live</p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 md:mb-32 py-16 border-y border-brand-border">
          <Stat value="500+" label="Pieces Sold" delay={0} />
          <Stat value="100%" label="Authentic" delay={0.1} />
          <Stat value="48h" label="Delivery" delay={0.2} />
          <Stat value="GH" label="Based" delay={0.3} />
        </div>

        {/* ── Pillars ── */}
        <div ref={pillarsRef}>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-center text-[10px] tracking-[0.4em] uppercase text-brand-gold mb-3"
          >
            Why VG
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading text-3xl md:text-4xl text-brand-cream text-center mb-16"
          >
            Built on Principles
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-border">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="bg-brand-surface p-8 hover:bg-brand-black transition-colors duration-300 group"
                >
                  <div className="w-12 h-12 border border-brand-gold/20 flex items-center justify-center mb-6 group-hover:border-brand-gold/50 transition-colors duration-300">
                    <Icon size={20} className="text-brand-gold" />
                  </div>
                  <h3 className="font-heading text-lg text-brand-cream mb-3">{pillar.title}</h3>
                  <p className="text-brand-cream/40 text-sm leading-relaxed">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
