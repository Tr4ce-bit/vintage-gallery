"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: "-10%" });
  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="bg-vg-ink rounded-3xl px-10 py-16 md:py-20 text-center relative overflow-hidden"
        >
          {/* Subtle texture */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />

          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 font-sans text-[9px] tracking-[0.3em] uppercase text-white/50 font-light mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
              Inner Circle
            </span>

            <h2
              className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[1.0] mb-6"
              style={{ fontWeight: 300 }}
            >
              First Access.
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>Every Drop.</em>
            </h2>

            <p className="font-sans text-[15px] text-white/35 font-light leading-[1.85] max-w-md mx-auto mb-10">
              Get early access to limited drops, insider previews, and members-only pricing.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-3 text-white"
              >
                <CheckCircle size={18} />
                <span className="font-sans text-sm tracking-[0.2em] uppercase font-light">You&apos;re on the list.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 bg-white/10 border border-white/15 rounded-full px-6 py-3.5 font-sans text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/35 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-pill-white disabled:opacity-50 shrink-0"
                >
                  {loading
                    ? <span className="w-4 h-4 border-2 border-vg-ink/20 border-t-vg-ink rounded-full animate-spin" />
                    : <><span>Subscribe</span><ArrowRight size={13} /></>
                  }
                </button>
              </form>
            )}

            <p className="font-sans text-[9px] tracking-wider text-white/15 mt-5 uppercase font-light">
              Unsubscribe anytime · No spam · Members only
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
