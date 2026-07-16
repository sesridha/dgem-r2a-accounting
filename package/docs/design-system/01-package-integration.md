## Package Integration

`@dgem/design-system` is a **framework-agnostic CSS design token package**. It works with any frontend technology – the visual rules in this document apply regardless of the framework, component library, or build tool your project uses.

### Installation

```bash
npm install @dgem/design-system
```

### CSS Imports

```css
/* Import everything */
@import "@dgem/design-system";

/* Or selective imports */
@import "@dgem/design-system/tokens";      /* CSS custom properties */
@import "@dgem/design-system/typography";   /* Type classes */
@import "@dgem/design-system/components";   /* UI component classes */
@import "@dgem/design-system/utilities";    /* Color/ring/scrollbar utilities */
```

### Tailwind CSS Extension (Optional)

If your project uses Tailwind CSS, extend your configuration with DGEM semantic tokens:

```javascript
// tailwind.config.js
export default {
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: { DEFAULT: "hsl(var(--primary) / <alpha-value>)", foreground: "..." },
        secondary: { DEFAULT: "hsl(var(--secondary) / <alpha-value>)", foreground: "..." },
        muted: { DEFAULT: "hsl(var(--muted) / <alpha-value>)", foreground: "..." },
        accent: { DEFAULT: "hsl(var(--accent) / <alpha-value>)", foreground: "..." },
        destructive: { DEFAULT: "hsl(var(--destructive) / <alpha-value>)", foreground: "..." },
        card: { DEFAULT: "hsl(var(--card) / <alpha-value>)", foreground: "..." },
        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      fontFamily: { sans: ["Ubuntu", "sans-serif"] },
      borderRadius: { lg: ".5625rem", md: ".375rem", sm: ".1875rem" },
    },
  },
}
```

This lets you write `bg-primary`, `text-muted-foreground`, `border-border` etc. – all resolving to DGEM theme values with automatic dark mode support.

### Using Design Tokens

All DGEM design tokens are exposed as CSS custom properties and can be used in any styling approach:

```css
/* Plain CSS */
.my-element {
  color: var(--color-foreground);
  background: var(--color-primary);
  border: 1px solid var(--color-border);
}

/* Tailwind utilities (if configured per 2.3) */
/* bg-primary text-foreground border-border */
```

**Always use CSS custom properties** (`var(--dgem-blue)`) or their Tailwind equivalents – never hardcode hex values. This ensures dark mode and theming work automatically.
