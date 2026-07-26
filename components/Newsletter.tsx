"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Newsletter() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const [email, setEmail]         = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, source: "newsletter" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-zinc-950 py-16 px-5 md:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.65 }}
          className="rounded-3xl bg-zinc-950 px-8 md:px-16 py-16 md:py-20 relative overflow-hidden"
        >
          {/* Decorative product image blurred in background */}
          <div className="absolute right-0 top-0 bottom-0 w-[45%] opacity-[0.06] overflow-hidden rounded-r-3xl hidden lg:block">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img src="/asset/product-hope.jpg" alt="" className="w-full h-full object-cover" />
            </motion.div>
          </div>

          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 bg-white/8 rounded-full px-4 py-2 font-sans text-[9px] tracking-[0.3em] uppercase text-white/40 font-light mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
              Inner Circle
            </span>

            <h2
              className="font-serif text-white leading-[1.0] mb-6"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", fontWeight: 300 }}
            >
              First Access.
              <br />
              <em style={{ fontStyle: "italic", fontWeight: 400 }}>Every Drop.</em>
            </h2>

            <p className="font-sans text-base text-zinc-400 font-light leading-relaxed mb-10 max-w-sm">
              Get early access to drops, members-only pricing, and behind-the-scenes previews before anyone else.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 text-white"
              >
                <CheckCircle size={18} />
                <span className="font-sans text-sm tracking-[0.15em] uppercase font-light">You&apos;re on the list.</span>
              </motion.div>
            ) : (
              <div className="max-w-md">
                <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 min-w-0 bg-white/8 border border-white/10 rounded-full px-5 py-3.5 font-sans text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/20 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-white text-zinc-900 font-sans font-medium text-[10px] tracking-[0.15em] uppercase px-6 py-3.5 rounded-full hover:bg-zinc-100 transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <span className="w-4 h-4 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
                      : <><span>Subscribe</span><ArrowRight size={12} /></>
                    }
                  </button>
                </form>
                {error && (
                  <p className="mt-3 font-sans text-xs text-red-300/80 font-light">{error}</p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
