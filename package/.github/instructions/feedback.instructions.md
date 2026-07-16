---
applyTo: "**/{[Tt]oast,[Nn]otification,[Aa]lert,[Bb]anner,[Pp]rogress,[Ss]pinner,[Ll]oader,[Ss]tepper}*.{vue,tsx,jsx,svelte,html,css,scss}"
---

# DGEM Feedback (toasts, progress, loaders)

When working on feedback components, read the relevant file in `docs/design-system/`:

- `18-toasts.md` – toast notifications
- `19-progress.md` – progress bars, steppers, loaders

## Quick rules

### Toasts
- Position `fixed top: 84px`, centered horizontally, `z-index: 100000`
- Width 384px, padding 16px, border-radius 8px
- Auto-dismiss after 4000ms by default
- Only one toast visible at a time
- Variants: `dgem-toast-green/yellow/red` (color mode) or `dgem-toast-light` (subtle)
- Title: 14px Medium, Description: 14px Regular, both with 20px line-height

### Progress
- Progress bar: 4px height, full-width track, filled portion
- Step indicators: 32×32 circles. States: complete (green✓), active (blue), pending (grey), error (red), warning (yellow), disabled
- Loader: SVG spinner cycling through brand colors (blue → light-blue → turquoise → dark-blue → yellow), default 48px
- For inline button spinners use the CSS-only spinner pattern (see [`docs/design-system/09-icons.md`](../../docs/design-system/09-icons.md))
