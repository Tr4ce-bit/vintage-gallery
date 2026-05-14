"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const PILLARS = [
  { n: "01", title: "Premium Quality",  body: "Every piece handpicked — for weight, drape, and longevity. No shortcuts, ever." },
  { n: "02", title: "Ghana-Born",        body: "Rooted in Accra's energy. Every design decision reflects our culture." },
  { n: "03", title: "Limited Drops",     body: "Controlled quantities. Rarity is respect for the craft — not a gimmick." },
  { n: "04", title: "100% Authentic",    body: "Every item verified. Every tag traceable. Your trust is everything." },
];

export default function About() {
  const s1Ref = useRef(null);
  const s1    = useInView(s1Ref, { once: true, margin: "-10%" });

  const s2Ref = useRef(null);
  const s2    = useInView(s2Ref, { once: true, margin: "-10%" });

  return (
    <section id="about">

      {/* ── 1. Off-white story block ── */}
      <div className="bg-zinc-50 py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div ref={s1Ref} className="grid lg:grid-cols-2 gap-16 items-center">

            {/* Left text */}
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={s1 ? { opacity: 1 } : {}}
                className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-300 font-light mb-6"
              >
                Our Story
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={s1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.1 }}
                className="font-serif text-zinc-900 leading-[1.0] mb-8"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", fontWeight: 300 }}
              >
                Woven from
                <br />
                the streets of
                <br />
                <em style={{ fontStyle: "italic", fontWeight: 400 }}>Accra.</em>
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={s1 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.28 }}
                className="space-y-5 font-sans text-[15px] text-zinc-500 font-light leading-[1.85] max-w-md"
              >
                <p>
                  Vintage Gallery was born from a simple belief: Ghanaian streetwear should carry the weight of our culture — the noise of Accra, the elegance of our heritage, the ambition of our generation.
                </p>
                <p>
                  We don&apos;t do fast fashion. Every piece is deliberately curated, limited in quantity, and built to outlast trends. When you wear VG, you wear a statement.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={s1 ? { opacity: 1 } : {}}
                transition={{ delay: 0.45 }}
                className="mt-10"
              >
                <div className="w-10 h-px bg-zinc-200 mb-5" />
                <p className="font-serif text-2xl text-zinc-700 italic" style={{ fontWeight: 400 }}>
                  &ldquo;Wear less. Mean more.&rdquo;
                </p>
                <p className="font-sans text-[9px] tracking-[0.3em] uppercase text-zinc-300 mt-3 font-light">
                  — Vintage Gallery, Accra · Est. 2022
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={s1 ? { opacity: 1 } : {}}
                transition={{ delay: 0.55 }}
                className="mt-10"
              >
                <Link
                  href="#collection"
                  className="inline-flex items-center gap-2.5 bg-zinc-900 text-white font-sans font-medium text-[10px] tracking-[0.18em] uppercase px-7 py-3.5 rounded-full hover:bg-zinc-700 transition-colors group"
                >
                  Shop the Collection
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            </div>

            {/* Right — photo collage */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={s1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.85, delay: 0.2 }}
              className="relative grid grid-cols-2 gap-3"
            >
              {/* Large card — HOPE tee */}
              <div className="col-span-2 relative rounded-2xl overflow-hidden aspect-[16/9] bg-zinc-200">
                <Image src="/asset/product-hope.jpg" alt="HOPE Tee" fill className="object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <span className="font-sans text-[8px] tracking-[0.3em] uppercase text-white/60 font-light">HOPE Collection</span>
                </div>
              </div>

              {/* Two smaller cards */}
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-zinc-200">
                <Image src="/asset/product-beyourself.jpg" alt="Be Yourself" fill className="object-cover object-center" />
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-zinc-200">
                <Image src="/asset/product-tupac.jpg" alt="Tupac Tee" fill className="object-cover object-center" />
              </div>

              {/* Floating stat */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-5 right-4 bg-white rounded-2xl px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
              >
                <p className="font-serif text-2xl text-zinc-900" style={{ fontWeight: 300 }}>500+</p>
                <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-zinc-300 font-light mt-0.5">Pieces Sold</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── 2. Dark principles block ── */}
      <div className="bg-zinc-950 py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div ref={s2Ref} className="mb-14">
            <motion.p
              initial={{ opacity: 0 }}
              animate={s2 ? { opacity: 1 } : {}}
              className="font-sans text-[9px] tracking-[0.4em] uppercase text-zinc-600 font-light mb-4"
            >
              Why VG
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              animate={s2 ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-serif text-white"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 4rem)", fontWeight: 300 }}
            >
              Built on Principles.
            </motion.h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p, i) => (
              <motion.div
                key={p.n}
                initial={{ opacity: 0, y: 20 }}
                animate={s2 ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.09 }}
                className="rounded-2xl bg-zinc-900 p-7 hover:bg-zinc-800 transition-colors duration-300 group"
              >
                <span className="font-serif text-[3.5rem] text-zinc-800 leading-none block mb-6 group-hover:text-zinc-700 transition-colors" style={{ fontWeight: 300 }}>
                  {p.n}
                </span>
                <h3 className="font-serif text-white text-xl mb-3" style={{ fontWeight: 400 }}>{p.title}</h3>
                <p className="font-sans text-zinc-500 text-[13px] font-light leading-[1.8]">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Process — white ── */}
      <div className="bg-white py-20 px-5 md:px-8 border-b border-zinc-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
            {[
              { step: "01", title: "Source",  desc: "Premium fabrics selected by hand from trusted suppliers." },
              { step: "02", title: "Design",  desc: "Graphics crafted to make a statement on the street." },
              { step: "03", title: "Produce", desc: "Limited runs, quality-checked at every stage." },
              { step: "04", title: "Drop",    desc: "Members get first access. Right piece, right person." },
            ].map((p, i) => (
              <div key={p.step} className={`py-10 px-8 ${i < 3 ? "border-r border-zinc-100" : ""} border-t border-zinc-100 group hover:bg-zinc-50 transition-colors`}>
                <p className="font-serif text-[3rem] text-zinc-100 mb-5 leading-none group-hover:text-zinc-200 transition-colors" style={{ fontWeight: 300 }}>{p.step}</p>
                <h3 className="font-serif text-zinc-900 text-xl mb-3" style={{ fontWeight: 400 }}>{p.title}</h3>
                <p className="font-sans text-zinc-400 text-[13px] font-light leading-[1.8]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
