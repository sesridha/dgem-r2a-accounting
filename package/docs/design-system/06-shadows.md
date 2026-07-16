## Shadows & Elevation

| Level | CSS | Usage |
|-------|-----|-------|
| **sm** | `0 1px 2px rgba(18,26,56,0.05)` | Subtle lift – tags, chips |
| **base** | `0 1px 3px rgba(18,26,56,0.10), 0 1px 2px rgba(18,26,56,0.06)` | Default cards |
| **md** | `0 4px 6px -1px rgba(18,26,56,0.10), 0 2px 4px -1px rgba(18,26,56,0.06)` | Card hover, dropdowns |
| **lg** | `0 10px 15px -3px rgba(18,26,56,0.10), 0 4px 6px -2px rgba(18,26,56,0.05)` | Modals, floating panels |
| **Home card** | `0 35px 14px rgba(0,0,0,0.01), 0 20px 12px rgba(0,0,0,0.03), 0 9px 9px rgba(0,0,0,0.04), 0 2px 5px rgba(0,0,0,0.05)` | Home page module boxes |
| **Overlay** | `0 0 32px rgba(0,0,0,0.2)` | Heavy overlay shadows |

### Shadow Rules

1. Shadows use `rgba(18,26,56,...)` (Dark Blue tint), not pure black – this keeps the warm tone.
2. Dark theme shadows switch to `rgba(0,0,0,...)` for contrast.
3. Only card-hover and interactive elements should increase shadow on hover.
