"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Instagram, Twitter, Youtube, MessageCircle, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

const LINKS = {
  Shop: [
    { label: "New Arrivals",       href: "#collection" },
    { label: "Tees",               href: "#collection" },
    { label: "Hoodies",            href: "#collection" },
    { label: "Limited Drops",      href: "#collection" },
    { label: "Custom Studio",      href: "/customize"  },
  ],
  Brand: [
    { label: "Our Story",          href: "#about" },
    { label: "Drop Schedule",      href: "#"      },
    { label: "Lookbook",           href: "#"      },
    { label: "Collabs",            href: "#"      },
  ],
  Help: [
    { label: "Sizing Guide",       href: "#" },
    { label: "Shipping & GH Post", href: "#" },
    { label: "Returns",            href: "#" },
    { label: "Contact Us",         href: "#contact" },
    { label: "FAQs",               href: "#" },
  ],
};

const SOCIALS = [
  { icon: Instagram,     href: "#", label: "Instagram" },
  { icon: Twitter,       href: "#", label: "X / Twitter" },
  { icon: Youtube,       href: "#", label: "YouTube" },
  { icon: MessageCircle, href: "#", label: "WhatsApp" },
];

export default function Footer() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });
  const year   = new Date().getFullYear();

  return (
    <footer id="contact" className="bg-brand-black border-t border-brand-border">
      <div ref={ref} className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2"
          >
            {/* Logo */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src="/asset/logo.png"
                  alt="VG"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div>
                <p className="font-heading text-white font-bold text-base tracking-wide">Vintage Gallery</p>
                <p className="text-[8px] tracking-[0.35em] uppercase text-white/25 mt-0.5">Premium Streetwear</p>
              </div>
            </div>

            <p className="text-white/30 text-sm leading-relaxed mb-8 max-w-xs">
              Ghana&apos;s premier streetwear destination. Curated drops, premium quality, delivered across Accra and beyond.
            </p>

            {/* Contact */}
            <div className="space-y-3 mb-8">
              {[
                { icon: MapPin, text: "Accra, Ghana" },
                { icon: Phone,  text: "+233 000 000 000" },
                { icon: Mail,   text: "hello@vintagegallery.gh" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={12} className="text-white/25 shrink-0" />
                  <span className="text-xs text-white/30 tracking-wide">{text}</span>
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 border border-brand-border flex items-center justify-center text-white/25 hover:text-white hover:border-white/30 transition-all duration-200"
                >
                  <Icon size={13} />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([section, links], colIdx) => (
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 + colIdx * 0.08 }}
            >
              <p className="text-[9px] tracking-[0.35em] uppercase text-white/30 mb-6 font-medium">{section}</p>
              <ul className="space-y-3.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group text-sm text-white/25 hover:text-white transition-colors duration-200 flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-50 transition-opacity -translate-y-px" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Payments */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-brand-border pt-10 mb-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[8px] tracking-[0.35em] uppercase text-white/15 mr-2">Payments</span>
            {["MTN MoMo", "Telecel Cash", "AirtelTigo", "Paystack"].map(m => (
              <div
                key={m}
                className="px-3 py-1.5 border border-brand-border text-[8px] tracking-[0.2em] uppercase text-white/20"
              >
                {m}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-brand-border pt-8"
        >
          <p className="text-[10px] text-white/15 tracking-wider">
            © {year} Vintage Gallery Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <a
                key={item}
                href="#"
                className="text-[9px] tracking-[0.2em] uppercase text-white/15 hover:text-white/40 transition-colors"
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
