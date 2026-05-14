"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

// Brand pillars — numbered like Majlis
const PILLARS = [
  {
    number: "01",
    title: "Heritage Materials",
    body: "We source only the finest fabrics — every piece hand-selected for weight, drape, and durability. No shortcuts. No compromise.",
  },
  {
    number: "02",
    title: "Limited Production",
    body: "Each VG drop is made in controlled quantities. Rarity is not a marketing tactic — it is respect for the culture.",
  },
  {
    number: "03",
    title: "Ghana-Born",
    body: "Rooted in Accra's energy. Every design decision reflects our landscape, our people, our ambition.",
  },
];

// Process steps — Roman numerals like Majlis
const PROCESS = [
  { step: "I",   title: "Source",  desc: "Fabrics selected by hand — premium mills and trusted suppliers chosen for quality above all." },
  { step: "II",  title: "Design",  desc: "Every silhouette is drafted to honour the body while making a statement on the street." },
  { step: "III", title: "Produce", desc: "Limited runs, quality-checked at every stage before a single piece leaves the floor." },
  { step: "IV",  title: "Drop",    desc: "Timed releases to members first. The right piece to the right person — never oversaturated." },
];

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["4%", "-4%"]);

  const textRef    = useRef(null);
  const textInView = useInView(textRef, { once: true, margin: "-10%" });

  const pillarsRef    = useRef(null);
  const pillarsInView = useInView(pillarsRef, { once: true, margin: "-5%" });

  const processRef    = useRef(null);
  const processInView = useInView(processRef, { once: true, margin: "-5%" });

  return (
    <section id="about" ref={sectionRef} className="relative overflow-hidden">

      {/* ── 1. Cream story block (like Majlis cream-dark heritage section) ── */}
      <div className="bg-vg-cream-dark py-28 md:py-36 px-6">
        <div className="max-w-7xl mx-auto">
          <div ref={textRef} className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Text column */}
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={textInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6 }}
                className="font-sans text-[10px] tracking-[0.45em] uppercase text-vg-ink/40 font-light mb-6"
              >
                Our Heritage
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 24 }}
                animate={textInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.75, delay: 0.1 }}
                className="font-serif text-[clamp(2.8rem,5vw,4.5rem)] text-vg-ink leading-[1.05] mb-8"
                style={{ fontWeight: 400 }}
              >
                Woven from
                <br />
                the streets of
                <br />
                <em style={{ fontStyle: "italic" }}>Accra.</em>
              </motion.h2>

              <motion.div
                initial={{ scaleX: 0 }}
                animate={textInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="w-16 h-px bg-vg-ink mb-8 origin-left"
              />

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={textInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.45 }}
                className="space-y-5 text-vg-ink-muted font-sans text-[15px] leading-[1.85] font-light max-w-md"
              >
                <p>
                  Vintage Gallery was born from a simple belief: Ghanaian streetwear should carry the weight of our culture — the noise of Accra, the elegance of our heritage, the ambition of our generation.
                </p>
                <p>
                  We don&apos;t do fast fashion. Every piece is deliberately curated, limited in quantity, and built to outlast trends. When you wear VG, you wear a statement.
                </p>
              </motion.div>

              {/* Quote — like Majlis founder quote */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={textInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.6 }}
                className="mt-12"
              >
                <div className="w-16 h-px bg-vg-ink/20 mb-6" />
                <p className="font-serif text-2xl text-vg-ink italic leading-snug" style={{ fontWeight: 400 }}>
                  &ldquo;Wear less. Mean more.&rdquo;
                </p>
                <p className="font-sans text-[10px] tracking-[0.3em] uppercase text-vg-ink/40 mt-3 font-light">
                  — Vintage Gallery, Accra
                </p>
              </motion.div>
            </div>

            {/* Right column — pillars numbered like Majlis */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={textInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.2 }}
              ref={pillarsRef}
              className="space-y-10"
            >
              {PILLARS.map((v, i) => (
                <motion.div
                  key={v.number}
                  initial={{ opacity: 0, y: 20 }}
                  animate={pillarsInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.12 }}
                  className="flex gap-6 pb-10 border-b border-vg-ink/10 last:border-0 last:pb-0 group"
                >
                  <span
                    className="font-serif text-5xl text-vg-ink opacity-[0.12] leading-none shrink-0 group-hover:opacity-25 transition-opacity duration-300"
                    style={{ fontWeight: 300 }}
                  >
                    {v.number}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-vg-ink mb-3 leading-snug" style={{ fontWeight: 500 }}>
                      {v.title}
                    </h3>
                    <p className="font-sans text-[15px] text-vg-ink-muted leading-[1.8] font-light">
                      {v.body}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mt-24 border border-vg-ink/10">
            {[
              { value: "500+", label: "Pieces Sold" },
              { value: "100%", label: "Authentic"   },
              { value: "48h",  label: "Delivery"    },
              { value: "GH",   label: "Based"       },
            ].map((s, i) => (
              <div
                key={s.label}
                className="flex flex-col items-center justify-center py-10 px-4 gap-2 border-r border-vg-ink/10 last:border-r-0"
              >
                <span className="font-serif text-5xl text-vg-ink" style={{ fontWeight: 300 }}>{s.value}</span>
                <span className="font-sans text-[9px] tracking-[0.35em] uppercase text-vg-ink/30 font-light">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 2. Dark editorial banner (like Majlis emerald atelier section) ── */}
      <div className="relative bg-vg-black py-36 px-6 overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='40' cy='40' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Vertical accent lines */}
        <div className="absolute left-1/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.05]" />
        <div className="absolute left-3/4 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white to-transparent opacity-[0.05]" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <p className="font-sans text-[10px] tracking-[0.5em] uppercase text-white/30 font-light mb-8">
            Custom Studio
          </p>
          <h2
            className="font-serif text-[clamp(2.5rem,6vw,5rem)] text-white leading-[1.0] mb-10"
            style={{ fontWeight: 300 }}
          >
            A piece made
            <br />
            for <em style={{ fontStyle: "italic", fontWeight: 400 }}>you alone.</em>
          </h2>
          <p className="font-sans text-[15px] text-white/40 font-light leading-[1.85] max-w-lg mx-auto mb-12">
            Our custom studio lets you design your own VG piece from scratch — choose your cut, colour, and graphic. Every custom order is one-of-one.
          </p>
          <a
            href="/customize"
            className="btn-outline"
          >
            Open the Studio
          </a>
        </div>
      </div>

      {/* ── 3. Light process section (like Majlis cream process section) ── */}
      <div className="bg-vg-cream py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-sans text-[10px] tracking-[0.45em] uppercase text-vg-ink/35 font-light mb-4">
              The Process
            </p>
            <h2
              className="font-serif text-[clamp(2rem,4vw,3.5rem)] text-vg-ink leading-[1.05]"
              style={{ fontWeight: 400 }}
            >
              How a VG piece is born
            </h2>
          </div>

          <div ref={processRef} className="grid grid-cols-1 md:grid-cols-4 gap-0 border-t border-vg-ink/10">
            {PROCESS.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 30 }}
                animate={processInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                className={`p-8 text-center md:text-left ${i < 3 ? "md:border-r border-vg-ink/10" : ""}`}
              >
                <p
                  className="font-serif text-6xl text-vg-ink/[0.08] mb-4 leading-none"
                  style={{ fontWeight: 300 }}
                >
                  {p.step}
                </p>
                <h3
                  className="font-serif text-2xl text-vg-ink mb-4 leading-snug"
                  style={{ fontWeight: 500 }}
                >
                  {p.title}
                </h3>
                <p className="font-sans text-[14px] text-vg-ink-muted font-light leading-[1.8]">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
