# AGENTS.md – Working in `@dgem/design-system`

> Single source of truth for AI coding agents (Claude Code, Cursor, Codex, Aider, GitHub Copilot, etc.). Other agent files (`CLAUDE.md`, `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`) defer to this file.

## What this repo is

`@dgem/design-system` is the **centralized design token package** for the DGEM (Digital Global Enterprise Model) platform. It ships:

- CSS custom properties (`src/css/tokens.css`)
- A Tailwind theme preset (`tailwind.config.js`)
- Component classes (`src/css/components.css`)
- Typography classes (`src/css/typography.css`)
- Icon guidance (use Lucide React – see `docs/design-system/09-icons.md`)
- A SCSS mirror of tokens (`src/scss/_variables.scss`)

It is **framework-agnostic** – consumed by Vue, React, and other DGEM frontend apps. It must never depend on a specific UI framework.

## How to find what you need

The visual specification lives in [`docs/design-system/`](docs/design-system/), split per topic for token-efficient loading.

**Start with [`docs/design-system/README.md`](docs/design-system/README.md)** – it is the index. It tells you which files to load for a given task.

Three tiers:

| Tier | When to load |
|---|---|
| **Foundations** (colors, typography, spacing, css-architecture, do-dont) | Every UI change |
| **Optional foundations** (breakpoints, shadows, radius, transitions, z-index, dark-theme, a11y) | When relevant to the change |
| **Components** (buttons, forms, modals, cards, …) | Only when working on that component |

For VS Code Copilot, the matching `.github/instructions/*.instructions.md` file is auto-applied based on the edited filename (e.g. `Button.vue` triggers `buttons.instructions.md`).

## Non-negotiable rules

These rules apply to **all** UI code in the DGEM platform. Violations produce incorrect UI.

1. **Never hardcode hex colors.** Use `var(--color-*)` aliases or Tailwind utilities (`bg-primary`, `text-foreground`).
2. **All custom CSS classes use the `dgem-` prefix.**
3. **All buttons are pill-shaped** (`border-radius: 9999px`). Icon-only buttons use `dgem-btn--icon` and render as circles.
4. **Use [Lucide React](https://lucide.dev) for all UI icons.** Import from `lucide-react`. Never use icon fonts, Heroicons, Font Awesome, or Material Icons.
5. **Font is Ubuntu** (weights 300/400/500/700). Body default is 14px Regular. Never below 12px.
6. **Spacing is base-4** (4, 8, 12, 16, 24, 32, 40, 64). Never odd pixel values.
7. **Page background is the DGEM gradient** (`.gradient-bg`) over the warm grey base `#F3F4F5`, never plain white. It applies to every page, including login.
8. **Never reduce text opacity.** Use semantic tokens at full opacity (`text-foreground`, `text-muted-foreground`).
9. **Red = errors only. Blue = interactive only. Turquoise = accent only.**
10. **Dark mode uses CSS variables** – `class="dark"` (or `data-theme="dark"`) on any ancestor switches all `--color-*` aliases automatically.

Full Do/Don't matrix: [`docs/design-system/26-do-dont.md`](docs/design-system/26-do-dont.md).

## Editing this package – source layout

```
src/
├── css/
│   ├── tokens.css       # Design tokens (CSS custom properties)
│   ├── typography.css   # .text-h1, .text-body, etc.
│   ├── components.css   # Barrel – @imports the components/ partials
│   ├── components/      # dgem-* component styles, split per topic:
│   │   ├── buttons.css       # buttons, links
│   │   ├── forms.css         # input, textarea, select, switch, search, date picker
│   │   ├── data-display.css  # tags, switcher, chips, cards, table
│   │   ├── feedback.css      # progress, toast
│   │   ├── navigation.css    # sidebar, tree, header, nav link, page background
│   │   └── modals.css        # modal
│   └── utilities.css    # Color shortcuts, scrollbar, line-clamp
├── scss/_variables.scss # SCSS mirror of tokens.css
├── plugin.js            # Tailwind plugin (typography + button base)
├── assets/{icons,logos}/
└── index.css            # Entry point – imports all of the above
tailwind.config.js       # Sharable Tailwind theme preset
```

### Where new things go

| Adding | Goes in |
|---|---|
| A color token | `src/css/tokens.css` (+ mirror in `src/scss/_variables.scss` and `tailwind.config.js`) |
| A component style (`.dgem-foo`) | the matching `src/css/components/<topic>.css` partial |
| A typography class | `src/css/typography.css` (+ register in `src/plugin.js` if it's a utility) |
| A utility (color shortcut, scrollbar) | `src/css/utilities.css` |
| An icon | Use Lucide React – no CSS changes needed |
| A Tailwind plugin behavior | `src/plugin.js` |

**Component color tokens:** use the adaptive `--color-*` aliases for neutral surfaces, text, and borders (they switch automatically in dark mode) and the constant brand/semantic tokens (`--dgem-*`, `--color-red/-yellow/-green`) for brand and status colors. The package ships **no icon-font CSS** – use Lucide React.

### Mirroring rule

`tokens.css` ↔ `tailwind.config.js` ↔ `_variables.scss` must agree on all token values. When you change one, update all three.

## Workflow for any UI change

1. **Identify the topic.** Check [`docs/design-system/README.md`](docs/design-system/README.md) and load the matching file(s).
2. **Implement.** Use `dgem-*` classes / CSS variables. Never hardcode tokens.
3. **Update the spec** in `docs/design-system/<topic>.md` if behavior or API changed.
4. **Verify**:
   ```bash
   npm run lint     # stylelint
   npm run build    # produces dist/dgem.css
   ```
5. **Test dark mode** – apply `class="dark"` to an ancestor and confirm the change still works.

## Naming convention

- Platform name in copy: **DGEM** (not "DGEM 2.0").
- Full expansion on first mention only: DGEM (Digital Global Enterprise Model).
- All custom CSS classes: `dgem-<component>` or `dgem-<component>--<modifier>` (BEM).

## Commands

```bash
npm install          # first time
npm run build        # bundle src/index.css → dist/dgem.css (PostCSS + cssnano, minified)
npm run build:watch  # watch mode
npm run lint         # stylelint
```

## Pointers for specific agent tools

| Tool | Reads |
|---|---|
| Claude Code | `CLAUDE.md` → defers here |
| Cursor / Codex / Aider | `AGENTS.md` (this file) |
| GitHub Copilot (web/CLI) | `.github/copilot-instructions.md` → defers here |
| VS Code Copilot (chat) | `.github/instructions/*.instructions.md` (auto-scoped by `applyTo`) |
