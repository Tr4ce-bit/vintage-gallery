/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vintage Gallery Brand Palette
        brand: {
          black:   "#080808",   // near-black canvas
          cream:   "#F2EFE6",   // warm ivory text
          gold:    "#C9A84C",   // primary accent
          "gold-light": "#E8C96A",
          "gold-dark":  "#8B6914",
          indigo:  "#1B1464",   // royal indigo
          "indigo-light": "#2D2196",
          muted:   "#4A4A4A",   // secondary text
          "surface": "#111111", // card / section bg
          "border": "#2A2A2A",  // subtle dividers
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Bebas Neue", "Impact", "sans-serif"],
        heading: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        body:    ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E8C96A 50%, #8B6914 100%)",
        "dark-gradient": "linear-gradient(180deg, #080808 0%, #111111 100%)",
        "hero-gradient": "linear-gradient(to bottom, rgba(8,8,8,0) 0%, rgba(8,8,8,0.6) 60%, rgba(8,8,8,1) 100%)",
      },
      animation: {
        "shimmer": "shimmer 2.5s linear infinite",
        "float":   "float 6s ease-in-out infinite",
        "pulse-gold": "pulseGold 3s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-12px)" },
        },
        pulseGold: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(201,168,76,0.4)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(201,168,76,0)" },
        },
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};
