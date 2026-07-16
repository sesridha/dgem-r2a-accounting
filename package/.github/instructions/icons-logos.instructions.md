---
applyTo: "**/{[Ii]con,[Ll]ogo}*.{vue,tsx,jsx,svelte,html,css,scss}"
---

# DGEM Icons & Logos

When working with icons or logos, read these files in `docs/design-system/`:

- `09-icons.md` – icon font usage, complete glyph list, sizing/color/weight rules
- `23-logos.md` – logo placement, variants, login page

## Quick rules

### Icons
- Use **Lucide React** (`lucide-react`) for ALL UI icons
- Import icons from `lucide-react` (e.g. `import { Search, X, ChevronRight } from "lucide-react"`)
- Use the shared `<Icon name="search" size={16} />` wrapper when available
- **NEVER** use icon fonts (`icon2-*`, `icon-*`), Material Icons, Heroicons, Font Awesome, or any other icon library
- Size via the `size` prop (number in px); color via Tailwind `className` (icons use `currentColor`)
- Browse available icons at https://lucide.dev/icons

### Logos
- DGEM logo (`logo-dgem.svg`) visible on every screen – header (32px) and login (96px)
- Capgemini spade (`logo-cap-small.svg`) in footer, 24px max-width, right-aligned
- Module logos: 36px height in cards. Use `-white` on dark bg, `-grey` for inactive
- Never stretch or recolor logos – use the provided variants
