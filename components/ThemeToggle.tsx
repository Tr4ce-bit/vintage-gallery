"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/**
 * Slide-switch theme toggle. Visibly indicates current state via a thumb that
 * sits left (light) or right (dark), with a tiny sun/moon glyph inside the thumb.
 *
 * Works on dark or light backgrounds — the pill carries its own contrast so it
 * never disappears against the page (unlike the previous icon-only button).
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Avoid SSR hydration mismatch — render a neutral placeholder until mounted
  if (!mounted) {
    return <span className={`inline-block w-11 h-6 rounded-full bg-zinc-200/70 dark:bg-zinc-700/40 ${className}`} aria-hidden />;
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-400 dark:focus:ring-offset-zinc-900 ${
        isDark ? "bg-zinc-700" : "bg-zinc-300"
      } ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white dark:bg-zinc-100 shadow-sm flex items-center justify-center transition-transform duration-300 ${
          isDark ? "translate-x-5" : "translate-x-0"
        }`}
      >
        {isDark
          ? <Moon size={10} className="text-zinc-700" strokeWidth={2} />
          : <Sun  size={10} className="text-amber-500" strokeWidth={2} />}
      </span>
    </button>
  );
}
