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
        brand: {
          black:   "#080808",
          white:   "#FFFFFF",
          off:     "#F0F0F0",   // slightly off-white for body text
          gray:    "#888888",   // mid gray
          "gray-light": "#CCCCCC",
          "gray-dark":  "#333333",
          surface: "#111111",   // card / section bg
          border:  "#222222",   // subtle dividers
          "border-light": "#E0E0E0", // borders on white sections
        },
      },
      fontFamily: {
        display: ["var(--font-bebas)", "Bebas Neue", "Impact", "sans-serif"],
        heading: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        body:    ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "dark-gradient": "linear-gradient(180deg, #080808 0%, #111111 100%)",
      },
      animation: {
        "shimmer": "shimmer 2.5s linear infinite",
        "float":   "float 6s ease-in-out infinite",
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
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};
