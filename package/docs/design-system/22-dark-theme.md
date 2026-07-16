## Dark Theme

> **DGEM is a LIGHT-FIRST design system.** The default look is a warm light-grey page background (`#F3F4F5`) with white content areas. Dark navy colours (`#121A38`) appear only as filled-button backgrounds, card hover states, and sidebar active items – never as the page background in light mode. An LLM generating dark-navy page backgrounds without a `dark` class is generating incorrect DGEM UI.

Activate with `class="dark"` or `data-theme="dark"` on any ancestor element.

Key changes in dark mode:
- Page background (`.dgem-page-bg` / `--color-page-bg`) becomes deep navy `#0E1430`
- Content surfaces (`--color-background`) become `#121A38` (`--dgem-dark-blue`)
- Header background becomes `hsl(227 47% 15%)`
- Sidebar and cards (`--color-card`) become `#182044`
- Text (`--color-foreground`) becomes `#FAFAFA`
- Primary colour becomes `--dgem-light-blue` (turquoise-leaning blue)
- Muted surfaces (`--color-muted` / `--color-secondary`) become `#1E2548`
- Borders (`--color-border`) become `#2A3260`
- Shadows use pure black rgba instead of Dark Blue rgba

All component styles that use `var(--color-*)` aliases adapt automatically – this now includes neutral tags, chips, `draft`/`inactive` status labels, the switcher, pagination, search, select, date picker, table, and header surfaces. **This is why you must use CSS variables, not hardcoded hex values.** Constant brand/status colours (filled buttons, `active`/`error`/`warning` status, toast variants) intentionally keep their colour in dark mode.
