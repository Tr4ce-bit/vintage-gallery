"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X } from "lucide-react";
import Logo from "@/components/Logo";
import NavbarAuth from "@/components/NavbarAuth";

const NAV_LINKS = [
  { label: "Collection", href: "/#collection" },
  { label: "Studio",     href: "/customize" },
  { label: "About",      href: "/#about" },
  { label: "Contact",    href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
            ? "bg-brand-black/90 backdrop-blur-md border-b border-brand-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            {/* Full logo on md+, mark-only on mobile */}
            <span className="hidden sm:block">
              <Logo variant="full" size={36} inverted animate />
            </span>
            <span className="sm:hidden">
              <Logo variant="mark" size={32} inverted animate />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs tracking-[0.2em] uppercase text-brand-cream/50 hover:text-brand-gold transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Auth buttons — safe whether Clerk is configured or not */}
            <NavbarAuth />

            <button className="relative text-brand-cream/60 hover:text-brand-gold transition-colors">
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gold rounded-full text-[9px] text-brand-black font-bold flex items-center justify-center">
                0
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-brand-cream/60 hover:text-brand-gold transition-colors"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 z-40 bg-brand-black/95 backdrop-blur-md border-b border-brand-border md:hidden"
          >
            <nav className="flex flex-col py-6 px-6 gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm tracking-[0.2em] uppercase text-brand-cream/70 hover:text-brand-gold transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex gap-4 pt-2 border-t border-brand-border">
                <NavbarAuth mobile />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
