"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-10%" });
  const [email, setEmail]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    /* ── Inverted white block ── */
    <section className="bg-white py-24 md:py-36 px-6">
      <div ref={ref} className="max-w-3xl mx-auto text-center">

        {/* Label */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-[9px] tracking-[0.45em] uppercase text-black/30 mb-4"
        >
          Join the Inner Circle
        </motion.p>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="font-heading text-5xl md:text-6xl text-black font-black leading-none mb-6"
        >
          First Access.<br />Every Drop.
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="w-12 h-0.5 bg-black mx-auto mb-8"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-black/35 text-sm mb-10 max-w-sm mx-auto leading-relaxed"
        >
          Get exclusive early access to limited drops, insider previews, and member-only pricing.
        </motion.p>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.45 }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 text-black"
            >
              <CheckCircle size={18} />
              <span className="text-sm tracking-[0.2em] uppercase font-semibold">You&apos;re on the list.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-transparent border border-black/15 px-5 py-4 text-sm text-black placeholder-black/25 focus:outline-none focus:border-black/40 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-outline-dark !rounded-none flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  <>Subscribe <ArrowRight size={13} /></>
                )}
              </button>
            </form>
          )}

          <p className="text-[9px] tracking-wider text-black/20 mt-4 uppercase">
            Unsubscribe anytime · No spam · Members-only content
          </p>
        </motion.div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
        >
          {["Early access", "Member pricing", "Exclusive previews", "Drop alerts"].map(perk => (
            <div key={perk} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-black/40" />
              <span className="text-[9px] tracking-[0.25em] uppercase text-black/30">{perk}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
