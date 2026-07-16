## Links

### Link Styles

```html
<!-- Standard link on light background -->
<a class="dgem-link dgem-link-light dgem-link-body1" href="#">Link text</a>

<!-- Link on dark background -->
<a class="dgem-link dgem-link-dark dgem-link-body2" href="#">Link text</a>

<!-- Link with icon -->
<a class="dgem-link dgem-link-light dgem-link-icon dgem-link-body1" href="#">
  <i class="icon-arrow-r"></i> Link text
</a>
```

### Link Sizes

| Class | Font Size |
|-------|-----------|
| `dgem-link-h5` | 24px |
| `dgem-link-body1` | 16px |
| `dgem-link-body2` | 14px |
| `dgem-link-body3` | 12px |

### Link Animation

DGEM links use a **background-gradient underline animation** – not `text-decoration` or `border-bottom`.

| Variant | CSS class | Default state | Hover animation | Keyframes |
|---------|-----------|---------------|-----------------|----------|
| **Link** (inline/body) | `dgem-link` | No underline (`background-size: 0 1px`) | Line slides in left→right, then out left→right | `text-underline2` 540ms |
| **Nav link** (always underlined) | `dgem-nav-link` | Underlined (`background-size: 100% 1px`) | Line slides out right, reappears from left | `text-underline` 600ms |

**How it works:**
- A `linear-gradient` matching the text color is applied as a `background` at the bottom of the element (`no-repeat 0 100%`).
- `background-size` controls visibility: `0 1px` = hidden, `100% 1px` = visible.
- On hover, a keyframe animation manipulates `background-size` and `background-position` to create a sweep effect.
- `padding-bottom: 2px` provides space for the underline to breathe.

**`text-underline2` keyframes** (`dgem-link` – no underline by default):
```
0%   → background-size: 0 1px,     position: 0 100%     (hidden, left)
50%  → background-size: 100% 1px,  position: 0 100%     (fully visible, sweeps in from left)
51%  → background-size: 100% 1px,  position: 100% 100%  (anchor flips to right)
100% → background-size: 0 1px,     position: 100% 100%  (sweeps out to right, hidden again)
```

**`text-underline` keyframes** (`dgem-nav-link` – always underlined):
```
0%   → background-size: 100% 1px,  position: 100% 100%  (visible, right-anchored)
50%  → background-size: 0 1px,     position: 100% 100%  (sweeps out to right)
51%  → background-size: 0 1px,     position: 0 100%     (anchor flips to left)
100% → background-size: 100% 1px,  position: 0 100%     (sweeps back in from left)
```

### Link Color Behavior

- **Light bg** (`dgem-link-light`): Dark Blue `#121A38` → Blue `#0058AB` on hover
- **Dark bg** (`dgem-link-dark`): White `#FFFFFF` → Turquoise `#00D5D0` on hover
- Font weight does **not** change on hover.
- Color transition uses `--transition-base` (200ms).

### Link Rules

1. Links that navigate use `<a>`. Links that trigger actions use `<button class="dgem-btn-text-*">`.
2. External links should include an icon (Lucide `ExternalLink` or `ArrowRight`).
3. Never use blue text that isn't a link – users will try to click it.
4. **Do not use `text-decoration: underline`** – always rely on the background-gradient animation.
5. **Do not add `font-weight` changes on hover** – the animation alone provides sufficient feedback.
6. For navigation links that should always show the underline, use `dgem-nav-link` instead of `dgem-link`.
