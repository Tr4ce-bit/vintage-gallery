"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Menu, X, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import NavbarAuth from "@/components/NavbarAuth";
import { useCartStore } from "@/lib/store";

const NAV_LINKS = [
  { label: "Shop",    href: "/shop"      },
  { label: "Studio",  href: "/customize" },
  { label: "About",   href: "/#about"   },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted,  setMounted]  = useState(false);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const pathname   = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

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
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between">

          {/* Logo — transparent PNG, floats cleanly over any background */}
          <Link href="/">
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

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`font-sans text-[10px] tracking-[0.22em] uppercase font-light transition-colors duration-200 ${
                  onDark
                    ? "text-white/55 hover:text-white"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="relative flex items-center gap-4">
            <NavbarAuth onDark={onDark} />

            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle dark mode"
                className={`transition-colors duration-200 ${onDark ? "text-white/55 hover:text-white" : "text-zinc-400 hover:text-zinc-900"}`}
              >
                {theme === "dark"
                  ? <Sun size={16} strokeWidth={1.5} />
                  : <Moon size={16} strokeWidth={1.5} />
                }
              </button>
            )}

            <Link href="/cart" className={`relative transition-colors duration-200 ${onDark ? "text-white/55 hover:text-white" : "text-zinc-400 hover:text-zinc-900"}`}>
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className={`absolute -top-1 -right-1.5 w-[15px] h-[15px] rounded-full text-[7px] font-medium flex items-center justify-center ${onDark ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"}`}>
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              className={`md:hidden transition-colors ${onDark ? "text-white/55 hover:text-white" : "text-zinc-400 hover:text-zinc-900"}`}
              onClick={() => setMenuOpen(o => !o)}
            >
              {menuOpen ? <X size={19} strokeWidth={1.5} /> : <Menu size={19} strokeWidth={1.5} />}
            </button>
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
                  className="font-sans text-[11px] tracking-[0.22em] uppercase text-zinc-400 hover:text-zinc-900 transition-colors font-light"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/track"
                onClick={() => setMenuOpen(false)}
                className="font-sans text-[11px] tracking-[0.22em] uppercase text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors font-light"
              >
                Track Order
              </Link>
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <NavbarAuth mobile onDark={false} onClose={() => setMenuOpen(false)} />
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-2 font-sans text-[11px] tracking-[0.15em] uppercase text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
                  >
                    {theme === "dark" ? <Sun size={14} strokeWidth={1.5} /> : <Moon size={14} strokeWidth={1.5} />}
                    {theme === "dark" ? "Light" : "Dark"}
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
