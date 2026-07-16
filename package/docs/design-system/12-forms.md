## Form Controls

### Input Fields

```html
<div class="dgem-form-group">
  <label class="dgem-label">Field Label</label>
  <input class="dgem-input" placeholder="Enter value..." />
</div>

<!-- Error state -->
<input class="dgem-input dgem-input-error" />
<span class="dgem-error-text">This field is required</span>
```

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 8px 12px |
| Border | 1px solid `--color-border` (`#E5E5E5`) |
| Box shadow | `0 1px 3px 0 rgba(0,0,0,0.06)` |
| Border radius | **4px** (`0.25rem`) |
| Font size | 14px |
| Focus border | `#1DB8F2` (DGEM Light Blue) |
| Focus shadow | `0 0.5px 2px rgba(0,0,0,0.05)` |
| Error border | `--color-destructive` (`#E30021`) |
| Disabled | `opacity: 0.5`, `cursor: not-allowed`, muted background |

### Text Areas

```html
<textarea class="dgem-textarea" rows="4"></textarea>

<!-- Rounded variant -->
<textarea class="dgem-textarea dgem-textarea-round"></textarea>
```

| Property | Value |
|----------|-------|
| Min height | 80px (5rem) |
| Padding | 12px |
| Border radius | 4px (default) / 16px (.dgem-textarea-round) |

### Selectors / Dropdowns

Use the `dgem-select` class for native `<select>` dropdowns:

```html
<select class="dgem-select">
  <option value="">Select option</option>
  <option value="a">Item A</option>
</select>

<!-- Error state -->
<select class="dgem-select dgem-select-error">...</select>
```

| Property | Value |
|----------|-------|
| Height | 40px |
| Padding | 8px 36px 8px 12px (right space for chevron) |
| Border | `1px solid var(--color-border)` |
| Border radius | 4px |
| Box shadow | `0 0.5px 2px rgba(0,0,0,0.05)` |
| Font | Ubuntu Regular, 14px, `var(--color-foreground)` |
| Placeholder color | `#8D8D8D` |
| Focus border | `#1DB8F2` (DGEM Light Blue) |
| Chevron | Inline SVG arrow, `#121A38`, 20px, right-aligned |
| Error border | `--color-destructive` (`#E30021`) |
| Disabled | `opacity: 0.5`, `cursor: not-allowed` |

For custom dropdown overlays (headless UI), match these list specs from Figma:

| Property | Value |
|----------|-------|
| Dropdown border radius | 8px |
| Dropdown surface | `var(--color-background)` |
| Dropdown shadow | `0 4px 10px rgba(0,0,0,0.07), 0 0 0 1px var(--color-border)` |
| Dropdown padding | 4px |
| Item padding | 6px 10px |
| Item text | Ubuntu Regular, 14px, `var(--color-foreground)` |
| Item hover/active | `background: var(--color-muted)`, rounded 6px |

Support these behaviors: single-select, multi-select (chips display), searchable dropdown, placeholder text.

### Checkboxes

- Size: `18×18px` (small) or `24×24px` (large)
- Unchecked: `border: 1px solid $grey-500`
- Checked: `background: #121A38`, white check icon
- States: Enabled, Hover, Focused, Pressed, Disabled, Invalid

### Radio Buttons

- Same sizing as checkboxes
- Circular shape (`border-radius: 50%`)
- Selected: inner dot filled with `#121A38`

### Switch / Toggle

| Property | Value |
|----------|-------|
| Track width | 40px |
| Track height | 24px |
| Thumb size | 20px |
| Off | Track `#CCCCCC`, thumb left |
| On | Track `var(--color-primary)` (`#0058AB` light), thumb right |
| Disabled | `opacity: 0.5` |

### Search Bar

Inline search used in page headers and toolbars. Uses the `dgem-search` component class.

**Structure:**
```html
<div class="dgem-search">
  <Search size={16} className="text-muted-foreground" />
  <input
    type="text"
    placeholder="Search…"
    class="bg-transparent outline-none text-body2 w-48 placeholder:text-muted-foreground"
  />
  <!-- Clear button – animated width + opacity toggle -->
  <button class="transition-all duration-200 ease-in-out text-muted-foreground hover:text-foreground …">
    <X size={14} />
  </button>
</div>
```

**Styling (via `dgem-search` class):**
- Pill-shaped (`border-radius: 9999px`)
- Surface background (`var(--color-background)`), `1px` border (`--color-border`)
- Flex layout with `gap: 0.5rem`, `padding: 0.25rem 0.75rem`
- On hover / focus-within: border color transitions to `--color-ring`
- Input is unstyled (`bg-transparent`, `outline-none`), `w-48` default width
- Search icon: `<Search size={16} />`, `text-muted-foreground`
- Clear button: `<X size={14} />`, always rendered but hidden via `opacity-0 w-0 overflow-hidden` when input is empty; visible via `opacity-100 w-4` when input has value; animated with `transition-all duration-200 ease-in-out`

**Rules:**
1. Always debounce the search input (300ms recommended) before triggering API calls.
2. Clear button must animate in/out – never use conditional rendering (`{value && …}`), keep the element in DOM and toggle width + opacity classes.
3. Placeholder text uses `text-muted-foreground`.
4. The `dgem-search` wrapper handles all border, radius, and padding – do **not** add `dgem-input` classes to the inner `<input>`.

### Form Layout Rules

1. **Labels above inputs** (not inline), `4px` gap between label and input.
2. **Form field spacing**: `16px` vertical margin between form groups.
3. **Error text**: Red (`#E30021`), 12px, `4px` below the input.
4. **Form action bar**: Flex, `justify-content: flex-end`, `gap: 24px`, `margin-top: 40px`.
5. **Required fields**: Mark with asterisk in the label, never rely on color alone.
6. **Input widths**: Should fill their container. Use grid for multi-column forms.

### Date Pickers

Date pickers use the `dgem-input` base styling with a custom calendar dropdown overlay.

**Two modes:**

| Mode | Use Case | Properties |
|------|----------|------------|
| **Standard** (default) | Form fields inside pages/wizards | Full-width, 40px height, label above |
| **Compact** | Inline filters (table toolbars, dashboards) | Auto width, `min-width: 145px`, 32px height, smaller text, reduced padding |

**Compact mode classes:**
```
!w-auto !min-w-[145px] !h-8 !px-2 !py-1 !text-small gap-2
```

**Calendar dropdown:**
- Uses `dgem-datepicker-dropdown` class
- Shadow & border consistent with selector dropdowns (see [`13-tags-chips-status.md`](13-tags-chips-status.md))
- `z-index: 2` (sticky elements layer)
- **Alignment:** Use `dropdownAlign="left"` (default) for most placements. Use `dropdownAlign="right"` when the picker is near the right edge of the viewport to prevent overflow.

**Date range filter pattern** (toolbars):
- Place **From** and **To** compact date pickers side by side, separated by an en-dash (`–`)
- A **"Filter range"** button (outlined, standard height) appears when both dates are selected, confirms the filter
- A **Clear (×)** button (outlined, icon-only) appears when a filter is actively applied, clears both dates
- Both action buttons animate in/out with `transition-all duration-200 ease-in-out overflow-hidden` using `max-w` + `opacity`
- Place action buttons to the **left** of the date pickers so date inputs remain stable

> **Rule:** Never use native `<input type="date">` – always use the DGEM custom DatePicker component for visual consistency.

### Multi-Step Wizard Forms

Use the `dgem-progress-step` components (see [`19-progress.md`](19-progress.md)) as the stepper header.

**Structure:**
1. Page heading (`text-h1`)
2. Stepper row with step circles + labels
3. Step content area (`margin-top: 32px`)
4. Footer bar with navigation buttons

**Navigation rules:**
- **Cancel** button (left, `variant="outlined"`) always visible, navigates to list page
- **Back** button (left, `variant="outlined"`) visible from step 2 onwards
- **Next** button (right, primary) validates current step fields before advancing
- **Submit** button (right, primary) replaces Next on the final review step
- Clicking a completed step circle navigates back to that step

**Pre-filled / read-only fields:**
When form fields are derived from the current user context (e.g. requestor name, email), pre-fill them via `useEffect` + `setValue` on mount and render with `readOnly disabled` attributes.

**Step indexing:** Both the Stepper component and parent page should use 0-based step indices.
