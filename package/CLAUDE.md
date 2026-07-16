# CLAUDE.md

> **[`AGENTS.md`](AGENTS.md) is the single source of truth.** Read it first; this
> file is a deliberately short orientation that defers to it. When guidance here
> and in `AGENTS.md` could drift, `AGENTS.md` wins.

## What this is

`@dgem/design-system` – the centralized, **framework-agnostic** design-token
package for the DGEM (Digital Global Enterprise Model) platform. It ships design
tokens, typography, `dgem-*` component classes, a Tailwind preset/plugin, and a
SCSS mirror. Never add framework-specific (React/Vue) code.

## Non-negotiable rules (quick reference)

1. Never hardcode hex colors – use `var(--color-*)` or Tailwind aliases (`bg-primary`, `text-foreground`).
2. All custom CSS classes use the `dgem-` prefix.
3. All buttons are pill-shaped (`border-radius: 9999px`); icon-only buttons use `dgem-btn--icon` (circles).
4. Use [Lucide React](https://lucide.dev) (`lucide-react`) for all UI icons. Never use icon fonts, Heroicons, Font Awesome, or Material Icons.
5. Font: Ubuntu (300/400/500/700). Body default 14px Regular. Never below 12px.
6. Spacing is base-4 (4, 8, 12, 16, 24, 32, 40, 64). Never odd pixel values.
7. Page background is the DGEM gradient (`.gradient-bg`) over the warm grey base `#F3F4F5`, never plain white (every page, including login).
8. Never reduce text opacity – use semantic tokens at full opacity.
9. Red = errors only. Blue = interactive only. Turquoise = accent only.
10. Dark mode via `class="dark"` on an ancestor – all `--color-*` aliases switch automatically.

Full Do/Don't matrix: [`docs/design-system/26-do-dont.md`](docs/design-system/26-do-dont.md).

## Where to find detail

- **Visual spec** – [`docs/design-system/`](docs/design-system/); start with its
  [`README.md`](docs/design-system/README.md) for the per-topic loading guide.
- **Source layout, mirroring rule, full workflow** – [`AGENTS.md`](AGENTS.md).
- **Editing package internals** – `.github/instructions/package-internals.instructions.md`.

## Editing this package

- Tokens: mirror every change across `src/css/tokens.css`, `tailwind.config.js`, and `src/scss/_variables.scss`.
- Component styles: edit the matching partial in `src/css/components/` (`buttons`, `forms`, `data-display`, `feedback`, `navigation`, `modals`); `src/css/components.css` is the barrel that imports them.
- Component colors: adaptive `--color-*` aliases for neutral surfaces/text/borders; constant brand/semantic tokens (`--dgem-*`, `--color-red/-yellow/-green`) for brand and status colors.

## Verify

```bash
npm run lint     # stylelint
npm run build    # PostCSS bundle → dist/dgem.css
```

Then test dark mode (`class="dark"` on an ancestor).
