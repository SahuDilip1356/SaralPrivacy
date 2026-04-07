import type { Config } from "tailwindcss";

// ─── SaralPrivacy — Design Token System v3.0 ──────────────────────────────
// Brand Guidelines v3.0, April 2026
// Usage ratio (45 / 20 / 10 / 5 rule):
//   45% Trust Navy   →  hero backgrounds, headings, badge core, footer
//   20% Verif. Green →  primary CTAs, active states, trust affirmation
//   10% Assur. Teal  →  secondary accent, hover cues, charts
//    5% Signal Gold  →  dividers, certification edges, selective emphasis only
//   10% Slate 700    →  primary body copy on light surfaces
//   10% Cloud 50     →  light backgrounds, whitespace, reading panels

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
        // Trust Navy — primary brand field; hero backgrounds; headings; badge core
        navy: {
          50:  "#E8ECF2",
          100: "#C5CDD9",
          200: "#9FADBF",
          300: "#7A8DA6",
          400: "#566D8C",
          500: "#354F72",
          600: "#1E3355",
          700: "#121A2E",  // ← Trust Navy (primary)
          800: "#0D1322",
          900: "#080D17",
          950: "#04060C",
        },
        // Verification Green — primary CTA; active states; trust affirmation; proof points
        green: {
          50:  "#E6FAF4",
          100: "#C0F3E2",
          200: "#87E9C8",
          300: "#4DDCA9",
          400: "#1FCC8D",
          500: "#07B981",  // ← Verification Green (primary CTA)
          600: "#059669",
          700: "#047857",
          800: "#065F46",
          900: "#064E3B",
          950: "#022C22",
        },
        // Assurance Teal — secondary accent; badge ring; hover cues; charts
        teal: {
          50:  "#E9F7F7",
          100: "#C7ECEB",
          200: "#9ADAD8",
          300: "#67C8C5",
          400: "#48BAB7",
          500: "#35B6AE",  // ← Assurance Teal (secondary accent)
          600: "#2A9A93",
          700: "#207D78",
          800: "#175F5B",
          900: "#0F4240",
          950: "#072422",
        },
        // Signal Gold — selective emphasis only; certification edge; premium highlight
        gold: {
          50:  "#FDF7E8",
          100: "#FAEDC5",
          200: "#F5D98A",
          300: "#EFC24E",
          400: "#E8AB42",  // ← Signal Gold (selective use only)
          500: "#D4921F",
          600: "#B07516",
          700: "#8A5A10",
          800: "#64420C",
          900: "#422B08",
          950: "#211505",
        },
        // Cloud — light backgrounds; whitespace; long-form reading panels
        cloud: {
          25:  "#FFFFFF",
          50:  "#F7F9FC",  // ← Cloud 50 (primary light background)
          100: "#EEF2F7",
          200: "#DDE4EF",
          300: "#C2CEDF",
          400: "#9AAEC8",
          500: "#7290B0",
          600: "#506F94",
          700: "#3A5270",
          800: "#26384F",
          900: "#141F2E",
          950: "#0A1018",
        },
        // Slate — body copy on light surfaces
        slate: {
          25:  "#F9FAFB",
          50:  "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",  // ← Slate 700 (primary body copy)
          800: "#1E293B",
          900: "#0F172A",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        heading: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Arial", "sans-serif"],
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
        "18":  "4.5rem",
        "88":  "22rem",
        "128": "32rem",
      },
      maxWidth: {
        "8xl": "88rem",
        "9xl": "96rem",
      },
      boxShadow: {
        xs:           "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card:         "0 1px 3px 0 rgb(18 26 46 / 0.06), 0 1px 2px -1px rgb(18 26 46 / 0.05)",
        "card-hover": "0 4px 8px -1px rgb(18 26 46 / 0.10), 0 2px 4px -2px rgb(18 26 46 / 0.06)",
        elevated:     "0 10px 25px -5px rgb(18 26 46 / 0.12), 0 4px 10px -5px rgb(18 26 46 / 0.06)",
        green:        "0 4px 14px 0 rgb(7 185 129 / 0.30)",
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
