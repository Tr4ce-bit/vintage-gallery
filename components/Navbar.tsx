"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import NavbarAuth from "@/components/NavbarAuth";

const NAV_LINKS = [
  { label: "Collection", href: "/#collection" },
  { label: "Studio",     href: "/customize" },
  { label: "About",      href: "/#about" },
  { label: "Contact",    href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [menuOpen, setMenuOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-brand-black/95 backdrop-blur-md border-b border-brand-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src="/asset/logo.png"
                alt="Vintage Gallery"
                fill
                className="object-contain brightness-0 invert"
                priority
              />
            </div>
            <span className="hidden sm:block font-heading text-white text-sm tracking-[0.3em] uppercase font-bold group-hover:text-brand-gray-light transition-colors duration-200">
              Vintage Gallery
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[10px] tracking-[0.25em] uppercase text-white/40 hover:text-white transition-colors duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-5">
            <NavbarAuth />

            {/* Cart */}
            <button className="relative text-white/40 hover:text-white transition-colors duration-200">
              <ShoppingBag size={19} />
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full text-[8px] text-brand-black font-bold flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-white/40 hover:text-white transition-colors"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 top-16 z-40 bg-brand-black border-b border-brand-border md:hidden"
          >
            <nav className="flex flex-col py-8 px-6 gap-7">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-4 pt-4 border-t border-brand-border">
                <NavbarAuth mobile />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
