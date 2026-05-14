"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Award, MapPin, Zap, Shield } from "lucide-react";

const PILLARS = [
  { icon: Award,  title: "Premium Quality", desc: "Every piece is handpicked. We settle for nothing less than exceptional craft and material." },
  { icon: MapPin, title: "Ghana-Born",       desc: "Rooted in Accra's energy — our culture, our aesthetic, our pride. Built for the African hype." },
  { icon: Zap,    title: "Limited Drops",    desc: "Scarcity is our signature. Each drop is intentional, collectible, never mass produced." },
  { icon: Shield, title: "100% Authentic",   desc: "Every item verified. Every tag traceable. Your trust is our most valuable currency." },
];

function Pillar({ pillar, i, inView }: { pillar: typeof PILLARS[0]; i: number; inView: boolean }) {
  const Icon = pillar.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: i * 0.1 }}
      className="group p-8 border-b border-r border-brand-border-light hover:bg-black/5 transition-colors duration-300"
    >
      <div className="w-10 h-10 border border-black/15 flex items-center justify-center mb-6 group-hover:border-black/30 transition-colors">
        <Icon size={18} className="text-black/60" />
      </div>
      <h3 className="font-heading text-black text-lg mb-3 font-bold">{pillar.title}</h3>
      <p className="text-black/40 text-sm leading-relaxed">{pillar.desc}</p>
    </motion.div>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  const textRef    = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-10%" });

  const pillarsRef    = useRef(null);
  const pillarsInView = useInView(pillarsRef, { once: true, margin: "-5%" });

  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden">

      {/* ── White brand story block ── */}
      <div className="bg-white py-24 md:py-36 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={textRef} className="grid md:grid-cols-2 gap-16 md:gap-24 items-center">

            {/* Text */}
            <div>
              <motion.p
                initial={{ opacity: 0, x: -20 }}
                animate={textInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5 }}
                className="text-[9px] tracking-[0.45em] uppercase text-black/30 mb-5"
              >
                Our Story
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                animate={textInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.65, delay: 0.1 }}
                className="font-heading text-5xl md:text-6xl text-black leading-none font-black mb-6"
              >
                Wear the<br />Culture.
              </motion.h2>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={textInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.3 }}
                className="w-14 h-0.5 bg-black mb-8 origin-left"
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={textInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="space-y-5 text-black/40 text-sm leading-relaxed"
              >
                <p>
                  Vintage Gallery was born from a simple belief: Ghanaian streetwear should carry the weight of our culture — the noise of Accra, the elegance of our heritage, the ambition of our generation.
                </p>
                <p>
                  We don&apos;t do fast fashion. Every piece is deliberately curated, limited in quantity, and built to outlast trends. When you wear VG, you wear a statement.
                </p>
                <p>
                  From our first drop to our latest collection, the mission hasn&apos;t changed: bring premium hypebeast culture home — to Ghana, for Ghana.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={textInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mt-10 flex items-center gap-4"
              >
                <div className="w-12 h-12 border border-black/10 rounded-full flex items-center justify-center">
                  <span className="font-heading text-black font-bold text-sm">VG</span>
                </div>
                <div>
                  <p className="text-black text-sm font-semibold">Vintage Gallery Store</p>
                  <p className="text-black/30 text-[10px] tracking-widest uppercase mt-0.5">Accra, Ghana · Est. 2022</p>
                </div>
              </motion.div>
            </div>

            {/* Visual panel */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={textInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.2 }}
              className="relative"
            >
              <motion.div style={{ y }} className="relative aspect-[4/5] bg-black flex items-center justify-center overflow-hidden">
                {/* Logo centrepiece */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-40 h-40 opacity-30">
                    <Image
                      src="/asset/logo.png"
                      alt="VG"
                      fill
                      className="object-contain brightness-0 invert"
                    />
                  </div>
                </div>

                {/* Corner brackets */}
                <div className="absolute top-6 left-6 w-8 h-8 border-t border-l border-white/20" />
                <div className="absolute top-6 right-6 w-8 h-8 border-t border-r border-white/20" />
                <div className="absolute bottom-6 left-6 w-8 h-8 border-b border-l border-white/20" />
                <div className="absolute bottom-6 right-6 w-8 h-8 border-b border-r border-white/20" />

                {/* Bottom label */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                  <p className="text-[8px] tracking-[0.4em] uppercase text-white/40 mb-1.5">Premium Streetwear</p>
                  <p className="font-heading text-xl text-white font-black">Ghana&apos;s Finest.</p>
                </div>
              </motion.div>

              {/* Floating stat */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-5 -left-5 bg-white border border-black/10 p-5 shadow-xl"
              >
                <p className="font-heading text-3xl text-black font-black">500+</p>
                <p className="text-[9px] tracking-[0.3em] uppercase text-black/35 mt-1">Pieces Delivered</p>
              </motion.div>

              {/* Live badge */}
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-5 -right-5 bg-black p-4 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <p className="text-[9px] tracking-[0.3em] uppercase text-white/60">Drop Live</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mt-24 border border-black/10">
            {[
              { value: "500+", label: "Pieces Sold" },
              { value: "100%", label: "Authentic"   },
              { value: "48h",  label: "Delivery"    },
              { value: "GH",   label: "Based"       },
            ].map((s, i) => {
              const ref    = useRef(null);
              const inView = useInView(ref, { once: true });
              return (
                <motion.div
                  key={s.label}
                  ref={ref}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="flex flex-col items-center justify-center py-10 px-4 gap-2 border-r border-black/10 last:border-r-0"
                >
                  <span className="font-heading text-5xl text-black font-black">{s.value}</span>
                  <span className="text-[9px] tracking-[0.3em] uppercase text-black/30">{s.label}</span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Black pillars block ── */}
      <div className="bg-brand-black py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={pillarsRef} className="mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              animate={pillarsInView ? { opacity: 1 } : {}}
              className="text-[9px] tracking-[0.45em] uppercase text-white/25 mb-3"
            >
              Why VG
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl md:text-5xl text-white font-black"
            >
              Built on Principles.
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 border border-brand-border">
            {PILLARS.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="group p-8 border-r border-b border-brand-border last:border-r-0 hover:bg-brand-surface transition-colors duration-300"
                >
                  <div className="w-10 h-10 border border-white/10 flex items-center justify-center mb-6 group-hover:border-white/25 transition-colors">
                    <Icon size={18} className="text-white/50" />
                  </div>
                  <h3 className="font-heading text-white text-lg mb-3 font-bold">{pillar.title}</h3>
                  <p className="text-white/30 text-sm leading-relaxed">{pillar.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
