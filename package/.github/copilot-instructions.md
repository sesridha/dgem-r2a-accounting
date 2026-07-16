# DGEM Tailwind CSS – Copilot Instructions

This is `@dgem/design-system`, the centralized design token package for the DGEM platform.

**Read [`AGENTS.md`](../AGENTS.md) first** – it is the canonical agent guide. The visual specification lives in [`docs/design-system/`](../docs/design-system/) (split per topic). Scoped per-component rules live in [`.github/instructions/*.instructions.md`](instructions/) and apply automatically based on file patterns.

## Non-negotiables (quick reference)

1. Never hardcode hex colors – use `var(--color-*)` or Tailwind aliases (`bg-primary`, `text-foreground`).
2. All custom CSS classes use the `dgem-` prefix.
3. All buttons are pill-shaped (`border-radius: 9999px`); icon-only buttons use `dgem-btn--icon` (circles).
4. Use [Lucide React](https://lucide.dev) (`lucide-react`) for all UI icons. Never use icon fonts, Heroicons, Font Awesome, or Material Icons.
5. Font: Ubuntu (300/400/500/700). Body default 14px Regular. Never below 12px.
6. Spacing is base-4 (4, 8, 12, 16, 24, 32, 40, 64). Never odd pixel values.
7. Page background is the DGEM gradient (`.gradient-bg`) over the warm grey base `#F3F4F5`, never plain white (applies to every page, including login).
8. Never reduce text opacity – use semantic tokens at full opacity.
9. Red = errors only. Blue = interactive only. Turquoise = accent only.
10. Dark mode via `class="dark"` on an ancestor – all `--color-*` aliases switch automatically.

Full Do/Don't matrix: [`docs/design-system/26-do-dont.md`](../docs/design-system/26-do-dont.md).

## Editing this package

- Token changes must be mirrored across `src/css/tokens.css`, `tailwind.config.js`, and `src/scss/_variables.scss`.
- Component styles → the matching partial in `src/css/components/` (`buttons`, `forms`, `data-display`, `feedback`, `navigation`, `modals`); `src/css/components.css` is the barrel that imports them. Typography → `src/css/typography.css`.
- Component colors: use adaptive `--color-*` aliases for neutral surfaces/text/borders; use constant brand/semantic tokens (`--dgem-*`, `--color-red/-yellow/-green`) for brand and status colors.
- No icon fonts ship with the package (`icons.css` was removed) – use Lucide React.
- Never introduce framework-specific code (React, Vue, etc.).
- After changes: run `npm run lint` and `npm run build` (PostCSS bundle → `dist/dgem.css`). Test dark mode.
