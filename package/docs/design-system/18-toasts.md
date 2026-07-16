## Toasts & Notifications

Toast notifications include an icon, title, optional description, and a dismiss (×) button.

### Structure

```html
<div class="dgem-toast dgem-toast-green" role="alert">
  <CheckCircle2 size={16} className="dgem-toast-icon" />
  <div class="dgem-toast-body">
    <p class="dgem-toast-title">Success</p>
    <p class="dgem-toast-description">Operation completed.</p>
  </div>
  <button class="dgem-toast-dismiss" aria-label="Dismiss" title="Dismiss">
    <X size={14} />
  </button>
</div>
```

### Layout Properties

| Property | Value |
|----------|-------|
| Position | `fixed`, `top: 84px`, centered horizontally |
| Width | `384px` |
| Border radius | `8px` |
| Padding | `16px` |
| Z-index | `100000` |
| Shadow | `0 0 0 1px rgba(0,0,0,.05), 0 10px 15px -3px rgba(0,0,0,.06), 0 4px 6px -2px rgba(0,0,0,.05)` |
| Auto-dismiss | After `duration` ms (default 4000) |}
| Animation | Slide-down + fade, 300ms ease |

### Internal Spacing

| Element | Spec |
|---------|------|
| Outer gap (icon ↔ body ↔ dismiss) | `16px` |
| Icon ↔ text (within leading content) | `12px` |
| Title ↔ description | `4px` |
| Icon size | `24px × 24px` |
| Dismiss button size | `20px × 20px` |

### Typography

| Element | Font | Size | Line-height | Color (light) | Color (color) |
|---------|------|------|-------------|----------------|----------------|
| Title | Ubuntu Medium | `14px` | `20px` | `#171717` (Grey/900) | `#FFFFFF` |
| Description | Ubuntu Regular | `14px` | `20px` | `#737373` (Grey/500) | `#FFFFFF` |

### Modes & Variants

**Light mode** (`.dgem-toast-light`) – white background, colored icon:

| Variant class | Icon color | Background |
|---------------|-----------|------------|
| `dgem-toast-light` (success) | `#38B24C` (DGEM Green) | `#FFFFFF` |

**Color mode** – solid colored background, white text/icon:

| Variant class | Background | Text/icon color |
|---------------|-----------|----------------|
| `dgem-toast-green` | `#38B24C` (DGEM Green) | `#FFFFFF` |
| `dgem-toast-yellow` | `#FEB100` | `#121A38` |
| `dgem-toast-red` | `#E30021` | `#FFFFFF` |

### Toast Rules

1. Toasts appear at the top center, below the header.
2. Auto-dismiss after 4 seconds by default.
3. Keep toast messages short – one line title, one line description.
4. Only one toast visible at a time.
5. Use **color mode** (`dgem-toast-green`) for prominent confirmations.
6. Use **light mode** (`dgem-toast-light`) for subtler, inline-style notifications.
