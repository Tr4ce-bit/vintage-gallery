"use client";

import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon } from "lucide-react";

/**
 * Admin slide-switch theme toggle. Mirrors the store version but uses the
 * admin's own ThemeProvider context. Pill carries its own contrast so it
 * stays visible against the always-dark sidebar background.
 */
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`relative inline-flex w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-zinc-500 ${
        isDark ? "bg-zinc-700" : "bg-zinc-400"
      } ${className}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center transition-transform duration-300 ${
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
