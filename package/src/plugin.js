/**
 * DGEM 2.0 Design System – Tailwind CSS Plugin
 *
 * Registers DGEM typography and component utilities as
 * Tailwind plugin so they work with the `@apply` directive.
 *
 * Also injects universal base resets so consuming apps
 * need nothing in their own index.css beyond:
 *   @tailwind base;
 *   @tailwind components;
 *   @tailwind utilities;
 *   @import "@dgem/design-system";
 *
 * Usage in tailwind.config.js:
 *   const dgemPlugin = require("@dgem/design-system/tailwind-plugin");
 *   module.exports = { plugins: [dgemPlugin] };
 */
const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addBase, addComponents, theme }) {
  /* ── Universal Base Resets ──
     Applied in @layer base so Tailwind utilities can still override. */
  addBase({
    "*, *::before, *::after": {
      boxSizing: "border-box",
    },
    "html, body": {
      height: "100%",
      margin: "0",
      padding: "0",
    },
    body: {
      fontFamily: theme("fontFamily.sans"),
      fontSize: "0.875rem",   /* 14px – DGEM body default */
      fontWeight: "400",
      color: "var(--color-foreground)",
      backgroundColor: "var(--color-background)",
      WebkitFontSmoothing: "antialiased",
      MozOsxFontSmoothing: "grayscale",
    },
    /* React root — full viewport height */
    "#root": {
      height: "100%",
    },
  });

  /* ── Typography component classes ── */
  addComponents({
    ".text-display": {
      fontSize: "1.75rem",
      lineHeight: "1.2",
      letterSpacing: "0.03em",
    },
    ".text-h1": {
      fontSize: "1.5rem",
      lineHeight: "1.2",
    },
    ".text-h2": {
      fontSize: "1.25rem",
      lineHeight: "1.3",
    },
    ".text-h3": {
      fontSize: "1rem",
      lineHeight: "1.2",
    },
    ".text-h4": {
      fontSize: "0.875rem",
      lineHeight: "1.3",
    },
    ".text-h5": {
      fontSize: "1.5rem",
      lineHeight: "1.4",
      fontWeight: "300",
      letterSpacing: "0.03em",
    },
    ".text-toolbar-title": {
      fontSize: "1.125rem",
    },
    ".text-body": {
      fontSize: "0.875rem",
      lineHeight: "1.6",
    },
    ".text-body1": {
      fontSize: "1rem",
      lineHeight: "1.5",
      fontWeight: "300",
      letterSpacing: "0.0125em",
    },
    ".text-body2": {
      fontSize: "0.875rem",
      lineHeight: "1.5",
      fontWeight: "300",
      letterSpacing: "0.021em",
    },
    ".text-small": {
      fontSize: "0.75rem",
      lineHeight: "1.4",
    },
  });

  /* ── Button base component ── */
  addComponents({
    ".dgem-btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      fontFamily: theme("fontFamily.sans"),
      fontWeight: "400",
      whiteSpace: "nowrap",
      cursor: "pointer",
      transitionProperty: "background-color, border-color, color, box-shadow",
      transitionDuration: "200ms",
      transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      "&:focus-visible": {
        outline: "2px solid var(--color-ring)",
        outlineOffset: "2px",
      },
      "&:disabled, &[aria-disabled='true']": {
        opacity: "0.5",
        pointerEvents: "none",
      },
    },
    ".dgem-btn-lg": {
      height: "3rem",
      padding: "0.5rem 1rem",
      gap: "1rem",
      fontSize: "1rem",
    },
    ".dgem-btn-md": {
      height: "2.5rem",
      padding: "0.75rem 1rem",
      gap: "1rem",
      fontSize: "1rem",
    },
    ".dgem-btn-sm": {
      height: "1.5rem",
      padding: "0.5rem",
      gap: "0.5rem",
      fontSize: "0.75rem",
    },
  });
});
