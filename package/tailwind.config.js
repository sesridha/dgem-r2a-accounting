const plugin = require("tailwindcss/plugin");
const dgemPlugin = require("./src/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    /* ─── Font Family ─── */
    fontFamily: {
      sans: ["Ubuntu", "sans-serif"],
      mono: ["Ubuntu Mono", "monospace"],
    },

    /* ─── Font Size (Figma typography scale) ─── */
    fontSize: {
      xs: ["0.75rem", { lineHeight: "1.4" }],       // 12px – Small Text
      sm: ["0.875rem", { lineHeight: "1.6" }],       // 14px – Body / H4
      base: ["1rem", { lineHeight: "1.5" }],          // 16px – H3 / Body1
      lg: ["1.125rem", { lineHeight: "1.5" }],        // 18px – Toolbar Title
      xl: ["1.25rem", { lineHeight: "1.3" }],         // 20px – H2
      "2xl": ["1.5rem", { lineHeight: "1.2" }],       // 24px – H1 / H5
      "3xl": ["1.75rem", { lineHeight: "1.2" }],      // 28px – Display
    },

    /* ─── Font Weight ─── */
    fontWeight: {
      light: "300",
      normal: "400",
      medium: "500",
      bold: "700",
    },

    /* ─── Letter Spacing (Figma percentages → em) ─── */
    letterSpacing: {
      tighter: "-0.02em",
      tight: "-0.01em",
      normal: "0",
      wide: "0.01em",
      wider: "0.02em",
      widest: "0.03em",
    },

    /* ─── Border Radius ─── */
    borderRadius: {
      none: "0",
      sm: "0.25rem",     // 4px
      DEFAULT: "0.5rem",  // 8px
      md: "0.75rem",      // 12px
      lg: "1rem",         // 16px
      xl: "1.5rem",       // 24px
      full: "9999px",     // pill / circle
    },

    /* ─── Colors ─── */
    colors: {
      transparent: "transparent",
      current: "currentColor",

      /* Brand */
      white: "#FFFFFF",
      black: "#000000",

      /* DGEM Primary Palette */
      dgem: {
        "dark-blue": "#121A38",
        blue: "#0058AB",
        turquoise: "#00D5D0",
        "light-blue": "#1DB8F2",
      },

      /* Neutral / Grey Scale */
      grey: {
        50: "#FAFAFA",       // bg-light-grey
        100: "#F4F4F5",      // bg-grey
        200: "#E5E5E5",      // border-light-grey
        300: "#CCCCCC",      // border-grey
        400: "#9A9A9A",      // grey
        500: "#8D8D8D",      // grey2
        600: "#71717A",      // text-grey
        700: "#666666",      // grey3
        800: "#A8A8A8",      // text-grey-light / silver
      },

      /* Semantic */
      red: {
        DEFAULT: "#E30021",
        light: "#FF816E",
      },
      yellow: {
        DEFAULT: "#FEB100",
      },
      green: {
        DEFAULT: "#17A34C",
      },
      brown: {
        DEFAULT: "#AA7243",
      },

      /* Aliases (CSS custom property references) */
      primary: "var(--color-primary)",
      "primary-foreground": "var(--color-primary-foreground)",
      secondary: "var(--color-secondary)",
      "secondary-foreground": "var(--color-secondary-foreground)",
      accent: "var(--color-accent)",
      "accent-foreground": "var(--color-accent-foreground)",
      destructive: "var(--color-destructive)",
      "destructive-foreground": "var(--color-destructive-foreground)",
      muted: "var(--color-muted)",
      "muted-foreground": "var(--color-muted-foreground)",
      background: "var(--color-background)",
      foreground: "var(--color-foreground)",
      border: "var(--color-border)",
      ring: "var(--color-ring)",
      card: "var(--color-card)",
      "card-foreground": "var(--color-card-foreground)",
    },

    /* ─── Box Shadow ─── */
    boxShadow: {
      sm: "0 1px 2px 0 rgba(18,26,56,0.05)",
      DEFAULT: "0 1px 3px 0 rgba(18,26,56,0.10), 0 1px 2px 0 rgba(18,26,56,0.06)",
      md: "0 4px 6px -1px rgba(18,26,56,0.10), 0 2px 4px -1px rgba(18,26,56,0.06)",
      lg: "0 10px 15px -3px rgba(18,26,56,0.10), 0 4px 6px -2px rgba(18,26,56,0.05)",
      xl: "0 20px 25px -5px rgba(18,26,56,0.10), 0 10px 10px -5px rgba(18,26,56,0.04)",
      none: "none",
    },

    extend: {
      /* ─── Spacing extensions (button padding) ─── */
      spacing: {
        4.5: "1.125rem",  // 18px
        13: "3.25rem",    // 52px
      },

      /* ─── Transition ─── */
      transitionDuration: {
        DEFAULT: "200ms",
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
  plugins: [dgemPlugin],
};
