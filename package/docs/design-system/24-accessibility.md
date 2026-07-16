## Accessibility

1. **Color contrast**: All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text). Dark Blue `#121A38` on White is 16.3:1.
2. **Focus indicators**: All interactive elements must show a visible focus ring (`2px solid var(--color-ring)`, `offset: 2px`).
3. **Touch targets**: Minimum `48×48px` for mobile interactive elements.
4. **Semantic HTML**: Use `<button>` for actions, `<a>` for navigation, `<input>` for form fields. Never use `<div>` with click handlers without `role` and keyboard support.
5. **ARIA labels**: Icon-only buttons must have `aria-label`. Modals must have `aria-modal="true"` and `role="dialog"`.
6. **Disabled state**: Use `aria-disabled="true"` alongside visual opacity.
7. **Error messages**: Associate with inputs via `aria-describedby`.
8. **Never rely on color alone** to convey meaning – always pair with text or icons.
