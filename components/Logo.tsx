"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface LogoProps {
  /** "mark" = VG icon only, "full" = icon + wordmark, "wordmark" = text only */
  variant?: "mark" | "full" | "wordmark";
  /** Size of the mark in px */
  size?: number;
  /** White version (for dark backgrounds) vs. black version */
  inverted?: boolean;
  className?: string;
  animate?: boolean;
}

export default function Logo({
  variant = "full",
  size = 40,
  inverted = true,
  className = "",
  animate = false,
}: LogoProps) {
  const markElement = (
    <div
      style={{ width: size, height: size }}
      className="relative flex-shrink-0"
    >
      <Image
        src="/asset/logo.png"
        alt="Vintage Gallery VG mark"
        fill
        className="object-contain"
        style={{
          filter: inverted
            ? "brightness(0) invert(1)"   // black → white for dark bg
            : "none",
        }}
        priority
      />
    </div>
  );

  const wordmarkElement = (
    <span
      className="font-heading tracking-[0.25em] uppercase select-none"
      style={{
        fontSize: size * 0.28,
        color: inverted ? "#F2EFE6" : "#080808",
        letterSpacing: "0.22em",
      }}
    >
      Vintage Gallery
    </span>
  );

  const content =
    variant === "mark" ? (
      markElement
    ) : variant === "wordmark" ? (
      wordmarkElement
    ) : (
      <div className="flex items-center gap-3">
        {markElement}
        <div className="flex flex-col leading-none">
          <span
            className="font-heading font-bold tracking-[0.3em] uppercase"
            style={{
              fontSize: size * 0.22,
              color: inverted ? "#F2EFE6" : "#080808",
            }}
          >
            Vintage Gallery
          </span>
          <span
            className="tracking-[0.15em] uppercase"
            style={{
              fontSize: size * 0.13,
              color: inverted ? "rgba(242,239,230,0.45)" : "rgba(8,8,8,0.45)",
            }}
          >
            Store
          </span>
        </div>
      </div>
    );

  if (animate) {
    return (
      <motion.div
        className={`inline-flex items-center ${className}`}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={`inline-flex items-center ${className}`}>{content}</div>
  );
}

// ─── Gold accent variant for hero / loading screens ──────────────────────────
export function LogoGold({ size = 80 }: { size?: number }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: size, height: size }} className="relative">
        <Image
          src="/asset/logo.png"
          alt="Vintage Gallery"
          fill
          className="object-contain"
          style={{
            // Tint to brand gold using CSS filter chain
            filter:
              "brightness(0) saturate(100%) invert(72%) sepia(42%) saturate(600%) hue-rotate(5deg) brightness(95%)",
          }}
        />
      </div>
      <span
        className="font-heading tracking-[0.4em] uppercase text-gold-shimmer"
        style={{ fontSize: size * 0.16 }}
      >
        Vintage Gallery
      </span>
    </div>
  );
}
