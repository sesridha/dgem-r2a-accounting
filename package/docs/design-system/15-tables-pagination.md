## Tables & Pagination

### Table Structure

```html
<table class="dgem-table">
  <thead>
    <tr>
      <th>Column</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Value</td>
    </tr>
  </tbody>
</table>
```

| Property | Value |
|----------|-------|
| Font size | 14px |
| Header font | 12px, Medium (500), `--color-muted-foreground` |
| Cell padding | `12px 16px` |
| Row border | `1px solid var(--color-border)` |
| Row hover | `background: var(--color-muted)` |

### Table Cell Types (from Figma)

- **Text**: Default, Bold, Active (link-colored), with description (two-line)
- **Checkbox**: For row selection
- **Image**: Thumbnail with text
- **Icon**: Small (16px) or Medium (24px)
- **Tag**: Inline tag in cell
- **Action**: Icon buttons (default, view, danger)
- **Search**: Inline search field in header

### Pagination

```html
<div class="dgem-pagination">
  <span class="dgem-pagination-item">←</span>
  <span class="dgem-pagination-item dgem-pagination-item-active">1</span>
  <span class="dgem-pagination-item">2</span>
  <span class="dgem-pagination-item">→</span>
</div>
```

| Property | Value |
|----------|-------|
| Item size | `36×36px` |
| Border radius | `9999px` (pill) |
| Active | `background: var(--color-primary)` (`#0058AB` light), `color: var(--color-primary-foreground)` |
| Hover | `background: var(--color-muted)` |
