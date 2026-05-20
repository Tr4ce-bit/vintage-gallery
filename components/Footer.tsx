"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { Instagram, MapPin, MessageCircle, ArrowUpRight } from "lucide-react";

// ── Social links ────────────────────────────────────────────────────────────
const INSTAGRAM_URL  = "https://www.instagram.com/the_vintage_gallery_store?igsh=MmMwMTJnbjQ2amlm";
const TIKTOK_URL     = "https://www.tiktok.com/@vintage_gallery_store?_r=1&_t=ZS-96WLewglP9O";
const WHATSAPP_URL   = "https://wa.me/233503662903";
const GOOGLE_MAPS_URL = "https://maps.app.goo.gl/gnpN4VfY3zStb3p58";

// ── TikTok SVG (no Lucide icon) ─────────────────────────────────────────────
function TikTokIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.3 6.3 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.53V6.77a4.85 4.85 0 0 1-1.02-.08z" />
    </svg>
  );
}

const LINKS = {
  Shop: [
    { label: "New Arrivals",    href: "/shop?filter=New+Arrivals"   },
    { label: "HOPE Collection", href: "/shop?filter=HOPE+Collection" },
    { label: "Icons Series",    href: "/shop?filter=Icons+Series"   },
    { label: "Limited Drops",   href: "/shop?filter=Limited+Drops"  },
    { label: "Custom Studio",   href: "/customize"                  },
  ],
  Brand: [
    { label: "Our Story",       href: "/#about"        },
    { label: "Drop Schedule",   href: "/drop-schedule" },
    { label: "Lookbook",        href: "/lookbook"      },
    { label: "Collabs",         href: "/collabs"       },
  ],
  Help: [
    { label: "Sizing Guide",    href: "/sizing-guide" },
    { label: "Shipping",        href: "/shipping"     },
    { label: "Returns",         href: "/returns"      },
    { label: "Contact",         href: "/#contact"     },
    { label: "FAQs",            href: "/faq"          },
  ],
};

const SOCIALS = [
  {
    label: "Instagram",
    href:  INSTAGRAM_URL,
    Icon:  ({ size }: { size: number }) => <Instagram size={size} strokeWidth={1.5} />,
  },
  {
    label: "TikTok",
    href:  TIKTOK_URL,
    Icon:  ({ size }: { size: number }) => <TikTokIcon size={size} />,
  },
  {
    label: "WhatsApp",
    href:  WHATSAPP_URL,
    Icon:  ({ size }: { size: number }) => <MessageCircle size={size} strokeWidth={1.5} />,
  },
  {
    label: "Find us on Google Maps",
    href:  GOOGLE_MAPS_URL,
    Icon:  ({ size }: { size: number }) => <MapPin size={size} strokeWidth={1.5} />,
  },
];

export default function Footer() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });
  const year   = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800">
      <div ref={ref} className="max-w-7xl mx-auto px-5 md:px-8 pt-16 pb-10">

        {/* Top row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-14">

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            <div className="mb-5 flex flex-col items-start leading-none">
              <span
                className="font-serif text-zinc-900 dark:text-zinc-100"
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

            <p className="font-sans text-sm text-zinc-500 dark:text-zinc-400 font-light leading-[1.75] max-w-xs mb-7">
              Ghana&apos;s premier streetwear destination. Curated drops, premium quality, delivered across Accra and beyond.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mb-5">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-500 transition-all duration-200"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>

            {/* WhatsApp text CTA */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8 group"
            >
              <MessageCircle size={11} strokeWidth={1.5} />
              Chat with us on WhatsApp
              <ArrowUpRight size={9} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </a>

            {/* Find us */}
            <a
              href={GOOGLE_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-sans text-[10px] tracking-[0.1em] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors mb-8 group"
            >
              <MapPin size={11} strokeWidth={1.5} />
              <span>Find us on Google Maps</span>
              <ArrowUpRight size={9} className="opacity-0 group-hover:opacity-50 transition-opacity" />
            </a>

            {/* Payment methods */}
            <div className="flex flex-wrap gap-2">
              {["MTN MoMo", "Telecel", "AirtelTigo", "Paystack"].map(m => (
                <span key={m} className="font-sans text-[8px] tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-500 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1.5 rounded-full font-light">
                  {m}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Nav link columns */}
          {Object.entries(LINKS).map(([section, links], col) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.08 + col * 0.07 }}
            >
              <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-zinc-400 dark:text-zinc-500 font-medium mb-5">{section}</p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group font-sans text-[13px] text-zinc-500 dark:text-zinc-400 font-light hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-150 flex items-center gap-1"
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
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-7 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-sans text-[11px] text-zinc-400 dark:text-zinc-500 font-light">
            © {year} Vintage Gallery Store. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms"   },
              { label: "Cookies", href: "/cookies" },
            ].map(item => (
              <Link key={item.label} href={item.href} className="font-sans text-[10px] tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors font-light">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
