## Typography

### Font Stack

```css
--font-sans: "Ubuntu", sans-serif;
--font-mono: "Ubuntu Mono", monospace;
```

Load from Google Fonts:

```css
@import url("https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&family=Ubuntu+Mono:wght@400;700&display=swap");
```

### Type Scale

| Style | Size | Line Height | Weight | Letter Spacing | CSS Class |
|-------|------|-------------|--------|---------------|-----------|
| Display | 28px | 1.2 | 300/400/500 | 0.03em | `.text-display` + `-light/-regular/-medium` |
| H1 | 24px | 1.2 | 300/400/500 | 0.01–0.03em | `.text-h1` + weight modifier |
| H2 | 20px | 1.3 | 300/400/500 | 0.01–0.03em | `.text-h2` + weight modifier |
| H3 | 16px | 1.2 | 300/400/500 | 0.01–0.03em | `.text-h3` + weight modifier |
| H4 | 14px | 1.3 | 300/400/500 | 0.003–0.03em | `.text-h4` + weight modifier |
| Toolbar Title | 18px | 1.3–1.5 | 300/400/500 | 0.01–0.03em | `.text-toolbar-title` + weight |
| Body | 14px | 1.6 | 300/400/500 | 0.01–0.03em | `.text-body` + weight modifier |
| Body 1 | 16px | 1.5 | 300 | 0.0125em | `.text-body1` |
| Body 2 | 14px | 1.5 | 300 | 0.021em | `.text-body2` |
| Small | 12px | 1.4 | 300/400/500 | 0.02–0.03em | `.text-small` + weight modifier |

### Typography Rules

1. **Default body text** is 14px (`text-body`), Regular 400.
2. **Page titles** use H1 Medium (24px/500). Section titles use H2 Medium (20px/500).
3. **Intro/hero text** uses 18px Light (300).
4. **Form labels** are 14px Regular, color `--grey-600`.
5. **Table headers** are 12px Medium (500), color `--color-muted-foreground`.
6. **Never go below 12px** (`text-small`).
7. **Weight 700 (Bold)** is rare – only for strong emphasis in running text, never for headings.
8. **Weight 300 (Light)** is the signature style – use for hero areas, display text, and intro paragraphs.
