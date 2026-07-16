## Tags, Chips & Status Labels

### Tags

```html
<!-- Grey tag (default) -->
<span class="dgem-tag dgem-tag-grey">Category</span>

<!-- Dark tag -->
<span class="dgem-tag dgem-tag-dark">Label</span>

<!-- News tags -->
<span class="dgem-tag-new">NEW</span>
<span class="dgem-tag-updated">UPDATED</span>
```

| Tag Type | Background | Text | Font Size | Border Radius |
|----------|-----------|------|-----------|---------------|
| Grey | `#F4F4F5` | `#71717A` | 12px | `9999px` (pill) |
| Dark | `#121A38` | `#FFFFFF` | 12px | `9999px` (pill) |
| New | `#0058AB` | `#FFFFFF` | 10px, uppercase | `9999px` (pill) |
| Updated | `#00D5D0` | `#121A38` | 10px, uppercase | `9999px` (pill) |

### Status Labels

```html
<span class="dgem-status dgem-status-active">Active</span>
<span class="dgem-status dgem-status-on-hold">On hold</span>
<span class="dgem-status dgem-status-draft">Draft</span>
<span class="dgem-status dgem-status-scheduled">Scheduled</span>
<span class="dgem-status dgem-status-completed">Completed</span>
```

| Status | Background | Text Color |
|--------|-----------|-----------|
| Active | `#E8F5E9` | `#17A34C` |
| On hold | `#FFF8E1` | `#FEB100` |
| Draft | `#F4F4F5` | `#71717A` |
| Scheduled | `#E3F2FD` | `#0058AB` |
| Completed | `#F3E8FF` | `#7C3AED` |

### Chips

Pill-shaped interactive elements for filters:

```html
<span class="dgem-chip dgem-chip-default">Filter A</span>
<span class="dgem-chip dgem-chip-selected">Filter B</span>
```

| State | Background | Text |
|-------|-----------|------|
| Default | `#F4F4F5` | `#121A38` |
| Default:hover | `#E5E5E5` | `#121A38` |
| Selected | `#121A38` | `#FFFFFF` |
| Selected:hover | `#1E2548` | `#FFFFFF` |

Height: `24px`, `border-radius: 9999px`, `font-size: 12px`.

### Switcher (Segmented Control)

A pill-shaped container with multiple segments. One segment is active (filled dark),
the rest are transparent. Use for mutually-exclusive filter sets (e.g. status filters).

```html
<div class="dgem-switcher" role="tablist">
  <button class="dgem-switcher-item dgem-switcher-item--active" role="tab" aria-selected="true">All</button>
  <button class="dgem-switcher-item" role="tab" aria-selected="false">Submitted</button>
  <button class="dgem-switcher-item" role="tab" aria-selected="false">Approved</button>
  <button class="dgem-switcher-item" role="tab" aria-selected="false">Rejected</button>
</div>
```

#### Count badge

Add a `dgem-switcher-item__count` badge to show a per-segment count. It renders as
a fixed-size circle (`20×20px`, `border-radius: 50%`) and inverts to a white badge
with primary text when its segment is active.

```html
<div class="dgem-switcher" role="tablist">
  <button class="dgem-switcher-item dgem-switcher-item--active" role="tab" aria-selected="true">
    All <span class="dgem-switcher-item__count">12</span>
  </button>
  <button class="dgem-switcher-item" role="tab" aria-selected="false">
    Approved <span class="dgem-switcher-item__count">8</span>
  </button>
</div>
```

| Token | Value |
|-------|-------|
| Container background | `var(--color-background)` |
| Container border | `1px solid var(--color-border)` |
| Container padding | `2px` |
| Container border-radius | `9999px` (pill) |
| Item height | `28px` (`1.75rem`) |
| Item padding | `0 12px` (`0 0.75rem`) |
| Item font-size | `12px` (`0.75rem`) |
| Item border-radius | `9999px` |
| Inactive text colour | `var(--color-muted-foreground)` |
| Inactive hover bg | `var(--color-muted)` |
| Active background | `var(--color-primary)` (`#0058AB` light) |
| Active text colour | `var(--color-primary-foreground)` |
| Active font-weight | `500` |

> **Rule:** Prefer the Switcher over standalone chips for status/category filters.
> Chips are still valid for multi-select tag clouds or removable filter tokens.
