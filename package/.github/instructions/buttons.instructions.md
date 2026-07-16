---
applyTo: "**/{[Bb]utton,[Bb]tn}*.{vue,tsx,jsx,svelte,html,css,scss}"
---

# DGEM Buttons

When working on buttons, read `docs/design-system/10-buttons.md` for the full spec.

## Quick rules

- All buttons are pill-shaped (`border-radius: 9999px`) – never squared
- Default size is `dgem-btn-md` (40px). `dgem-btn-sm` is **only** for table rows / inline contexts
- Prefer BEM variants: `dgem-btn--filled`, `dgem-btn--outlined`, `dgem-btn--ghost`, `dgem-btn--destructive`
- Icon-only buttons MUST use `dgem-btn--icon` (renders as a circle, not pill)
- Destructive buttons (`dgem-btn--destructive`, red) only for delete/discard/leave-without-saving
- Footer order: Cancel/destructive on left, primary on right
- Save action uses 3-second green "Saved!" feedback (see Save Action Button Pattern in [`docs/design-system/10-buttons.md`](../../docs/design-system/10-buttons.md))
