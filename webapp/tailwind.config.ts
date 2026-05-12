import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand-refresh-ready placeholder palette anchored on Aggie maroon.
        // All semantic colors derive from these tokens — swap them when the brand work lands.
        maroon: {
          50:  "#FBF1EE",
          100: "#F4E0D9",
          200: "#E7BDB1",
          300: "#D2917F",
          400: "#B3614C",
          500: "#8E3B26",
          600: "#6E2818",
          700: "#500000", // canonical Aggie maroon
          800: "#3D0000",
          900: "#2A0000",
        },
        cream: {
          DEFAULT: "#FAF7F2",
          100: "#FDFBF7",
          200: "#F4ECDF",
          300: "#EADFCB",
        },
        ink: {
          DEFAULT: "#171312",
          soft: "#4A4340",
          faint: "#7C7470",
          muted: "#A29A95",
        },
        line: {
          DEFAULT: "#E5DDD0",
          strong: "#D2C8B7",
          subtle: "#F1ECE3",
        },
        accent: {
          gold: "#B89B5C",
          rust: "#A0501F",
          green: "#4A6B3F",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-fraunces)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        // Type scale — modular, tight at small sizes for density, expansive at display sizes
        "xs":   ["0.75rem", { lineHeight: "1.5" }],
        "sm":   ["0.875rem", { lineHeight: "1.55" }],
        "base": ["1rem", { lineHeight: "1.6" }],
        "lg":   ["1.125rem", { lineHeight: "1.55" }],
        "xl":   ["1.25rem", { lineHeight: "1.5" }],
        "2xl":  ["1.5rem", { lineHeight: "1.35", letterSpacing: "-0.01em" }],
        "3xl":  ["1.875rem", { lineHeight: "1.25", letterSpacing: "-0.015em" }],
        "4xl":  ["2.5rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "5xl":  ["3.25rem", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        "6xl":  ["4.25rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "7xl":  ["5.5rem", { lineHeight: "1.02", letterSpacing: "-0.035em" }],
      },
      maxWidth: {
        content: "1180px",
        prose: "68ch",
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(23,19,18,0.04), 0 4px 12px rgba(23,19,18,0.04)",
        lifted: "0 4px 8px rgba(23,19,18,0.06), 0 16px 32px rgba(23,19,18,0.06)",
        glow: "0 0 0 4px rgba(80,0,0,0.08)",
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeIn: { from: { opacity: "0" }, to: { opacity: "1" } },
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-1000px 0" },
          "100%": { backgroundPosition: "1000px 0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;
