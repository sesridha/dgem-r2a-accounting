## Z-Index Layers

| Layer | Z-Index | Element |
|-------|---------|---------|
| Base | `0` | Default content |
| Sidebar | `1` | `.page-left`, footer |
| Sticky elements | `2` | Box overlays, active datepicker |
| Sticky nav | `10` | Sidebar first item, selector dropdown |
| Popups / Modals | `50` | `dgem-modal-overlay` |
| Legacy popup | `1000` | Legacy popup, footer dropdown |
| Toast | `100000` | Toast notifications |

### Z-Index Rules

1. **Never use arbitrary z-index values.** Pick from the layer table above.
2. Dropdowns within a sidebar or card use `10`.
3. Modals use `50`, legacy popups use `1000`.
4. Toasts must always be topmost at `100000`.
