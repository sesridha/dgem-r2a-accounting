## Transitions & Animation

| Token | Duration | Easing | CSS Variable |
|-------|----------|--------|-------------|
| Fast | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `--transition-fast` |
| Base | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `--transition-base` |
| Slow | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `--transition-slow` |
| Nav/Sidebar | 500ms | `ease` | (sidebar collapse, nav) |
| Link underline | 540ms | keyframes | `text-underline` / `text-underline2` (background-size slide) |
| Modal overlay enter | 150ms | `ease` | `dgem-modal-overlay-in` (opacity fade) |
| Modal overlay exit | 150ms | `ease` | `dgem-modal-overlay-out` (opacity fade) |
| Modal panel enter | 200ms | `ease` | `dgem-modal-panel-in` (opacity + scale + translateY) |
| Modal panel exit | 150ms | `ease` | `dgem-modal-panel-out` (opacity + scale + translateY) |
| Save feedback | 3000ms | – | JS-driven class toggle (green → default) |

### Transition Rules

1. Use `--transition-base` (200ms) for button hovers, input focus, color changes.
2. Use `--transition-slow` (300ms) for popup enter/leave, panel visibility toggles.
3. Sidebar collapse uses 500ms ease for width transition.
4. **Never animate layout properties** (width, height, margin) on elements with complex children – use `transform` and `opacity` instead.
5. **Save button feedback** uses a 3-second green state (JS class toggle) – no CSS animation needed. The button text/icon change is instantaneous; only the 3s timeout reverts it.
