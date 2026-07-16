---
applyTo: "**/{[Hh]eader,[Ff]ooter,[Ss]idebar,[Nn]av,[Mm]enu,[Ll]ayout,[Ss]hell,[Aa]pp[Ss]hell,[Tt]ree}*.{vue,tsx,jsx,svelte,html,css,scss}"
---

# DGEM Navigation & Layout

When working on navigation or app shell, read these files in `docs/design-system/`:

- `04-spacing-layout.md` – page layout structure
- `16-navigation.md` – header, sidebar, tree menu, footer
- `23-logos.md` – logo placement rules

## Quick rules

### App shell
- Viewport-locked: outer wrapper `h-screen overflow-hidden`
- Only `<main>` scrolls (`flex-1 overflow-y-auto`)
- Header (`56px`) and footer (`64px`) are `shrink-0`, always visible
- Page background `#F3F4F5`, **not** white

### Header (`.app-header`)
- Sticky `top-0 z-40`, white bg light / `hsl(227 47% 15%)` dark
- Left: logo (32px) | separator | app title (14px/500) | separator | nav links
- Right: context controls → logout button (icon-only circle) → 24×24 initials avatar
- Nav links use `dgem-nav-link` class with animated underline
- Active link: keep `background-size: 100% 1px` (do **not** set `background: none`)
- Inactive link: override with inline style `{ backgroundSize: '0 1px' }`
- Initials avatar: derived from user name (first + last initial), 9px uppercase
- Never show user's name as text – only the initials avatar

### Sidebar
- Optional – only when app has hierarchical/secondary navigation
- Width: 306px (collapsible to 14px), `#FAFAFA` bg
- Never duplicate top-level links between header and sidebar

### Footer
- 64px high, white bg, top border, Capgemini spade right-aligned (24px max-width)
- Always visible (never scrolls)
