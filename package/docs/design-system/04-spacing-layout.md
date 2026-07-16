## Spacing & Layout

### Spacing Scale

DGEM uses a base-4 spacing scale. The most common values:

| Token | Value | Usage |
|-------|-------|-------|
| `4px` | 0.25rem | Label-to-input gap, tight internal spacing |
| `8px` | 0.5rem | Checkbox gap, tag gap, small grid gutter, nav sub-item indent |
| `12px` | 0.75rem | Dropdown padding, mobile gutter |
| `16px` | 1rem | **Standard unit** – container padding, button horizontal padding, card padding, form block margin, grid gutter |
| `24px` | 1.5rem | Section heading margin-bottom, popup/modal padding, expander inner, header horizontal padding, column gutter |
| `32px` | 2rem | Page content padding-right, larger section spacing, header nav gap |
| `40px` | 2.5rem | Top-level page padding, form bottom margin-top |
| `64px` | 4rem | Home logo margin-bottom, large vertical separators |

### Page Layout Structure

> **Default page appearance**: The application background is the **DGEM gradient**, the same signature look used across the platform (Studio, Workshops, and the apps). A warm light grey base (`#F3F4F5`, `--color-page-bg`) sits beneath a fixed colorful gradient overlay (`.gradient-bg`): a subtle multi-color brand glow at 12% opacity with 100px blur. The overlay is **always present on application pages**, rendered as a fixed, `aria-hidden` layer behind the content; all content sits above it via `position: relative` / `z-index`. It applies to every page, including login. See Section 26 for the `gradient-bg` CSS class.

The app shell is **viewport-locked**: the outer wrapper is exactly `h-screen` with `overflow: hidden`. Header and footer are non-scrollable (`flex-shrink: 0`). Only the `<main>` content area scrolls (`flex: 1; overflow-y: auto`). This ensures the footer is **always visible** at the bottom of the viewport – it never scrolls away.

```
┌─────────────────────────────────────────────────┐  ← h-screen, overflow-hidden
│ Header (.app-header, h: 56px, shrink-0)         │
├────────────┬────────────────────────────────────┤
│ Sidebar    │ Content Area (flex-1)              │
│ w: 306px   │ padding: 32px                      │
│ bg: #FAFAFA│ overflow-y: auto  ← only this      │
│ collapsible│ region scrolls                     │
│ to 14px    │                                    │
├────────────┴────────────────────────────────────┤
│ Footer (h: 64px, shrink-0, always visible)      │
└─────────────────────────────────────────────────┘
```

**React implementation:**
```tsx
<div className="flex flex-col h-screen overflow-hidden">
  <Header />                                        {/* shrink-0 */}
  <main className="flex-1 overflow-y-auto p-8">     {/* scrollable */}
    <Outlet />
  </main>
  <footer className="h-16 border-t shrink-0">      {/* always visible */}
    …
  </footer>
</div>
```

### Grid System

- **12-column grid** with `16px` gutters
- Container is centered, max-widths scale with breakpoint:
  - `sm`: 540px | `md`: 720px | `lg`: 960px | `xl`: 1140px | `xxl`: 1320px

### Spacing Rules

1. **Consistent internal padding**: Cards, popups, and modals all use `16px` or `24px` internal padding – never mix within a component.
2. **Between-section spacing**: Use `24px` between major sections, `16px` between form fields.
3. **Button groups**: Space buttons with `16px` gap (footer/form) or `24px` gap (section actions).
4. **Never use odd pixel values** (3px, 5px, 7px). Stick to multiples of 4.
