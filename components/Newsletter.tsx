"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="relative py-24 md:py-36 overflow-hidden bg-brand-black">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(201,168,76,0.06)_0%,transparent_100%)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent" />
      </div>

      <div ref={ref} className="max-w-3xl mx-auto px-6 text-center relative">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center justify-center w-16 h-16 border border-brand-gold/30 mb-8 mx-auto"
        >
          <Sparkles size={24} className="text-brand-gold" />
        </motion.div>

        {/* Headline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[10px] tracking-[0.4em] uppercase text-brand-gold mb-4"
        >
          Join the Inner Circle
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-heading text-4xl md:text-5xl text-brand-cream mb-5"
        >
          First Access.<br />Every Drop.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="text-brand-cream/40 text-sm mb-10 max-w-md mx-auto leading-relaxed"
        >
          Get exclusive early access to limited drops, insider previews, and member-only pricing. No spam — just the drops that matter.
        </motion.p>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.45 }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3 py-4 text-brand-gold"
            >
              <CheckCircle size={20} />
              <span className="text-sm tracking-[0.2em] uppercase font-medium">You&apos;re on the list. Watch your inbox.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-brand-surface border border-brand-border px-5 py-4 text-sm text-brand-cream placeholder-brand-cream/25 focus:outline-none focus:border-brand-gold/50 transition-colors duration-200"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-gold !rounded-none flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-brand-black/30 border-t-brand-black rounded-full animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-[10px] tracking-wider text-brand-cream/20 mt-4 uppercase">
            Unsubscribe anytime · No spam · Members only content
          </p>
        </motion.div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-12"
        >
          {["Early access to drops", "Member pricing", "Exclusive previews", "Drop alerts"].map(perk => (
            <div key={perk} className="flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-brand-gold" />
              <span className="text-[10px] tracking-[0.25em] uppercase text-brand-cream/30">{perk}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
