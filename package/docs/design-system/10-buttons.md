## Buttons

### Button Anatomy

All buttons are **pill-shaped** (`border-radius: 9999px`).

**Types**: Filled, Outlined, Text
**Sizes**: Large (48px), Medium (40px), Small (24px)
**Colors**: Dark (`#121A38`), Blue (`#0058AB`), White (`#FFFFFF`)

### Button Classes

```html
<!-- Filled Dark (primary action) – animates to blue on hover -->
<button class="dgem-btn dgem-btn-lg dgem-btn--filled">Submit</button>

<!-- Outlined (secondary action) – fills dark on hover -->
<button class="dgem-btn dgem-btn-md dgem-btn--outlined">Cancel</button>

<!-- Ghost (minimal – transparent, faint fill on hover) -->
<button class="dgem-btn dgem-btn-md dgem-btn--ghost">Cancel</button>

<!-- Destructive (red – for dangerous/irreversible actions) -->
<button class="dgem-btn dgem-btn-md dgem-btn--destructive">Delete</button>

<!-- Alternative long-form names (same behaviour) -->
<button class="dgem-btn dgem-btn-md dgem-btn-filled-dark">Submit</button>
<button class="dgem-btn dgem-btn-md dgem-btn-outlined-dark">Cancel</button>

<!-- Text (tertiary / link-style) -->
<button class="dgem-btn dgem-btn-md dgem-btn-text-blue">Learn more</button>

<!-- Small button -->
<button class="dgem-btn dgem-btn-sm dgem-btn-filled-blue">Tag</button>
```

### Button Sizing

| Size | Class | Height | Padding | Font Size | Usage |
|------|-------|--------|---------|-----------|-------|
| Large | `dgem-btn-lg` | 48px | 8px 16px | 16px | Hero CTAs, landing pages |
| Medium | `dgem-btn-md` | 40px | 12px 16px | 16px | **Default for all page-level actions** |
| Small | `dgem-btn-sm` | 24px | 8px | 12px | Inside table rows, list items, inline compact controls only |

> **Rule:** Use **medium (`dgem-btn-md`)** as the default button size for all page-level actions – form submissions, toolbar actions, filter buttons, navigation, modals. **Small (`dgem-btn-sm`) is reserved for buttons placed inside table cells, list items, or other compact inline contexts** (e.g. row-level "View", "Edit", "Delete" actions). Never use small buttons as standalone page actions.

### Icon Buttons

When a button contains **only an icon** (no text label), add the `dgem-btn--icon`
modifier. This forces the button into a **perfect circle** (equal width & height,
zero padding, `border-radius: 9999px`).

```html
<!-- Icon-only close button (small / ghost) -->
<button class="dgem-btn dgem-btn-sm dgem-btn--icon dgem-btn--ghost" aria-label="Close">
  <X size={14} />
</button>

<!-- Icon-only logout button (medium / ghost) -->
<button class="dgem-btn dgem-btn-md dgem-btn--icon dgem-btn--ghost" aria-label="Log out">
  <LogOut size={16} />
</button>
```

| Size modifier | Circle dimensions |
|---------------|-------------------|
| `dgem-btn-lg` | 48 × 48 px |
| `dgem-btn-md` | 40 × 40 px |
| `dgem-btn-sm` | 32 × 32 px |

> **Rule:** Icon-only buttons MUST be circles (`dgem-btn--icon`), never pills.
> Buttons with text + icon keep the default pill shape.

> **Implementation note:** The `.dgem-btn--icon` class uses `!important` on
> `width`, `min-width`, `height`, `min-height`, `padding`, and `border-radius`
> to guarantee the circle shape regardless of specificity conflicts with size
> modifiers, Tailwind utilities, or flex/grid parents. It also sets
> `aspect-ratio: 1` and `flex-shrink: 0` to prevent layout distortion.
> **Do NOT use inline Tailwind classes** (e.g. `rounded-full w-8 h-8 p-0`) for
> icon-only buttons – always use `dgem-btn--icon` instead.

### Button Rules

1. **Primary actions** use filled dark or filled blue. One primary button per view.
2. **Secondary actions** use outlined. Use outlined-dark on light backgrounds, outlined-white on dark.
3. **Tertiary/cancel** uses text or ghost style.
4. **Button order in footers**: Primary (rightmost), Secondary (left of primary). Cancel is leftmost.
5. **Disabled state**: `opacity: 0.5`, `pointer-events: none`.
6. **Focus**: `outline: 2px solid var(--color-ring); outline-offset: 2px`.
7. Buttons with icons: icon goes **before** the label, with `1rem` gap (large/medium) or `0.5rem` gap (small).
8. **Hover animation**: Each `dgem-btn` variant has a `::before` pseudo-element (same size as the button, `border-radius: 9999px`) that fades in via `opacity: 0 → 1` on hover. This creates the DGEM signature fill-slide effect. The fill colour differs per variant – outlined-dark fills with `#121A38` (text turns white), filled-dark fills with `#0058AB` (border turns blue). No JS is required.
9. **Never use squared buttons** – pill shape is mandatory for text buttons.
10. **Icon-only buttons MUST use `dgem-btn--icon`** – this renders them as circles, not pills.
11. **Ghost buttons** (`dgem-btn--ghost`) – transparent background, no visible border, subtle `rgba(18,26,56,0.06)` fill on hover. Use for low-emphasis actions (close, cancel, dismiss) where outlined is too heavy.
12. **Destructive buttons** (`dgem-btn--destructive`) – red `#E30021` background, white text, darker red `#C0001C` fill on hover. Reserved for dangerous or irreversible actions (delete, discard, leave without saving). Never use red buttons for non-destructive actions.

### BEM-style Variant Reference

| BEM Class | Background | Border | Text | Hover Effect |
|-----------|-----------|--------|------|--------------|
| `dgem-btn--filled` | `#121A38` | `#121A38` | White | Blue `#0058AB` fill, border turns blue |
| `dgem-btn--outlined` | Transparent | `#121A38` | `#121A38` | Dark fill, text turns white |
| `dgem-btn--ghost` | Transparent | Transparent | `#121A38` | Subtle 6% navy tint fill |
| `dgem-btn--destructive` | `#E30021` | `#E30021` | White | Darker red `#C0001C` fill |

> **Prefer BEM-style classes** (`dgem-btn--filled`, `dgem-btn--ghost`) over long-form names
> (`dgem-btn-filled-dark`, `dgem-btn-text-dark`) in new application code.

### Save Action Button Pattern

For forms with a "Save" / "Save as Draft" action, use a **visual feedback loop** instead of (or in addition to) a toast notification. This gives the user immediate, in-place confirmation that their data was saved.

**Pattern:**
1. Default state – filled dark button with the save label.
2. On save success – button turns **green** (`bg-green text-white`) with a check icon and "Saved!" label for **3 seconds**, then reverts to default.
3. On save error – show a red toast notification with an error message.
4. While saving – show a loading spinner inside the button (`loading` prop).

```html
<!-- Default state -->
<button class="dgem-btn dgem-btn-md dgem-btn--filled">Save as Draft</button>

<!-- Success state (3s, via JS class toggle) -->
<button class="dgem-btn dgem-btn-md bg-green border-green text-white">
  <Check size={14} /> Saved!
</button>
```

**Rules:**
- The green "Saved!" state is a **temporary visual cue** (3 seconds), not a permanent state.
- Do NOT navigate away on save – the user stays on the current page.
- If the save action also closes a view, use a separate "Save and close" button (see [`17-modals.md`](17-modals.md) Modal/Popup Rules).
- The button should be **disabled** while in the "Saved!" state to prevent double saves.
