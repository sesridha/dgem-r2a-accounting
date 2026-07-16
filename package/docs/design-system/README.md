# DGEM Design System – Reference

The canonical visual specification for the DGEM platform, split into focused files for token-efficient agent loading.

> **For agents:** load only the files relevant to the current task. The "Always load" files apply to virtually every UI change. Component files are scoped to specific work.

## Always load (foundations)

These rules apply to almost every UI change:

| File | Topic |
|---|---|
| [02-colors.md](02-colors.md) | Brand palette, neutrals, semantic colors, theme aliases, color rules |
| [03-typography.md](03-typography.md) | Ubuntu font, type scale, weight rules |
| [04-spacing-layout.md](04-spacing-layout.md) | Base-4 spacing, page layout, app shell |
| [25-css-architecture.md](25-css-architecture.md) | `dgem-` prefix, token usage |
| [26-do-dont.md](26-do-dont.md) | Quick rules summary |

## Optional foundations (load when relevant)

| File | Topic |
|---|---|
| [00-platform-identity.md](00-platform-identity.md) | DGEM brand, module list |
| [01-package-integration.md](01-package-integration.md) | `@dgem/design-system` install, imports, config |
| [05-breakpoints.md](05-breakpoints.md) | Responsive breakpoints |
| [06-shadows.md](06-shadows.md) | Elevation tokens |
| [07-border-radius.md](07-border-radius.md) | Radius scale |
| [08-transitions.md](08-transitions.md) | Animation tokens |
| [21-z-index.md](21-z-index.md) | Z-index layers |
| [22-dark-theme.md](22-dark-theme.md) | Dark mode overrides |
| [24-accessibility.md](24-accessibility.md) | A11y requirements |

## Components (load only when working on that component)

| File | When to load |
|---|---|
| [09-icons.md](09-icons.md) | Icons (Lucide React) |
| [10-buttons.md](10-buttons.md) | Buttons (`dgem-btn*`) |
| [11-links.md](11-links.md) | Links and nav-links (`dgem-link*`, `dgem-nav-link`) |
| [12-forms.md](12-forms.md) | Inputs, textareas, selects, checkboxes, switches, search bars, date pickers, wizards |
| [13-tags-chips-status.md](13-tags-chips-status.md) | Tags, chips, status labels, switcher |
| [14-cards.md](14-cards.md) | Cards (`dgem-card*`) |
| [15-tables-pagination.md](15-tables-pagination.md) | Tables, pagination |
| [16-navigation.md](16-navigation.md) | Header, sidebar, footer, tree menu |
| [17-modals.md](17-modals.md) | Modals, popups, confirmation dialogs |
| [18-toasts.md](18-toasts.md) | Toast notifications |
| [19-progress.md](19-progress.md) | Progress bars, steppers, loaders |
| [20-scrollbars.md](20-scrollbars.md) | Custom scrollbars |
| [23-logos.md](23-logos.md) | Logo usage rules |

## Loading recipes

| Task | Load |
|---|---|
| Build any new component | always-load + the matching component file |
| Tweak a button | always-load + `10-buttons.md` |
| Add a form field | always-load + `12-forms.md` (+ `09-icons.md` if icon used) |
| Build a modal | always-load + `17-modals.md` (+ `10-buttons.md` for footer) |
| Add page header | always-load + `16-navigation.md` (+ `23-logos.md`) |
| Update tokens | `02-colors.md` + `25-css-architecture.md` |
| Dark mode work | `02-colors.md` + `22-dark-theme.md` + the affected component file |

## Workflow for agents

1. **Identify the topic.** Use the tables above to pick the file(s) to read.
2. **Implement the change** using `dgem-*` classes / CSS variables. Never hardcode tokens.
3. **Update the matching topic file** in this folder if the component's behavior or API changed.
4. **Verify** with `npm run lint` and `npm run build` from the repo root.
5. **Test dark mode** by applying `class="dark"` to an ancestor – all `var(--color-*)` aliases must keep working.

> Cross-references between files use relative paths (e.g. `[10-buttons.md](10-buttons.md)`). Heading anchors are kebab-cased section names (no leading numbers).
