## CSS Architecture & Class Naming

### Design Token Import

See [`01-package-integration.md`](01-package-integration.md) for import paths. Selective imports allow smaller bundles when only specific features are needed.

### Naming Convention

All DGEM component classes use the `dgem-` prefix:

```
dgem-btn, dgem-btn-filled-dark, dgem-btn-lg
dgem-card, dgem-card-body
dgem-input, dgem-input-error
dgem-modal, dgem-modal-overlay
dgem-tag, dgem-tag-grey
dgem-status, dgem-status-active
dgem-chip, dgem-chip-selected
dgem-table, dgem-pagination
dgem-sidebar, dgem-sidebar-link
dgem-link, dgem-link-light
```

### Token Usage in Components

Use Tailwind utility classes with semantic tokens (defined in `tailwind.config.js`) and `dgem-*` classes for brand-specific patterns:

```html
<!-- Tailwind utilities resolve to DGEM theme values -->
<div class="bg-background text-foreground border-border"></div>
<button class="bg-primary text-primary-foreground"></button>
<span class="text-muted-foreground"></span>

<!-- dgem-* classes for brand-specific behaviors (animated buttons, nav links, etc.) -->
<button class="dgem-btn dgem-btn--filled"></button>
<a class="dgem-nav-link text-sm"></a>

<!-- CSS custom properties for dynamic or inline values (rare) -->
<div style="color: var(--color-foreground);"></div>
```

**Always use CSS custom properties** (`var(--dgem-blue)`) or their Tailwind equivalents (`bg-primary`, `text-foreground`) – never hardcode hex values.

### Source file structure (editing the package)

When editing `@dgem/design-system` itself, styles live in these files:

```
src/css/
├── tokens.css            # CSS custom properties (design tokens) – the single source of truth
├── typography.css        # .text-* / .dgem-* typography classes
├── components.css        # Barrel: @imports the components/ partials below
├── components/
│   ├── buttons.css       # buttons, links
│   ├── forms.css         # input, textarea, select, switch, search, date picker
│   ├── data-display.css  # tags, switcher, chips, cards, table
│   ├── feedback.css      # progress, toast
│   ├── navigation.css    # sidebar, tree, header, nav link, page background
│   └── modals.css        # modal
└── utilities.css         # color shortcuts, scrollbar, line-clamp
```

**Where a component style goes** (maps spec topic → source partial):

| Spec topic | Partial |
|---|---|
| [10-buttons.md](10-buttons.md), [11-links.md](11-links.md) | `components/buttons.css` |
| [12-forms.md](12-forms.md) | `components/forms.css` |
| [13-tags-chips-status.md](13-tags-chips-status.md), [14-cards.md](14-cards.md), [15-tables-pagination.md](15-tables-pagination.md) | `components/data-display.css` |
| [18-toasts.md](18-toasts.md), [19-progress.md](19-progress.md) | `components/feedback.css` |
| [16-navigation.md](16-navigation.md) | `components/navigation.css` |
| [17-modals.md](17-modals.md) | `components/modals.css` |

Rules:

- Each partial wraps its rules in `@layer components { … }` so that, in a Tailwind
  project, utility classes still override component classes. Keep this wrapper.
- Component classes use **adaptive `--color-*` aliases** for neutral surfaces,
  text, and borders (they switch in dark mode) and **constant brand/semantic
  tokens** (`--dgem-*`, `--color-red/-yellow/-green`) for brand and status colors.
- Icon fonts are **not** shipped – the package contains no `icons.css`. Apps use
  [Lucide React](https://lucide.dev) (see [09-icons.md](09-icons.md)).

### Build & lint

- `npm run build` bundles `src/index.css` into `dist/dgem.css` via PostCSS
  (`postcss-import` + `autoprefixer` + `cssnano`), flattening the component layer
  for the standalone build. `dist/` is a build artifact and is not committed.
- `npm run lint` runs `stylelint` (config: `.stylelintrc.json`).
- After any change, run both and test dark mode (`class="dark"` on an ancestor).
