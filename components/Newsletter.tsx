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
    /* Cream section — light, airy */
    <section className="bg-vg-cream-dark border-t border-vg-border-light py-24 md:py-32 px-6">
      <div ref={ref} className="max-w-3xl mx-auto text-center">

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="font-sans text-[10px] tracking-[0.5em] uppercase text-vg-ink/30 font-light mb-6"
        >
          Inner Circle
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.75, delay: 0.1 }}
          className="font-serif text-[clamp(3rem,6vw,5rem)] text-vg-ink leading-[1.0] mb-8"
          style={{ fontWeight: 300 }}
        >
          First Access.
          <br />
          <em style={{ fontStyle: "italic", fontWeight: 400 }}>Every Drop.</em>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="w-12 h-px bg-vg-ink/25 mx-auto mb-8 origin-left"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="font-sans text-[15px] text-vg-ink-muted/50 font-light leading-[1.85] max-w-sm mx-auto mb-12"
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
              className="inline-flex items-center gap-3 text-vg-ink"
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
                className="flex-1 bg-white border border-vg-border-light px-5 py-4 font-sans text-sm text-vg-ink placeholder-vg-ink/20 focus:outline-none focus:border-vg-ink/30 transition-colors"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary-dark !rounded-none min-w-[140px] disabled:opacity-50"
              >
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  : <><span>Subscribe</span><ArrowRight size={13} /></>
                }
              </button>
            </form>
          )}
          <p className="font-sans text-[9px] tracking-wider text-vg-ink/20 mt-5 uppercase font-light">
            Unsubscribe anytime · No spam · Members only
          </p>
        </motion.div>
      </div>
    </section>
  );
}
