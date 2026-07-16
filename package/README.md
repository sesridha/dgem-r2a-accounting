# `@dgem/design-system`

Centralized design tokens, typography, component styles, and a Tailwind CSS plugin for the **DGEM** (Digital Global Enterprise Model) platform.

Framework-agnostic: works with Vue, React, vanilla, or any other stack.

## Install

```bash
npm install @dgem/design-system
```

## Quick start

### Tailwind project

`tailwind.config.js`:

```js
const dgemConfig = require("@dgem/design-system/tailwind-config");
const dgemPlugin = require("@dgem/design-system/tailwind-plugin");

module.exports = {
  presets: [dgemConfig],
  plugins: [dgemPlugin],
  content: [/* your content paths */],
};
```

Main stylesheet:

```css
@import "@dgem/design-system/tokens";
```

### Non-Tailwind project

Import the precompiled bundle:

```js
import "@dgem/design-system";
```

Or use SCSS variables:

```scss
@use "@dgem/design-system/scss/variables" as dgem;

.my-button {
  background: dgem.$dgem-blue;
  color: dgem.$white;
  font-family: dgem.$font-family-sans;
}
```

### Cherry-pick modules

```css
@import "@dgem/design-system/tokens";
@import "@dgem/design-system/typography";
@import "@dgem/design-system/components";
```

## Package exports

| Import path | Content |
|---|---|
| `@dgem/design-system` | Everything (tokens + typography + components + utilities) |
| `@dgem/design-system/tokens` | CSS custom properties only |
| `@dgem/design-system/typography` | Typography classes |
| `@dgem/design-system/components` | `dgem-*` component styles (barrel over `src/css/components/`) |
| `@dgem/design-system/utilities` | Color shortcuts, scrollbar, line-clamp |
| `@dgem/design-system/tailwind-config` | Sharable Tailwind theme preset |
| `@dgem/design-system/tailwind-plugin` | Tailwind plugin (typography + button base) |
| `@dgem/design-system/scss/variables` | SCSS mirror of design tokens |

## Using assets

```js
// Brand and module logos
import dgemLogo from "@dgem/design-system/assets/logos/logo-dgem.svg";
import coreLogo from "@dgem/design-system/assets/logos/logo-core.svg";

// Icons – use Lucide React (npm install lucide-react)
// import { Search, X, ChevronRight } from "lucide-react";
// <Search size={16} />

// Illustrative SVG icons
import icon1 from "@dgem/design-system/assets/icons/icon-1.svg";
```

## Design system documentation

The full visual specification is in [`docs/design-system/`](docs/design-system/) – colors, typography, spacing, components, icons, dark mode, accessibility. Start with [`docs/design-system/README.md`](docs/design-system/README.md).

For the rendered design system explanation, see the Knowledge Base: <https://kb.dgem.capgemini.com/docs/design/>.

## Working with AI coding agents

This repository is designed to be consumed by AI coding agents (Claude Code, GitHub Copilot, Cursor, Codex, Aider, etc.). [`AGENTS.md`](AGENTS.md) is the **single source of truth**; every other agent file defers to it.

### How agent guidance is layered

| File | Used by | Role |
|---|---|---|
| [`AGENTS.md`](AGENTS.md) | Cursor, Codex, Aider, and the canonical reference | Full ruleset, source layout, workflow |
| [`CLAUDE.md`](CLAUDE.md) | Claude Code | Thin pointer → defers to `AGENTS.md` |
| [`.github/copilot-instructions.md`](.github/copilot-instructions.md) | GitHub Copilot (web/CLI) | Quick-reference rules → defers to `AGENTS.md` |
| [`.github/instructions/*.instructions.md`](.github/instructions/) | VS Code Copilot (chat) | Component-scoped rules, auto-applied via `applyTo` globs |
| [`docs/design-system/`](docs/design-system/) | All agents | The visual specification, split per topic for token-efficient loading |

VS Code Copilot auto-loads the matching instruction file based on the edited filename — e.g. editing `Button.vue` applies `buttons.instructions.md`, editing `Modal.tsx` applies `modals.instructions.md`. You do not need to reference them manually.

### Setup

- **Claude Code / Cursor / Aider / Codex** — open the repo at its root; the agent discovers `AGENTS.md` / `CLAUDE.md` automatically. No extra configuration is required.
- **GitHub Copilot in VS Code** — `.github/copilot-instructions.md` and `.github/instructions/*.instructions.md` are picked up automatically. Keep "Use Instruction Files" enabled in settings.
- **Consuming apps (Vue/React)** — when an agent works in a downstream app, point it at this package's `AGENTS.md` (or copy the non-negotiable rules into that app's own agent file) so it inherits the design-system constraints.

### Recommended agent workflow

1. **Load the right tier.** Start from [`docs/design-system/README.md`](docs/design-system/README.md) — it is the index that tells the agent which topic files to load. Load **Foundations** (colors, typography, spacing, css-architecture, do-dont) for every UI change; load **component** files only when touching that component.
2. **Implement** using `dgem-*` classes and `var(--color-*)` / Tailwind aliases. Never hardcode tokens.
3. **Mirror token changes** across `src/css/tokens.css`, `tailwind.config.js`, and `src/scss/_variables.scss` — they must always agree.
4. **Update the spec** in `docs/design-system/<topic>.md` whenever behavior or API changes.
5. **Verify** with `npm run lint` and `npm run build`, then test dark mode (`class="dark"` on an ancestor).

### Do's

- **Do** read `AGENTS.md` first and treat the [non-negotiable rules](AGENTS.md#non-negotiable-rules) as hard constraints.
- **Do** keep changes scoped — only touch the token/component file relevant to the request.
- **Do** keep `tokens.css`, `tailwind.config.js`, and `_variables.scss` in sync in the same change.
- **Do** prefer existing `dgem-*` classes and semantic tokens over inventing new ones.
- **Do** run `npm run lint` and `npm run build` before declaring a change complete.

### Don'ts

- **Don't** hardcode hex colors, odd-pixel spacing, or font sizes below 12px.
- **Don't** add framework-specific code (React/Vue components) — this package is framework-agnostic.
- **Don't** reintroduce icon fonts; use Lucide React for all icons.
- **Don't** edit only one of the three token mirrors — that silently breaks consumers.
- **Don't** duplicate rules into new agent files; update `AGENTS.md` and let the others defer to it.

### Spec-driven development

This package follows a **spec-first** model: the documentation in [`docs/design-system/`](docs/design-system/) is the contract, and the code in `src/` is its implementation. Treat the spec as authoritative.

**Best practices**

- **Spec before code.** When introducing or changing a token, component, or behavior, update (or write) the relevant `docs/design-system/<topic>.md` section first, then implement it. The PR should change both together.
- **One topic per file.** Keep specs split by topic (colors, typography, buttons, …) so agents load only what they need and diffs stay focused.
- **Keep code and spec in lockstep.** A change is incomplete if the spec and implementation disagree — reviewers (human or agent) should reject drift.
- **Encode rules as constraints.** Express requirements as explicit do/don't rules (see [`docs/design-system/26-do-dont.md`](docs/design-system/26-do-dont.md)) so agents can apply and verify them deterministically.
- **Verifiable acceptance.** Every spec change should be checkable via `npm run lint`, `npm run build`, and a dark-mode pass — prefer rules an agent can self-verify.

**Setup for spec-driven work**

1. Identify the topic and open its `docs/design-system/<topic>.md`.
2. Write or amend the spec (intended tokens, class names, behavior, do/don't notes).
3. Implement in `src/`, mirroring token changes across the three sources.
4. Re-read the spec and confirm the implementation matches exactly.
5. Lint, build, and test dark mode.

**Do's / Don'ts**

- **Do** update the spec in the same change as the code; **don't** ship code that contradicts the docs.
- **Do** express new behavior as testable rules; **don't** rely on tribal knowledge that isn't written down.
- **Do** keep specs minimal and unambiguous; **don't** describe multiple unrelated changes in one topic file.

## Local development

```bash
npm install
npm run build        # bundle src/index.css → dist/dgem.css (PostCSS + cssnano, minified)
npm run build:watch  # watch mode
npm run lint         # stylelint
```

## Contributing

1. Design originates in **Figma**.
2. Update the relevant token / CSS file in `src/`.
3. Update the matching topic file in [`docs/design-system/`](docs/design-system/).
4. Run `npm run lint` and `npm run build`. Test dark mode (`class="dark"` on an ancestor).
5. Bump the version in `package.json` (semver).
