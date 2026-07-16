---
applyTo: "**/{[Ii]nput,[Ff]orm,[Ss]elect,[Tt]extarea,[Ff]ield,[Cc]heckbox,[Rr]adio,[Ss]witch,[Dd]ate[Pp]icker,[Ss]earch}*.{vue,tsx,jsx,svelte,html,css,scss}"
---

# DGEM Form Controls

When working on form controls, read `docs/design-system/12-forms.md` for the full spec.

## Quick rules

- Inputs: 40px height, 4px border radius, focus border `#1DB8F2`
- Labels go **above** inputs with 4px gap (never inline)
- Form field vertical spacing: 16px between groups
- Required fields: asterisk in label – never rely on color alone
- Error text: red `#E30021`, 12px, 4px below the input
- Use `dgem-input-error`, `dgem-select-error` for invalid state
- Search bars use `dgem-search` (pill-shaped) – do **not** combine with `dgem-input`
- Always debounce search input (300ms)
- Never use native `<input type="date">` – always the DGEM DatePicker
- Compact DatePicker (32px) only in toolbars/filters; standard (40px) elsewhere
