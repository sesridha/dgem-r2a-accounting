---
applyTo: "**/{[Cc]ard,[Tt]able,[Tt]ag,[Cc]hip,[Ss]tatus,[Pp]agination,[Ss]witcher}*.{vue,tsx,jsx,svelte,html,css,scss}"
---

# DGEM Data Display

When working on cards, tables, tags, chips, or status labels, read the relevant file in `docs/design-system/`:

- `13-tags-chips-status.md` – tags, chips, status labels, switcher
- `14-cards.md` – cards
- `15-tables-pagination.md` – tables, pagination

## Quick rules

- Cards use 16px border radius (`dgem-card`), white bg, multi-layer shadow
- Interactive/clickable cards: add `dgem-card--interactive` (flips dark on hover)
- Card body padding: 16px standard
- Tags: `dgem-tag-grey` / `-dark` for categories; `dgem-tag-new` / `-updated` for news (10px uppercase)
- Status labels: use predefined classes (`dgem-status-active`, `-on-hold`, `-draft`, `-scheduled`, `-completed`)
- Chips are pill-shaped (24px high), interactive – use for filter sets
- Prefer `dgem-switcher` (segmented control) over standalone chips for mutually-exclusive filters
- Tables: 14px body, 12px Medium header (`text-muted-foreground`), 12px/16px cell padding
- Pagination items: 36×36px pill, active background `#0058AB` white text
