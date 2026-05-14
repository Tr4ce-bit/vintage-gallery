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
        vg: {
          black:    "#080808",   // near-pure black
          white:    "#FFFFFF",
          cream:    "#F5F4F1",   // warm off-white (like Majlis cream)
          "cream-dark": "#E8E6E1",
          gray:     "#888888",
          "gray-light": "#CCCCCC",
          "gray-dark":  "#333333",
          ink:      "#0F0F0E",
          "ink-muted":  "#3A3A38",
          surface:  "#111111",
          border:   "#1E1E1E",
          "border-light": "#DDDBD5",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans:  ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      animation: {
        float:   "float 6s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-14px)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
      },
      screens: { xs: "375px" },
    },
  },
  plugins: [],
};
