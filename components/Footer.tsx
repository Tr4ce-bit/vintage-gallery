"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { Instagram, Twitter, Youtube, MessageCircle, MapPin, Phone, Mail, ArrowUpRight } from "lucide-react";

const LINKS = {
  Shop: [
    { label: "New Arrivals",       href: "#collection" },
    { label: "Icons Series",       href: "#collection" },
    { label: "Urban Series",       href: "#collection" },
    { label: "Limited Drops",      href: "#collection" },
    { label: "Custom Studio",      href: "/customize"  },
  ],
  Brand: [
    { label: "Our Story",          href: "#about"  },
    { label: "Drop Schedule",      href: "#"       },
    { label: "Lookbook",           href: "#"       },
    { label: "Collabs",            href: "#"       },
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
    /* Light footer — white with black text */
    <footer id="contact" className="bg-white border-t border-vg-border-light">
      <div ref={ref} className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-9 h-9 shrink-0">
                <Image src="/asset/logo.png" alt="VG" fill className="object-contain" />
              </div>
              <div>
                <p className="font-serif text-vg-ink text-lg leading-none" style={{ fontWeight: 400 }}>Vintage Gallery</p>
                <p className="font-sans text-[8px] tracking-[0.35em] uppercase text-vg-ink/30 font-light mt-0.5">Premium Streetwear</p>
              </div>
            </div>

            <p className="font-sans text-[14px] text-vg-ink-muted/50 leading-[1.8] font-light mb-8 max-w-xs">
              Ghana&apos;s premier streetwear destination. Curated drops, premium quality, delivered across Accra and beyond.
            </p>

            <div className="space-y-3 mb-8">
              {[
                { icon: MapPin, text: "Accra, Ghana" },
                { icon: Phone,  text: "+233 000 000 000" },
                { icon: Mail,   text: "hello@vintagegallery.gh" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon size={12} className="text-vg-ink/20 shrink-0" />
                  <span className="font-sans text-[12px] text-vg-ink/30 font-light">{text}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 border border-vg-border-light flex items-center justify-center text-vg-ink/20 hover:text-vg-ink hover:border-vg-ink/25 transition-all duration-200"
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
              <p className="font-sans text-[9px] tracking-[0.35em] uppercase text-vg-ink/30 font-medium mb-6">{section}</p>
              <ul className="space-y-3.5">
                {links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group font-sans text-[13px] text-vg-ink/30 font-light hover:text-vg-ink transition-colors duration-200 flex items-center gap-1"
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

        {/* Payments */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-vg-border-light pt-10 mb-10"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-sans text-[8px] tracking-[0.35em] uppercase text-vg-ink/20 font-light mr-2">Accepted Payments</span>
            {["MTN MoMo", "Telecel Cash", "AirtelTigo", "Paystack"].map(m => (
              <div key={m} className="px-3 py-1.5 border border-vg-border-light font-sans text-[8px] tracking-[0.2em] uppercase text-vg-ink/25 font-light">
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
          className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-vg-border-light pt-8"
        >
          <p className="font-sans text-[10px] text-vg-ink/20 font-light tracking-wider">
            © {year} Vintage Gallery Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(item => (
              <a key={item} href="#" className="font-sans text-[9px] tracking-[0.2em] uppercase text-vg-ink/20 hover:text-vg-ink/50 transition-colors font-light">
                {item}
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
