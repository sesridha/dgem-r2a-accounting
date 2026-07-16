---
applyTo: "**/{[Mm]odal,[Dd]ialog,[Pp]opup,[Cc]onfirm}*.{vue,tsx,jsx,svelte,html,css,scss}"
---

# DGEM Modals & Dialogs

When working on modals, read `docs/design-system/17-modals.md` for the full spec.

## Quick rules

- Use `dgem-modal-overlay` + `dgem-modal` + `dgem-modal-header/body/footer` classes
- **No separator borders** between header/body/footer – spacing only
- Standard modal: `max-width: 56rem`, `border-radius: 12px`
- Confirmation dialog: add `dgem-modal--confirm` (max 28rem, split footer)
- Footer button order: destructive/cancel on **left**, primary/safe on **right**
- Lock body scroll when open (`body { overflow: hidden }`)
- Close on overlay click + Escape key
- Focus trap inside modal; first focusable element receives focus on open
- Use `aria-modal="true"` and `role="dialog"`
- Exit animation via `dgem-modal-closing` class – delay unmount 150ms
- Confirmation dialogs have **no Cancel button** – close icon + overlay click serve that purpose
