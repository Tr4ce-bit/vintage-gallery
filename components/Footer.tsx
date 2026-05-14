"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Instagram, Twitter, Youtube, MessageCircle, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const LINKS = {
  Shop: [
    { label: "New Arrivals",   href: "#collection" },
    { label: "Tees",           href: "#collection" },
    { label: "Hoodies",        href: "#collection" },
    { label: "Limited Drops",  href: "#collection" },
    { label: "Custom Studio",  href: "/customize"  },
  ],
  Brand: [
    { label: "Our Story",      href: "#about"   },
    { label: "Drop Schedule",  href: "#"        },
    { label: "Lookbook",       href: "#"        },
    { label: "Collabs",        href: "#"        },
  ],
  Help: [
    { label: "Sizing Guide",   href: "#" },
    { label: "Shipping & GH Post", href: "#" },
    { label: "Returns",        href: "#" },
    { label: "Contact Us",     href: "#contact" },
    { label: "FAQs",           href: "#" },
  ],
};

const SOCIALS = [
  { icon: Instagram,      href: "#", label: "Instagram" },
  { icon: Twitter,        href: "#", label: "X / Twitter" },
  { icon: Youtube,        href: "#", label: "YouTube" },
  { icon: MessageCircle,  href: "#", label: "WhatsApp" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Footer() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="relative bg-brand-surface border-t border-brand-border">

      {/* Top glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-gold/25 to-transparent" />

      <div ref={ref} className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              {/* Logo */}
              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-10 h-10">
                  <Image
                    src="/asset/logo.png"
                    alt="VG"
                    fill
                    className="object-contain brightness-0 invert"
                    onError={() => {}}
                  />
                </div>
                <div>
                  <p className="font-heading text-brand-cream font-bold text-lg leading-none">Vintage Gallery</p>
                  <p className="text-[9px] tracking-[0.35em] uppercase text-brand-gold/60 mt-0.5">Premium Streetwear</p>
                </div>
              </div>

              <p className="text-brand-cream/40 text-sm leading-relaxed mb-8 max-w-sm">
                Ghana&apos;s premier streetwear destination. Curated drops, premium quality, delivered across Accra and beyond.
              </p>

              {/* Contact info */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: MapPin,  text: "Accra, Ghana" },
                  { icon: Phone,   text: "+233 000 000 000" },
                  { icon: Mail,    text: "hello@vintagegallery.gh" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3">
                    <Icon size={13} className="text-brand-gold/60 shrink-0" />
                    <span className="text-xs text-brand-cream/40 tracking-wide">{text}</span>
                  </div>
                ))}
              </div>

              {/* Socials */}
              <div className="flex items-center gap-3">
                {SOCIALS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-9 h-9 border border-brand-border flex items-center justify-center text-brand-cream/30 hover:text-brand-gold hover:border-brand-gold/40 transition-all duration-200"
                  >
                    <Icon size={14} />
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links], colIdx) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + colIdx * 0.08 }}
            >
              <p className="text-[10px] tracking-[0.35em] uppercase text-brand-gold mb-6 font-medium">{section}</p>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-cream/40 hover:text-brand-gold transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-60 transition-opacity -translate-y-px" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Payment methods */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-brand-border pt-10 mb-10"
        >
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[9px] tracking-[0.35em] uppercase text-brand-cream/20 mr-2">Accepted Payments</span>
            {["MTN MoMo", "Telecel Cash", "AirtelTigo Money", "Paystack"].map(method => (
              <div
                key={method}
                className="px-3 py-1.5 border border-brand-border text-[9px] tracking-[0.2em] uppercase text-brand-cream/30"
              >
                {method}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border pt-8"
        >
          <p className="text-[11px] text-brand-cream/20 tracking-wider">
            © {year} Vintage Gallery Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <a
                key={item}
                href="#"
                className="text-[10px] tracking-[0.2em] uppercase text-brand-cream/20 hover:text-brand-gold/60 transition-colors duration-200"
              >
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
