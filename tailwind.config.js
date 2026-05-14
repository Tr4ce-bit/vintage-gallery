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
          black:        "#080808",
          white:        "#FFFFFF",
          cream:        "#F5F4F1",
          "cream-dark": "#EDEAE3",
          ink:          "#0F0F0E",
          "ink-muted":  "#5A5A58",
          surface:      "#F9F9F8",
          border:       "#E8E6E0",
        },
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans:  ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      boxShadow: {
        "card":   "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
        "card-lg":"0 8px 24px rgba(0,0,0,0.1), 0 24px 60px rgba(0,0,0,0.1)",
        "inner-sm": "inset 0 1px 3px rgba(0,0,0,0.08)",
      },
      screens: { xs: "375px" },
    },
  },
  plugins: [],
};
