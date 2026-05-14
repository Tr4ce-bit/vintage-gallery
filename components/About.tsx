"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";

const PILLARS = [
  { number: "01", title: "Premium Quality",  desc: "Every piece handpicked for weight, drape, and durability. No shortcuts." },
  { number: "02", title: "Ghana-Born",        desc: "Rooted in Accra's energy. Every design reflects our culture and ambition." },
  { number: "03", title: "Limited Drops",     desc: "Controlled quantities. Rarity is respect for the culture — not a gimmick." },
  { number: "04", title: "100% Authentic",    desc: "Every item verified. Every tag traceable. Your trust is everything to us." },
];

const PROCESS = [
  { step: "I",   title: "Source",  desc: "Premium fabrics selected by hand from trusted mills and suppliers." },
  { step: "II",  title: "Design",  desc: "Graphics and silhouettes crafted to make a statement on the street." },
  { step: "III", title: "Produce", desc: "Limited runs, quality-checked at every stage before shipping." },
  { step: "IV",  title: "Drop",    desc: "Members get first access. Right piece, right person, never oversaturated." },
];

export default function About() {
  const storyRef    = useRef(null);
  const storyInView = useInView(storyRef, { once: true, margin: "-10%" });

  const pillarsRef    = useRef(null);
  const pillarsInView = useInView(pillarsRef, { once: true, margin: "-5%" });

  const processRef    = useRef(null);
  const processInView = useInView(processRef, { once: true, margin: "-5%" });

  return (
    <section id="about">

      {/* ── Story ── */}
      <div className="bg-vg-cream py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={storyRef} className="grid lg:grid-cols-2 gap-16 md:gap-24 items-center">

            {/* Text */}
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={storyInView ? { opacity: 1 } : {}}
                className="font-sans text-[10px] tracking-[0.45em] uppercase text-vg-ink-muted/40 font-light mb-6"
              >
                Our Story
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 }}
                className="font-serif text-[clamp(2.8rem,5vw,4.5rem)] text-vg-ink leading-[1.05] mb-8"
                style={{ fontWeight: 300 }}
              >
                Woven from the
                <br />
                streets of
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>Accra.</em>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 }}
                className="space-y-5 font-sans text-[15px] text-vg-ink-muted/60 font-light leading-[1.85] max-w-md mb-10"
              >
                <p>
                  Vintage Gallery was born from a simple belief: Ghanaian streetwear should carry the weight of our culture — the noise of Accra, the elegance of our heritage, the ambition of our generation.
                </p>
                <p>
                  We don&apos;t do fast fashion. Every piece is deliberately curated, limited in quantity, and built to outlast trends. When you wear VG, you wear a statement.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={storyInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.45 }}
              >
                <div className="w-12 h-px bg-vg-ink/20 mb-5" />
                <p className="font-serif text-2xl text-vg-ink italic" style={{ fontWeight: 400 }}>
                  &ldquo;Wear less. Mean more.&rdquo;
                </p>
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-vg-ink-muted/40 mt-3 font-light">
                  — Vintage Gallery, Accra · Est. 2022
                </p>
              </motion.div>
            </div>

            {/* Visual — rounded card with logo */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden bg-vg-ink aspect-[4/5] card-float">
                {/* Logo centrepiece */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative w-48 h-48 opacity-15">
                    <Image src="/asset/logo.png" alt="VG" fill className="object-contain brightness-0 invert" />
                  </div>
                </div>

                {/* Decorative corner brackets */}
                <div className="absolute top-8 left-8 w-8 h-8 border-t border-l border-white/15 rounded-tl-sm" />
                <div className="absolute top-8 right-8 w-8 h-8 border-t border-r border-white/15 rounded-tr-sm" />
                <div className="absolute bottom-8 left-8 w-8 h-8 border-b border-l border-white/15 rounded-bl-sm" />
                <div className="absolute bottom-8 right-8 w-8 h-8 border-b border-r border-white/15 rounded-br-sm" />

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/50 to-transparent">
                  <p className="font-sans text-[8px] tracking-[0.4em] uppercase text-white/35 mb-1.5">Premium Streetwear</p>
                  <p className="font-serif text-2xl text-white font-light">Ghana&apos;s Finest.</p>
                </div>
              </div>

              {/* Floating stat cards — rounded */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 card shadow-card"
              >
                <p className="font-serif text-3xl text-vg-ink font-light">500+</p>
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-vg-ink-muted/40 mt-1 font-light">Pieces Delivered</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-5 -right-5 bg-vg-ink rounded-2xl p-4 shadow-card"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="font-sans text-[9px] tracking-[0.25em] uppercase text-white/60 font-light">Drop Live</p>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Stats — rounded cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20">
            {[
              { value: "500+", label: "Pieces Sold" },
              { value: "100%", label: "Authentic"   },
              { value: "48h",  label: "Delivery"    },
              { value: "GH",   label: "Based"       },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-card"
              >
                <span className="font-serif text-4xl text-vg-ink block mb-1" style={{ fontWeight: 300 }}>{s.value}</span>
                <span className="font-sans text-[9px] tracking-[0.3em] uppercase text-vg-ink-muted/40 font-light">{s.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Pillars — dark section ── */}
      <div className="bg-vg-ink py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={pillarsRef} className="mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              animate={pillarsInView ? { opacity: 1 } : {}}
              className="font-sans text-[10px] tracking-[0.45em] uppercase text-white/25 font-light mb-4"
            >
              Why VG
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] text-white"
              style={{ fontWeight: 300 }}
            >
              Built on Principles.
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((pillar, i) => (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 24 }}
                animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 rounded-2xl p-7 hover:bg-white/8 transition-colors duration-300 group"
              >
                <span className="font-serif text-5xl text-white/10 font-light group-hover:text-white/15 transition-colors duration-300 block mb-6" style={{ fontWeight: 300 }}>
                  {pillar.number}
                </span>
                <h3 className="font-serif text-white text-xl mb-3" style={{ fontWeight: 400 }}>{pillar.title}</h3>
                <p className="font-sans text-white/30 text-[14px] font-light leading-[1.8]">{pillar.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Process — cream section ── */}
      <div className="bg-vg-cream-dark py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p className="font-sans text-[10px] tracking-[0.45em] uppercase text-vg-ink-muted/40 font-light mb-4">The Process</p>
            <h2 className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-vg-ink" style={{ fontWeight: 300 }}>
              How a VG piece is born
            </h2>
          </div>

          <div ref={processRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 24 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-7 shadow-card"
              >
                <p className="font-serif text-5xl text-vg-ink/10 mb-5 font-light" style={{ fontWeight: 300 }}>{p.step}</p>
                <h3 className="font-serif text-vg-ink text-2xl mb-3" style={{ fontWeight: 400 }}>{p.title}</h3>
                <p className="font-sans text-vg-ink-muted/50 text-[14px] font-light leading-[1.8]">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
