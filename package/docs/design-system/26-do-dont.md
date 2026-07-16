## Do / Don't Quick Reference

### Colors

| ✅ Do | ❌ Don't |
|-------|----------|
| Use `var(--color-foreground)` for text | Hardcode `#121A38` in component styles |
| Use `var(--color-primary)` for actions | Use `#0058AB` for decorative text |
| Use red only for errors/destructive | Use red for decorative highlights |
| Use turquoise as a small accent | Fill large areas with turquoise |
| Use the 8-color chart palette in order | Invent new chart colors |

### Typography

| ✅ Do | ❌ Don't |
|-------|----------|
| Use Ubuntu from Google Fonts | Load other fonts |
| Use weight 300 for hero/display text | Use weight 300 for body text |
| Use weight 500 for headings | Use weight 700 for headings |
| Keep body text at 14px | Go below 12px for any text |
| Use the `.text-*` classes | Define ad-hoc font sizes |

### Components

| ✅ Do | ❌ Don't |
|-------|----------|
| Use pill-shaped buttons (9999px) | Use squared buttons |
| Use `dgem-btn` classes for button styling | Create custom button styles from scratch |
| Use BEM variants (`--filled`, `--ghost`, `--destructive`) in new apps | Use long-form names (`filled-dark`, `text-dark`) in new code |
| Use `dgem-btn--destructive` for dangerous actions | Use red buttons for non-destructive actions |
| Use `dgem-btn--ghost` for low-emphasis dismiss/cancel | Use outlined for every secondary action |
| Use `dgem-btn-md` (medium) for all page-level buttons | Use `dgem-btn-sm` (small) for standalone page actions |
| Use `dgem-btn-sm` only inside table rows, list items, compact inline controls | Use small buttons as toolbar or form actions |
| Use DGEM DatePicker component for all date inputs | Use native `<input type="date">` |
| Use compact DatePicker with `dropdownAlign="right"` in toolbars | Use full-size DatePicker in filter bars |
| Use the save button feedback pattern (green 3s) for inline saves | Navigate away on save – keep the user on the page |
| Use confirmation dialogs (`max-w-md`, binary layout) for data-loss decisions | Use full-size modals for simple yes/no questions |
| Use borderless modal sections (spacing-only separation) | Add `border-bottom`/`border-top` between modal header/body/footer |
| Use accessible headless UI primitives for complex controls | Build custom select/dialog/popup from plain `<div>` |
| Use a class merging utility for Tailwind conflicts | Concatenate class strings manually |
| Use Lucide React (`lucide-react`) for ALL UI icons | Use icon fonts (icon2-*, Material Icons), Heroicons, or Font Awesome |
| Use `dgem-tag` / `dgem-status` for labels | Improvise tag styles |

### Layout

| ✅ Do | ❌ Don't |
|-------|----------|
| Use 4px-based spacing | Use odd pixel values (3, 5, 7, 13) |
| Use the standard page layout template | Create novel layout structures |
| Set body background to `#F3F4F5` (`dgem-page-bg`) | Use white (`#FFFFFF`) as the page/body background |
| Add `.gradient-bg` fixed overlay on the page | Skip the gradient overlay – it defines the DGEM look |
| Use `.app-header` for the header bar | Create custom header styles from scratch |
| Use `dgem-nav-link` for header navigation links | Use plain underlined links in the header |
| Sidebar width: 306px collapsed to 14px | Use other sidebar widths |
| Lock scroll on modal open | Allow scroll behind modals |
| Use dark navy (`#121A38`) only for filled buttons, card hovers, and sidebar active states in light mode | Apply dark navy as the page **background** in light mode – that is dark theme only |

### Code Quality

| ✅ Do | ❌ Don't |
|-------|----------|
| Use CSS variables for theme support | Hardcode hex values |
| Use `dgem-` prefixed classes for brand patterns | Pollute global namespace |
| Import from `@dgem/design-system` | Duplicate token values |
| Use Tailwind utilities + `dgem-*` classes | Reimplement design tokens inline |
| Use accessible headless primitives for complex controls | Build custom headless components from scratch |
| Test dark theme when modifying styles | Assume light theme only |
