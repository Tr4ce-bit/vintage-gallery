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
        transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-vg-black/95 backdrop-blur-md border-b border-vg-border"
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
                className="object-contain brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity duration-300"
              />
            </div>
            <span className="hidden sm:block font-serif text-white text-base tracking-wide font-light group-hover:text-vg-cream transition-colors duration-200" style={{ letterSpacing: "0.1em" }}>
              Vintage Gallery
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-sans text-[10px] tracking-[0.28em] uppercase text-white/35 hover:text-white transition-colors duration-200 font-light white-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <NavbarAuth />

            <button className="relative text-white/35 hover:text-white transition-colors duration-200">
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full font-sans text-[8px] text-vg-ink font-medium flex items-center justify-center">
                0
              </span>
            </button>

            <button
              className="md:hidden text-white/35 hover:text-white transition-colors"
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
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-x-0 top-16 z-40 bg-vg-black border-b border-vg-border md:hidden"
          >
            <nav className="flex flex-col py-8 px-6 gap-7">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-sm tracking-[0.25em] uppercase text-white/45 hover:text-white transition-colors font-light"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-4 pt-4 border-t border-vg-border">
                <NavbarAuth mobile />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
