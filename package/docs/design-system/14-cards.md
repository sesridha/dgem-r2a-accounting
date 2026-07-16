## Cards

### Standard Card

```html
<div class="dgem-card">
  <div class="dgem-card-body">
    <!-- content -->
  </div>
</div>

<!-- Clickable card that flips to dark on hover -->
<div class="dgem-card dgem-card--interactive">
  <div class="dgem-card-body">...</div>
</div>

<!-- Elevated card – opt-in resting shadow -->
<div class="dgem-card dgem-card--shadow">
  <div class="dgem-card-body">...</div>
</div>
```

| Property | Value |
|----------|-------|
| Background | `var(--color-card)` (`#FAFAFA` light, `#182044` dark) |
| Border | `1px solid rgba(0,0,0,0.06)` |
| Border radius | **16px** (`1rem`) |
| Shadow | **None by default** – cards are flat. Opt in with `.dgem-card--shadow`. |
| Hover (`--interactive`) | Background `var(--dgem-dark-blue)`, text `var(--dgem-white)` + soft shadow (inverts to a light surface with dark text in dark mode) |
| Body padding | `16px` |

### Modifiers

| Class | Effect |
|-------|--------|
| `.dgem-card--shadow` | Adds the multi-layer elevation shadow (`var(--shadow-card)`). Use only when a card needs resting elevation – cards are flat by default. |
| `.dgem-card--interactive` | Clickable card: pointer cursor and a hover state that flips to a dark-blue background with white text (inverts in dark mode) plus a soft hover shadow. |

### Home Page Module Cards

| Property | Value |
|----------|-------|
| Border radius | `16px` |
| Background | `var(--color-card)` (`#FAFAFA` light) |
| Shadow | Opt in with `.dgem-card--shadow` (`var(--shadow-card)`) |
| Min height | `190px` |
| Logo height | `36px` |
| Title | 20px, weight 300 |
| Hover | Use `.dgem-card--interactive`: dark blue background, white text, title weight 500 |

### Card Rules

1. Cards are **flat by default** (no shadow). Add `.dgem-card--shadow` only when a card needs resting elevation; use `.dgem-card--interactive` for clickable cards (hover background flip + soft shadow).
2. Clickable cards should change `cursor: pointer` and have `role="link"` or wrap in `<a>`.
3. Card content uses the standard padding (16px body).
4. Tags inside cards sit at the top, with `8px` spacing between tags.
