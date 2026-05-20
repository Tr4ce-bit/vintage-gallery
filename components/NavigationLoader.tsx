"use client";

/**
 * NavigationLoader — replaces the top progress bar.
 *
 * A small spinning arc fixed to the bottom-right corner.
 * Appears when the user clicks any in-app link and disappears
 * once the new route's pathname is committed.
 *
 * Works with Next.js App Router (no router events needed):
 *   click on <a>  →  show loader
 *   usePathname() →  hide loader when URL actually changes
 */

import { useEffect, useRef, useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function Loader() {
  const pathname          = usePathname();
  const prevPath          = useRef(pathname);
  const [active, setActive] = useState(false);
  const timerRef          = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Detect in-app link clicks and start the indicator ────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;

      // Ignore: external, new-tab, hash-only, JS-void, or same-page links
      try {
        const url = new URL(anchor.href, window.location.href);
        if (
          url.origin  !== window.location.origin ||
          anchor.target === "_blank"              ||
          url.href    === window.location.href    ||
          anchor.href.startsWith("javascript:")
        ) return;
      } catch { return; }

      setActive(true);

      // Safety-net: auto-hide after 8 s in case navigation never resolves
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setActive(false), 8_000);
    };

    document.addEventListener("click", handleClick, { capture: true });
    return () => document.removeEventListener("click", handleClick, { capture: true });
  }, []);

  // ── Hide when the URL actually changes ───────────────────────────────────
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      if (timerRef.current) clearTimeout(timerRef.current);
      // Brief delay so the new page has painted before we fade out
      timerRef.current = setTimeout(() => setActive(false), 120);
    }
  }, [pathname]);

  // Cleanup on unmount
  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="nav-loader"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="fixed bottom-6 right-6 z-[9999] pointer-events-none"
          aria-hidden
        >
          {/* Outer track ring */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="text-zinc-200 dark:text-zinc-700"
          >
            <circle cx="14" cy="14" r="11" stroke="currentColor" strokeWidth="2" />
          </svg>

          {/* Spinning arc — absolute on top of the track */}
          <motion.svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="absolute inset-0 text-zinc-900 dark:text-zinc-100"
            animate={{ rotate: 360 }}
            transition={{ duration: 0.9, ease: "linear", repeat: Infinity }}
          >
            {/*
              A quarter-circle arc.
              Circle r=11, cx=cy=14. Circumference = 2π×11 ≈ 69.1
              dash = 17 (≈ quarter arc), gap = rest
            */}
            <circle
              cx="14"
              cy="14"
              r="11"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="17 52"
              strokeDashoffset="0"
            />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Wrap in Suspense — usePathname requires it during static generation
export default function NavigationLoader() {
  return (
    <Suspense>
      <Loader />
    </Suspense>
  );
}
