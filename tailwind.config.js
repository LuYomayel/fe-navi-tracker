/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", "class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/modules/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Geist (cargada via next/font en layout.tsx)
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        // Formato con <alpha-value> => habilita modificadores de opacidad
        // (bg-primary/12, border-success/18, etc) en TODO el sistema.
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        // Semánticos del producto (día ganado / parcial / agua)
        success: {
          DEFAULT: "hsl(var(--success) / <alpha-value>)",
          foreground: "hsl(var(--success-foreground) / <alpha-value>)",
        },
        warning: {
          DEFAULT: "hsl(var(--warning) / <alpha-value>)",
          foreground: "hsl(var(--warning-foreground) / <alpha-value>)",
        },
        info: {
          DEFAULT: "hsl(var(--info) / <alpha-value>)",
          foreground: "hsl(var(--info-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        chart: {
          1: "hsl(var(--chart-1) / <alpha-value>)",
          2: "hsl(var(--chart-2) / <alpha-value>)",
          3: "hsl(var(--chart-3) / <alpha-value>)",
          4: "hsl(var(--chart-4) / <alpha-value>)",
          5: "hsl(var(--chart-5) / <alpha-value>)",
        },
        // DEPRECADO: segunda fuente de verdad de color. Se elimina al migrar
        // las pantallas a tokens (ver notas del handoff). No usar en código nuevo.
        ios: {
          blue: "#007AFF",
          green: "#34C759",
          orange: "#FF9500",
          red: "#FF3B30",
          purple: "#AF52DE",
          pink: "#FF2D55",
          yellow: "#FFCC00",
          teal: "#5AC8FA",
          gray: "#8E8E93",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)", // 8 — badges/chips
        md: "var(--radius-md)", // 12 — botones/inputs/pills
        lg: "var(--radius-lg)", // 16 — cards
        xl: "var(--radius-xl)", // 20 — modals/sheets
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        fab: "var(--shadow-fab)",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)", // solo recompensas
      },
      transitionDuration: {
        fast: "150ms",
        base: "200ms",
        slow: "300ms",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        "navi-float": "navi-float 3.5s ease-in-out infinite",
        "navi-pop-in": "navi-pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        "slide-up": "slideUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      },
      keyframes: {
        "bounce-gentle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "navi-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "navi-pop-in": {
          "0%": { transform: "scale(0.92)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
