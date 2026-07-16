---
applyTo: "src/css/**/*.css,src/scss/**/*.scss,tailwind.config.js,src/plugin.js"
---

# DGEM Package – Token & CSS Editing

You are editing the `@dgem/design-system` design token package itself. Read `docs/design-system/25-css-architecture.md` first.

## File responsibilities

- `src/css/tokens.css` – CSS custom properties **only**. Brand, neutrals, semantic, theme aliases, dark-mode overrides
- `src/css/typography.css` – `.dgem-*` typography classes only
- `src/css/components.css` – barrel that `@import`s the `src/css/components/*.css` partials (buttons, forms, data-display, feedback, navigation, modals). Add `.dgem-*` component classes to the matching partial
- `src/css/utilities.css` – `.dgem-*` utility helpers (color shortcuts, scrollbar, line-clamp)
- `src/scss/_variables.scss` – SCSS mirror, must match `tokens.css` exactly
- `tailwind.config.js` – sharable Tailwind theme config, must mirror `tokens.css` values
- `src/plugin.js` – Tailwind plugin registering typography + button base utilities

## Token naming conventions

- Brand: `--dgem-{name}` (e.g. `--dgem-blue`, `--dgem-dark-blue`)
- Neutral: `--grey-{step}` (50, 100, 200, …, 800)
- Semantic: `--color-{name}` (e.g. `--color-red`, `--color-green`)
- Theme aliases: `--color-{role}` (e.g. `--color-primary`, `--color-foreground`, `--color-border`)

## Rules

1. Every class MUST use the `dgem-` prefix
2. Never hardcode hex values inside component/utility rules – always reference `var(--token)`
3. Dark mode overrides go inside `[data-theme="dark"], .dark` selectors in `tokens.css`
4. Keep `_variables.scss` and `tailwind.config.js` in sync with `tokens.css` after any token change
5. No framework-specific code – package is consumed by Vue, React, and others
6. After changes: run `npm run build` and `npm run lint`, then verify dark mode still works
