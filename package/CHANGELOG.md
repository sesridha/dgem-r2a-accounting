# Changelog

All notable changes to this package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.4] - 2026-06-26

### Fixed

- **Browser compatibility (Safari/iOS).** Added the missing `-webkit-` prefixes in
  the source CSS (the build already autoprefixed `dist/dgem.css`; this makes the
  source files self-correct and clears editor warnings):
  - `.dgem-select` – `-webkit-appearance` now precedes the standard `appearance`.
  - `.dgem-datepicker-title`, `.dgem-datepicker-weekday` – added `-webkit-user-select`.
  - `.dgem-modal-overlay` – added `-webkit-backdrop-filter`.

## [1.0.3] - 2026-06-26

### Added

- `.dgem-card--shadow` modifier – opt-in multi-layer elevation (`var(--shadow-card)`)
  for cards that need resting shadow.

### Changed

- Cards are now **flat by default** (no resting shadow). The `14-cards.md` spec
  was corrected to match the CSS (it previously documented a default shadow that
  the component did not apply); elevation is now opt-in via `.dgem-card--shadow`.
- **Docs validated against the 1.0.2 token migration.** Corrected dark-mode
  values in `22-dark-theme.md` (page background `#0E1430`, content surfaces
  `#121A38`, sidebar/cards `#182044`), added the `--color-page-bg` alias row to
  `02-colors.md`, and updated `12-forms.md`, `13-tags-chips-status.md`,
  `14-cards.md`, and `15-tables-pagination.md` to the adaptive `--color-*`
  tokens. Fixed the stale `var(--color-grey-100)` reference and the incorrect
  switcher active-colour annotation in the spec.

## [1.0.2] - 2026-06-26

### Fixed

- **Build** – `npm run build` no longer fails. The Tailwind CLI errored on
  `@layer components` (no matching `@tailwind components` in the input) and, even
  when present, purged every `dgem-*` class because `content` is empty. The build
  now bundles `src/index.css` via PostCSS (`postcss-import` + `autoprefixer` +
  `cssnano`), flattening `@layer` so the standalone `dist/dgem.css` contains all
  component classes. See `scripts/build.js`.
- **Lint** – `npm run lint` no longer fails with `stylelint: command not found`.
  Added `stylelint` + `stylelint-config-standard` and a `.stylelintrc.json`
  tuned to the codebase conventions.
- `.dgem-switcher-item:hover` – fixed undefined `var(--color-grey-100)` token
  (the alias does not exist); now uses `var(--color-muted)`.
- `package.json` `version` synced with the release tag.

### Changed

- **Dark mode** – migrated the component styles in `src/css/components.css` from
  hardcoded hex colors (164 occurrences) to design tokens. Neutral surfaces,
  text, and borders now use the adaptive `--color-*` aliases so they respond to
  `class="dark"`; brand and status colors use the constant brand/semantic tokens.
  Light appearance is preserved.
- `tokens.css` – added a dark-theme value for `--color-page-bg` so the page
  background darkens in dark mode.
- **Component CSS split** – `src/css/components.css` is now a barrel that
  `@import`s topic partials in `src/css/components/` (`buttons.css`, `forms.css`,
  `data-display.css`, `feedback.css`, `navigation.css`, `modals.css`). The public
  `./components` export and the built `dist/dgem.css` are unchanged (verified:
  every selector has identical computed declarations).
- **Docs** – aligned all documentation and source comments to the canonical
  package name `@dgem/design-system` (previously a mix with `@dgem/tailwind-css`).
  Updated `AGENTS.md`, `CLAUDE.md`, `README.md`, `docs/design-system/*`, and
  `.github/instructions/*` (plus `.github/copilot-instructions.md`) to reflect the
  new source layout and build/lint setup.

### Removed

- **Icon-font CSS** – deleted the deprecated `src/css/icons.css` and
  `src/css/material-symbols.css` (icon fonts were already replaced by Lucide
  React) and their orphaned font assets under `src/assets/fonts/`
  (`dgem-icons*`, `dgem-icons-legacy*`, `MaterialSymbolsOutlined.*`, ~4 MB).
- **`./icons` package export** – removed from `package.json` (the file it pointed
  at no longer exists). This is the only breaking change in this release; nothing
  in the platform imported it.

## [1.0.1]

### Fixed

- `.dgem-tag`, `.dgem-tag-new`, `.dgem-tag-updated` – `border-radius` changed
  from `0.25rem`/`0.125rem` (square) to `9999px` (pill) to match the design
  system's pill-shaped language used by chips, status labels, and buttons.
- `.dgem-btn-md` – font-size changed from `0.875rem` (14px) to `1rem` (16px)
  per the button sizing spec.
- `.dgem-table th`, `.dgem-table td` – padding changed from `0.75rem 1.25rem`
  (12px 20px) to `0.75rem 1rem` (12px 16px) per the table spec.
- `.dgem-progress-step-pending` – background changed from `#FFFFFF` to
  `#E5E5E5` per the progress indicator spec.
- `.dgem-switcher-item__count` – changed from pill (`min-width` + horizontal
  padding + `border-radius: 9999px`) to a fixed-size circle (`width: 1.25rem`,
  `height: 1.25rem`, `border-radius: 50%`, no padding).
- `docs/design-system/13-tags-chips-status.md` – added explicit Border Radius
  column (`9999px (pill)`) to the Tags spec table so agents know tags are pills.
  Updated Switcher token table and count badge description to match CSS.

### Added

- `AGENTS.md` as the single source of truth for AI coding agents (Cursor, Codex,
  Aider, Claude Code, Copilot). Covers package overview, non-negotiable rules,
  source layout, edit locations, mirroring rule, workflow, and verification
  commands.
- `docs/design-system/` directory containing the visual specification split into
  27 per-topic files (colors, typography, spacing, components, etc.) for
  token-efficient agent loading.
- `docs/design-system/README.md` index with three loading tiers (always-load
  foundations, optional foundations, components), loading recipes per task type,
  and an explicit agent workflow.
- `.github/copilot-instructions.md` for repo-wide GitHub Copilot rules.
- `.github/instructions/` directory with 9 scoped instruction files
  (`foundations`, `buttons`, `forms`, `modals`, `navigation`, `data-display`,
  `feedback`, `icons-logos`, `package-internals`). Each uses an `applyTo` glob
  so VS Code Copilot loads the right one based on the file being edited.
- `CLAUDE.md` as a thin pointer to `AGENTS.md`.
- `CHANGELOG.md` (this file).

### Changed

- `README.md` rewritten to focus on npm package consumers (install, exports,
  usage, asset imports). Removed duplicated agent and design system content.
- Heading numbering stripped from all 27 per-topic files in
  `docs/design-system/`. Headings now use plain topic names instead of
  `## 3. Color System` etc., giving stable kebab-cased anchors.
- Cross-references between topic files now use relative file paths instead of
  the legacy `§N.M` notation.
- Stale anchor `(#22-css-imports)` in `25-css-architecture.md` replaced with a
  link to `01-package-integration.md`.

### Removed

- `DESIGN_SYSTEM_CONSTITUTION.md`. Its content was split into
  `docs/design-system/*.md`. The discovery surface is now `AGENTS.md` and
  `docs/design-system/README.md`.

### Notes

- No design tokens, rules, or component specifications were modified. Only the
  documentation structure, headings, and cross-references changed.
- Agent guidance is no longer duplicated across multiple files. `AGENTS.md` is
  canonical; `CLAUDE.md` and `.github/copilot-instructions.md` defer to it.

## [1.0.0]

- Initial public release.

---
*End of Document*
