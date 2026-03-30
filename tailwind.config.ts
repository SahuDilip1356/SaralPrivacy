import type { Config } from "tailwindcss";

// ─── Bharat Privacy Hub — Design Token System ─────────────────────────────
// Usage ratio (75 / 15 / 7 / 3 rule):
//   75% Pearl + Ivory  →  canvas, cards
//   15% Ashoka Blue    →  nav, footer, authority panels
//    7% Bharat Saffron →  CTAs, active states, highlights
//    3% Dharma Green   →  success/low-risk states ONLY

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#EEF5FB",
          100: "#D9E8F2",
          200: "#B4CCDF",
          300: "#7EA5C8",
          400: "#5782AE",
          500: "#3A6593",
          600: "#2B5278",
          700: "#1E3A5F",
          800: "#16304F",
          900: "#0F2540",
          950: "#091829",
        },
        saffron: {
          50:  "#FEF4EE",
          100: "#FAE0CC",
          200: "#F5C9A8",
          300: "#F0B07E",
          400: "#E99260",
          500: "#E07B39",
          600: "#C05520",
          700: "#9C4319",
          800: "#7A3414",
          900: "#5C270F",
          950: "#3D1809",
        },
        dharma: {
          50:  "#EDFBF3",
          100: "#D1F3E3",
          200: "#A3E6C8",
          300: "#6DD5A8",
          400: "#3DBD85",
          500: "#22A66B",
          600: "#138547",
          700: "#0E6A3A",
          800: "#094F2B",
          900: "#05351D",
          950: "#022611",
        },
        pearl: {
          25:  "#FFFEF7",
          50:  "#F9FAFB",
          100: "#F2F4F1",
          200: "#E4E7E2",
          300: "#C8CCC5",
          400: "#9DA39A",
          500: "#6B7280",
          600: "#4B5563",
          700: "#374151",
          800: "#1F2937",
          900: "#111827",
          950: "#030712",
        },
        slate: {
          25:  "#F9FAFB",
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        heading: ["Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
        xs:    ["0.75rem",  { lineHeight: "1.125rem" }],
        sm:    ["0.875rem", { lineHeight: "1.375rem" }],
        base:  ["1rem",     { lineHeight: "1.625rem" }],
        lg:    ["1.125rem", { lineHeight: "1.75rem" }],
        xl:    ["1.25rem",  { lineHeight: "1.875rem" }],
        "2xl": ["1.5rem",   { lineHeight: "2rem",     letterSpacing: "-0.015em" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem",  letterSpacing: "-0.02em" }],
        "4xl": ["2.25rem",  { lineHeight: "2.625rem", letterSpacing: "-0.025em" }],
        "5xl": ["3rem",     { lineHeight: "3.375rem", letterSpacing: "-0.03em" }],
        "6xl": ["3.75rem",  { lineHeight: "4.125rem", letterSpacing: "-0.03em" }],
        "7xl": ["4.5rem",   { lineHeight: "4.875rem", letterSpacing: "-0.035em" }],
      },
      letterSpacing: {
        tighter: "-0.04em",
        tight:   "-0.02em",
        snug:    "-0.01em",
        normal:  "0em",
        wide:    "0.025em",
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      boxShadow: {
        xs:           "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card:         "0 1px 3px 0 rgb(30 58 95 / 0.06), 0 1px 2px -1px rgb(30 58 95 / 0.05)",
        "card-hover": "0 4px 8px -1px rgb(30 58 95 / 0.10), 0 2px 4px -2px rgb(30 58 95 / 0.06)",
        elevated:     "0 10px 25px -5px rgb(30 58 95 / 0.12), 0 4px 10px -5px rgb(30 58 95 / 0.06)",
        saffron:      "0 4px 14px 0 rgb(224 123 57 / 0.30)",
      },
      animation: {
        "fade-up":    "fadeUp 0.5s ease-out",
        "fade-in":    "fadeIn 0.3s ease-out",
        "slide-down": "slideDown 0.2s ease-out",
      },
      keyframes: {
        fadeUp:    { "0%": { opacity: "0", transform: "translateY(16px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        fadeIn:    { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideDown: { "0%": { opacity: "0", transform: "translateY(-8px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};

export default config;
