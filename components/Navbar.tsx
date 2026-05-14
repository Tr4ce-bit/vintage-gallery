"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import NavbarAuth from "@/components/NavbarAuth";

const NAV_LINKS = [
  { label: "Collection", href: "/#collection" },
  { label: "Studio",     href: "/customize"   },
  { label: "About",      href: "/#about"      },
  { label: "Contact",    href: "/#contact"    },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-vg-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-7 h-7 shrink-0">
              <Image
                src="/asset/logo.png"
                alt="Vintage Gallery"
                fill
                priority
                className={`object-contain transition-all duration-300 ${scrolled ? "" : "brightness-0 invert"}`}
              />
            </div>
            <span className={`hidden sm:block font-serif text-base font-light tracking-wider transition-colors duration-300 ${scrolled ? "text-vg-ink" : "text-white"}`}>
              Vintage Gallery
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[10px] tracking-[0.25em] uppercase font-light transition-colors duration-200 ${
                  scrolled ? "text-vg-ink/40 hover:text-vg-ink" : "text-white/50 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <NavbarAuth scrolled={scrolled} />

            {/* Cart */}
            <button className={`relative transition-colors duration-200 ${scrolled ? "text-vg-ink/40 hover:text-vg-ink" : "text-white/50 hover:text-white"}`}>
              <ShoppingBag size={19} strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-vg-ink rounded-full font-sans text-[8px] text-white font-medium flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile */}
            <button
              className={`md:hidden transition-colors ${scrolled ? "text-vg-ink/50 hover:text-vg-ink" : "text-white/50 hover:text-white"}`}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-vg-border shadow-lg md:hidden"
          >
            <nav className="flex flex-col py-8 px-6 gap-6">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-sm tracking-[0.2em] uppercase text-vg-ink/50 hover:text-vg-ink transition-colors font-light"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-4 pt-4 border-t border-vg-border">
                <NavbarAuth mobile scrolled />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
