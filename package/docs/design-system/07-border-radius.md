## Border Radius

| Value | Usage |
|-------|-------|
| `0` | Popup container (legacy shared component) |
| `4px` / `0.25rem` | Input fields, tags, small blocks, datepicker bubbles |
| `6px` | Dropdown items, chips |
| `8px` / `0.5rem` | Input fields (new style), dropdown containers, pagination, footer dropdown, toast notifications |
| `12px` / `0.75rem` | Cards, modals |
| `16px` / `1rem` | Home boxes, tab content panels |
| `28–30px` | Pill-shaped buttons, search bars |
| `50%` | Icon buttons (circular), avatars, radio buttons |
| `9999px` | Full pill shape – button base, status labels, switches, progress bar |

### Radius Rules

1. **Buttons are always pill-shaped** (`border-radius: 9999px`). Never use squared buttons.
2. **Cards use `16px`** border radius. All cards – both standard cards and Home page module boxes – use 1rem.
3. **Input fields use `4px`** (`border-radius: 0.25rem`). Sharp corners, not rounded.
4. **Circular elements** (icon buttons, avatars) use `50%`.
