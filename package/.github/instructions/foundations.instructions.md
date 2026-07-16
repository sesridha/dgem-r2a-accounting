---
applyTo: "**/*.{css,scss,vue,tsx,jsx,html,svelte}"
---

# DGEM Foundations (always apply)

For any UI work, the following rules from the DGEM design system always apply.
Read these files in `docs/design-system/` if you need detail:

- `02-colors.md` – colors, theme aliases, never hardcode hex
- `03-typography.md` – Ubuntu, type scale, weight rules
- `04-spacing-layout.md` – base-4 spacing, app shell layout
- `25-css-architecture.md` – `dgem-` prefix, CSS variable usage
- `26-do-dont.md` – quick rules summary

## Non-negotiables

1. Never hardcode hex colors – use `var(--color-*)` or Tailwind aliases (`bg-primary`, `text-foreground`)
2. Use Ubuntu font, default 14px Regular for body, never below 12px
3. All component classes use the `dgem-` prefix
4. All buttons are pill-shaped (`border-radius: 9999px`)
5. Use Lucide React (`lucide-react`) for UI icons – never icon fonts, Heroicons, Font Awesome, or Material Icons
6. Page background is the DGEM gradient (`.gradient-bg`) over the warm grey base `#F3F4F5`, never plain white (applies to every page, including login)
7. Spacing must be a multiple of 4 (4, 8, 12, 16, 24, 32, 40, 64)
8. Never reduce text opacity – use semantic tokens at full opacity
9. Test dark mode (`class="dark"`) after any color/component change
