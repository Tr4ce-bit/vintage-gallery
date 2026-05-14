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
    /* Dark section matching VG black — sits between About (light) and Footer (dark) */
    <section className="bg-vg-black border-t border-vg-border py-28 md:py-36 px-6 relative overflow-hidden">
      {/* Subtle pattern */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div ref={ref} className="relative max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="font-sans text-[10px] tracking-[0.5em] uppercase text-white/30 font-light mb-6"
        >
          Inner Circle
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="font-serif text-[clamp(3rem,6vw,5rem)] text-white leading-[1.0] mb-8"
          style={{ fontWeight: 300 }}
        >
          First Access.
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>Every Drop.</em>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="w-12 h-px bg-white/30 mx-auto mb-8 origin-left"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-sans text-[15px] text-white/35 font-light leading-[1.85] max-w-sm mx-auto mb-12"
        >
          Get exclusive early access to limited drops, insider previews, and members-only pricing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65, delay: 0.5 }}
        >
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-3 text-white"
            >
              <CheckCircle size={16} />
              <span className="font-sans text-sm tracking-[0.2em] uppercase font-light">You&apos;re on the list.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-0 max-w-lg mx-auto">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 bg-transparent border border-white/15 px-5 py-4 font-sans text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/35 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary !rounded-none min-w-[140px] disabled:opacity-50"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-vg-black/20 border-t-vg-black rounded-full animate-spin" />
                  : <><span>Subscribe</span><ArrowRight size={13} /></>
                }
              </button>
            </form>
          )}

          <p className="font-sans text-[9px] tracking-wider text-white/15 mt-5 uppercase font-light">
            Unsubscribe anytime · No spam · Members only
          </p>
        </motion.div>
      </div>
    </section>
  );
}
