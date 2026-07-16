## Color System

### Brand Palette

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Dark Blue | `#121A38` | `--dgem-dark-blue` | Primary text, dark backgrounds, filled buttons, sidebar active |
| Blue | `#0058AB` | `--dgem-blue` | Primary actions, links, active states, toggle on, pagination active |
| Turquoise | `#00D5D0` | `--dgem-turquoise` | Accent highlights, hover on dark backgrounds, "updated" tags |
| Light Blue | `#1DB8F2` | `--dgem-light-blue` | Focus rings, input focus borders, secondary accent, chart line 1 |
| White | `#FFFFFF` | `--dgem-white` | Backgrounds, text on dark surfaces |

### Neutral Scale

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Grey-50 | `#FAFAFA` | `--grey-50` | App background, sidebar bg, card bg |
| Grey-100 | `#F4F4F5` | `--grey-100` | Body background, scrollbar track, muted bg, chip default |
| Grey-200 | `#E5E5E5` | `--grey-200` | Borders, dividers, progress bar track |
| Grey-300 | `#CCCCCC` | `--grey-300` | Scrollbar thumb, filled input border, switch off |
| Grey-400 | `#9A9A9A` | `--grey-400` | Placeholder text |
| Grey-500 | `#8D8D8D` | `--grey-500` | Labels, secondary text, chart ticks |
| Grey-600 | `#71717A` | `--grey-600` | Muted text, form labels, table headers |
| Grey-700 | `#666666` | `--grey-700` | Tertiary text |
| Grey-800 | `#A8A8A8` | `--grey-800` | Tree lines, popup close icon |

### Semantic Colors

| Token | Hex | CSS Variable | Usage |
|-------|-----|-------------|-------|
| Red | `#E30021` | `--color-red` | Errors, destructive actions, delete buttons |
| Red Light | `#FF816E` | `--color-red-light` | Light red accent, dark-theme destructive |
| Yellow | `#FEB100` | `--color-yellow` | Warnings, on-hold status, gold badges |
| Green | `#17A34C` | `--color-green` | Success, active status, check marks |
| Brown | `#AA7243` | `--color-brown` | Bronze badges |

### Theme Aliases (CSS Custom Properties)

Always use aliases in component code – never hardcode hex values:

```css
/* ✅ Correct – uses theme alias */
color: var(--color-foreground);
background: var(--color-primary);

/* ❌ Wrong – hardcoded value */
color: #121A38;
background: #0058AB;
```

| Alias | Light Value | Dark Value |
|-------|------------|------------|
| `--color-primary` | `--dgem-blue` | `--dgem-light-blue` |
| `--color-primary-foreground` | `--dgem-white` | `--dgem-dark-blue` |
| `--color-secondary` | `--grey-100` | `#1E2548` |
| `--color-secondary-foreground` | `--dgem-dark-blue` | `--dgem-white` |
| `--color-accent` | `--dgem-turquoise` | `--dgem-turquoise` |
| `--color-accent-foreground` | `--dgem-dark-blue` | `--dgem-dark-blue` |
| `--color-destructive` | `--color-red` | `--color-red-light` |
| `--color-background` | `--dgem-white` | `--dgem-dark-blue` |
| `--color-page-bg` | `#F3F4F5` | `#0E1430` |
| `--color-foreground` | `--dgem-dark-blue` | `#FAFAFA` |
| `--color-border` | `--grey-200` | `#2A3260` |
| `--color-ring` | `--dgem-blue` | `--dgem-light-blue` |
| `--color-card` | `--grey-50` | `#182044` |
| `--color-muted` | `--grey-100` | `#1E2548` |
| `--color-muted-foreground` | `--grey-600` | `--grey-400` |

### Color Rules

1. **Dark Blue (`#121A38`)** is the primary text color on light backgrounds. Never use pure black (`#000`).
2. **Blue (`#0058AB`)** is for interactive elements only – buttons, links, active states. Never use it for passive text.
3. **Turquoise (`#00D5D0`)** is an accent – use sparingly for highlights and hovers on dark backgrounds. Never use as a background for large areas.
4. **Light Blue (`#1DB8F2`)** is for focus rings and secondary accent. It's the first color in chart series.
5. **Red** is reserved for errors and destructive actions. Never use red for decorative purposes.
6. **Yellow** is reserved for warnings and "on hold" status.
7. **Green** is reserved for success and "active" status.
8. **Never reduce text opacity.** Do not use `text-foreground/80`, `text-foreground/70`, or any opacity modifier on text color utilities. Use the semantic color tokens at full opacity instead: `text-foreground` for body text, `text-muted-foreground` for secondary text, specific grey tokens (`text-grey-500`, `text-grey-600`) for tertiary text. Opacity-reduced text creates inconsistent contrast and fails accessibility checks.

### Chart Colors (ordered)

When rendering chart series, use this exact sequence:

```
#1DB8F2, #00D5D0, #FEB100, #71609E, #FF816E, #00828E, #BE4D00, #0058AB
```
