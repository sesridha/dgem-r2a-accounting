## Navigation & Sidebar

### Top Navigation Bar (Header)

The header is a sticky bar at the top of every page. Use the `.app-header` CSS class.

| Property | Value |
|----------|-------|
| Height | `56px` (`3.5rem`, `h-14`) |
| Position | `sticky top-0 z-40` |
| Background | White (`#FFFFFF`) in light mode, `hsl(227 47% 15%)` in dark mode |
| Border bottom | `1px solid var(--color-border)` |
| Padding | `0 24px` |
| Layout | `flex items-center justify-between` |

**Left section** (flex, gap `16px`):
- DGEM logo (`height: 32px`, from `@dgem/design-system/assets/logos/logo-dgem.svg`)
- **Vertical separator** – `height: 24px`, `width: 1px`, `background: #E5E5E5` (light) / `var(--border)` (dark)
- App title – `font-weight: 500`, `font-size: 14px`
- **Vertical separator** – same style as above
- Navigation links – see **17.1.1 Top Menu Link Behavior** below

> The app title sits **between two separators** – one after the logo, one before the nav links.

#### Top Menu Link Behavior

Every top-menu navigation item uses the `.dgem-nav-link` CSS class, which renders a **1 px underline** via a `background` gradient (`linear-gradient`) positioned at the bottom of the text. The underline is **not** a `text-decoration` – it is a `background-size` / `background-position` trick that enables smooth keyframe animation.

**Three visual states:**

| State | Underline | Animation |
|-------|-----------|-----------|
| **Active** (current page) | Visible – solid 1 px line under text | None (static underline) |
| **Inactive** (other pages) | Hidden | On hover: underline sweeps in via `text-underline` keyframe |
| **Hover** (inactive link) | Animates in, then out | `text-underline` – 0.6 s, runs once, `forwards` |

**How it works technically:**

- `.dgem-nav-link` defines `background: linear-gradient(…) no-repeat 0 100% / 100% 1px` – a full-width 1 px line at the bottom.
- **Active link**: Keep the default `background-size: 100% 1px` so the underline is always visible.
- **Inactive link**: Override with `background-size: 0 1px` to hide the underline. **Do NOT use `background: none`** – the gradient must remain defined so the `:hover` animation keyframes can manipulate `background-size`.
- On hover, the `@keyframes text-underline` animation sweeps the line from left → shrink to zero → reappear from right → shrink to zero.

**Implementation pattern** (React Router `NavLink`):

```tsx
<NavLink
  to="/page"
  className="dgem-nav-link text-sm"
  style={({ isActive }) =>
    isActive ? undefined : { backgroundSize: "0 1px" }
  }
>
  Page Title
</NavLink>
```

> Use `style` (inline) for the active/inactive toggle – not a class override – because adding `!bg-none` or `background: none` via Tailwind removes the gradient entirely and breaks the hover animation.

> For routes like `/requests` that should only match exactly (not sub-paths), add `end` prop: `<NavLink to="/requests" end …>`.

**Right section** (flex, gap `12px`, **always pushed to the right edge** via `justify-content: space-between` on the header):

Items appear in this exact order, left to right:

1. **Context-specific controls** (optional) – collaboration bar, quick actions, page-specific buttons
2. **Logout button** – `padding: 8px`, `border-radius: 50%`, hover `background: var(--muted)`, transition `150ms`. Icon: `<LogOut size={16} />`
3. **User initials avatar** – `24×24px` circle, `border: 1px solid` with `50%` opacity foreground, **no background fill**. Initials text: `font-size: 9px`, `line-height: 1`, `uppercase`, `user-select: none`. Add `padding-top: 1px` (`pt-px`) to optically center the initials vertically within the circle.

> **No separator** in the right section. The separator between left and right is achieved by `justify-content: space-between` on `.app-header`.

**Initials logic**: Derive from the user's real name – first character of first name + first character of last name, uppercased. Never show a generic placeholder like "U" when the user's name is available.

```
// Example: derive initials from a full name string
const parts = user.name.split(" ");
const initials = parts.length >= 2
  ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  : parts[0]?.[0]?.toUpperCase() || "?";
```

> **Do NOT** show the user's name as text in the header. Only the initials avatar is displayed.

```html
<!-- Header structure -->
<header class="app-header">
  <!-- Left: logo | title | nav -->
  <div style="display: flex; align-items: center; gap: 16px;">
    <img src="logo-dgem.svg" alt="DGEM" style="height: 32px;" />
    <div style="height: 24px; width: 1px; background: #E5E5E5;"></div>
    <h1 style="font-weight: 500; font-size: 14px;">App Title</h1>
    <div style="height: 24px; width: 1px; background: #E5E5E5;"></div>
    <a href="/" class="dgem-nav-link text-sm">Home</a>
    <a href="/section" class="dgem-nav-link text-sm">Section</a>
  </div>
  <!-- Right: logout → initials avatar -->
  <div style="display: flex; align-items: center; gap: 12px;">
    <button aria-label="Log out" style="padding: 8px; border-radius: 50%;">
      <LogOut size={16} />
    </button>
    <div style="width: 24px; height: 24px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; font-size: 9px; text-transform: uppercase;">
      SM
    </div>
  </div>
</header>
```

For the main DGEM platform, the header includes module navigation links (Core, Exchange, Score, etc.) with their colored icons. Active module gets highlighted text.

#### Navigation Placement Rules

**Primary (top-level) navigation always lives in the header.** All DGEM applications place their main menu links in the `.app-header`, using `.dgem-nav-link` items with the animated underline. This is the standard pattern for every DGEM module – Studio Manager, LLM Gateway, and any future app.

**The sidebar is optional.** Only add a sidebar when the application has **secondary or hierarchical navigation** (e.g., a tree menu, filter panel, or sub-section drill-down within a primary page). If the app's entire navigation is flat (a handful of top-level pages), **do not render a sidebar** – the header nav links are sufficient.

| App complexity | Navigation pattern |
|----------------|-------------------|
| Flat (≤ 8 top-level pages) | Header nav links only, no sidebar |
| Hierarchical (sub-pages, tree menus) | Header nav links **+** sidebar for the active section |
| Content-heavy (filters, secondary lists) | Header nav links **+** sidebar as a filter/list panel |

> **Rule:** Never duplicate the same links in both the header and the sidebar. The header owns top-level navigation; the sidebar owns everything below that.

### Sidebar

| Property | Value |
|----------|-------|
| Width | `306px` (fixed), collapsible to `14px` |
| Background | `#FAFAFA` |
| Border right | `1px solid var(--color-border)` |
| Inner padding | `8px 24px 24px` |
| Toggle button | `24×24px`, positioned at `right: -12px` |
| Collapse transition | `width 500ms ease` |

### Sidebar Links

```html
<a class="dgem-sidebar-link">
  <i class="icon-folder"></i> Item Label
</a>
<a class="dgem-sidebar-link dgem-sidebar-link-active">
  Active Item
</a>
```

| Property | Value |
|----------|-------|
| Font size | 14px |
| Padding | `8px 16px` |
| Hover | `background: var(--color-muted)` |
| Active | `background: var(--color-muted)`, `font-weight: 500`, primary color text |

### Tree Menu (Sidebar)

Used in Core/Exchange sidebars for hierarchical navigation:
- Levels 0–5 with increasing indentation (20px per level)
- Caret indicator (expand/collapse)
- Checkbox (optional, for multiselect trees)
- Icons: folder open/closed, blueprint, file
- Trail lines connecting parent-child nodes

### Footer

The footer is a minimal brand bar **always visible** at the bottom of the viewport. Because the app shell uses `h-screen` + `overflow-hidden` (see [`04-spacing-layout.md`](04-spacing-layout.md)), the footer never scrolls out of view – only the `<main>` content area scrolls.

| Property | Value |
|----------|-------|
| Height | `64px` (`h-16`) |
| Padding | `0 16px` (`px-4`) |
| Background | White (light), `var(--card)` (dark) |
| Border top | `1px solid #E5E5E5` (light), `1px solid var(--border)` (dark) |
| Layout | `flex items-center` |
| Flex shrink | `shrink-0` – prevents collapse when content is tall |
| Capgemini logo | `max-w-[24px]`, right-aligned (`ml-auto`) |

```html
<!-- Footer structure (always visible, never scrolls) -->
<footer class="h-16 border-t border-grey-200 bg-white flex items-center px-4 shrink-0">
  <img src="logo-cap-small.svg" alt="Capgemini" class="ml-auto max-w-[24px] h-auto" />
</footer>
```

The footer may be conditionally shown (e.g. hidden on the root/home page). It may also include additional nav links and upward-opening dropdowns (`min-width: 300px`, `border-radius: 8px`).
