"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Instagram, Twitter, Youtube, MessageCircle, ArrowUpRight } from "lucide-react";

const LINKS = {
  Shop: [
    { label: "New Arrivals",   href: "#collection" },
    { label: "HOPE Collection",href: "#collection" },
    { label: "Icons Series",   href: "#collection" },
    { label: "Limited Drops",  href: "#collection" },
    { label: "Custom Studio",  href: "/customize"  },
  ],
  Brand: [
    { label: "Our Story",      href: "#about" },
    { label: "Drop Schedule",  href: "#"      },
    { label: "Lookbook",       href: "#"      },
    { label: "Collabs",        href: "#"      },
  ],
  Help: [
    { label: "Sizing Guide",   href: "#" },
    { label: "Shipping",       href: "#" },
    { label: "Returns",        href: "#" },
    { label: "Contact",        href: "#contact" },
    { label: "FAQs",           href: "#" },
  ],
};

const SOCIALS = [
  { icon: Instagram,     href: "#", label: "Instagram" },
  { icon: Twitter,       href: "#", label: "Twitter" },
  { icon: Youtube,       href: "#", label: "YouTube" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
];

export default function Footer() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });
  const year   = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-white border-t border-zinc-100">
      <div ref={ref} className="max-w-7xl mx-auto px-5 md:px-8 pt-16 pb-10">

        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-14">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="mb-5 flex flex-col items-start leading-none">
              <span
                className="font-serif text-zinc-900"
                style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "0.08em" }}
              >
                VG
              </span>
              <span
                className="font-serif text-zinc-400"
                style={{ fontSize: "0.46rem", fontWeight: 600, letterSpacing: "0.38em", textTransform: "uppercase", marginTop: "2px" }}
              >
                Vintage Gallery
              </span>
            </div>

            <p className="font-sans text-sm text-zinc-400 font-light leading-[1.75] max-w-xs mb-7">
              Ghana&apos;s premier streetwear destination. Curated drops, premium quality, delivered across Accra and beyond.
            </p>

            <div className="flex items-center gap-2 mb-8">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-full border border-zinc-100 flex items-center justify-center text-zinc-300 hover:text-zinc-900 hover:border-zinc-200 transition-all duration-200"
                >
                  <Icon size={14} strokeWidth={1.5} />
                </a>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {["MTN MoMo", "Telecel", "AirtelTigo", "Paystack"].map(m => (
                <span key={m} className="font-sans text-[8px] tracking-[0.2em] uppercase text-zinc-300 border border-zinc-100 px-2.5 py-1.5 rounded-full font-light">
                  {m}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, links], col) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 + col * 0.07 }}
            >
              <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-300 font-medium mb-5">{section}</p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group font-sans text-[13px] text-zinc-400 font-light hover:text-zinc-900 transition-colors duration-150 flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight size={9} className="opacity-0 group-hover:opacity-40 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-100 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] text-zinc-300 font-light">
            © {year} Vintage Gallery Store. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Cookies"].map(item => (
              <a key={item} href="#" className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-300 hover:text-zinc-600 transition-colors font-light">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
