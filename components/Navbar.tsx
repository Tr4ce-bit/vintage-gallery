"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, X } from "lucide-react";
import NavbarAuth from "@/components/NavbarAuth";
import { useCartStore } from "@/lib/store";
import ThemeToggle from "@/components/ThemeToggle";

const NAV_LINKS = [
  { label: "Shop",        href: "/shop"      },
  { label: "Studio",      href: "/customize" },
  { label: "Track Order", href: "/track"     },
  { label: "About",       href: "/#about"   },
  { label: "Contact",     href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const pathname   = usePathname();

  // Only use transparent/dark-mode navbar on the homepage hero
  const isHomepage = pathname === "/";

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    // On non-home pages start as scrolled (white navbar immediately)
    if (!isHomepage) setScrolled(true);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, [isHomepage]);

  const onDark = isHomepage && !scrolled;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-400 ${
          scrolled
            ? "bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-800 shadow-[0_1px_12px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        {/*
          Three-zone grid so the logo is optically centred in the viewport.
          A flex row with justify-between would centre it between its
          neighbours instead, which drifts as the nav and action widths change
          (e.g. when the cart badge appears). Equal 1fr side columns keep the
          centre column fixed regardless.
        */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[60px] grid grid-cols-[1fr_auto_1fr] items-center gap-3">

          {/* Left — navigation (desktop) / menu button (mobile) */}
          <div className="flex items-center justify-start gap-7 min-w-0">
            <button
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              className={`md:hidden transition-colors ${onDark ? "text-white/55 hover:text-white" : "text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"}`}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={19} strokeWidth={1.5} /> : <Menu size={19} strokeWidth={1.5} />}
            </button>

            <nav className="hidden md:flex items-center gap-7">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`font-sans text-[10px] tracking-[0.22em] uppercase font-light whitespace-nowrap transition-colors duration-200 ${
                    onDark
                      ? "text-white/55 hover:text-white"
                      : "text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Centre — logo */}
          <Link href="/" aria-label="Vintage Gallery — home" className="justify-self-center shrink-0">
            <Image
              src="https://vintage-gallery-products.s3.amazonaws.com/branding/logo-transparent.png"
              alt="Vintage Gallery"
              width={48}
              height={48}
              priority
              className="object-contain transition-all duration-300"
              style={{
                filter: onDark ? "brightness(0) invert(1)" : "none",
              }}
            />
          </Link>

          {/* Right — account, theme, cart */}
          <div className="flex items-center justify-end gap-4 min-w-0">
            <div className="hidden sm:block">
              <NavbarAuth onDark={onDark} />
            </div>

            <ThemeToggle />

            <Link
              href="/cart"
              aria-label={cartCount > 0 ? `Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}` : "Cart"}
              className={`relative shrink-0 transition-colors duration-200 ${onDark ? "text-white/55 hover:text-white" : "text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"}`}
            >
              <ShoppingCart size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1.5 w-[15px] h-[15px] rounded-full text-[7px] font-medium flex items-center justify-center ${onDark ? "bg-white text-zinc-900" : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900"}`}>
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-[60px] z-40 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 shadow-lg md:hidden"
          >
            <nav className="flex flex-col py-6 px-6 gap-5">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="font-sans text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors font-light"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/track"
                onClick={() => setMenuOpen(false)}
                className="font-sans text-[11px] tracking-[0.22em] uppercase text-zinc-500 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-white transition-colors font-light"
              >
                Track Order
              </Link>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <NavbarAuth mobile onDark={false} onClose={() => setMenuOpen(false)} />
                <div className="flex items-center gap-3">
                  <span className="font-sans text-[11px] tracking-[0.15em] uppercase text-zinc-500 dark:text-zinc-300 font-light">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
