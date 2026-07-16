## Logos & Brand Assets

Available from `@dgem/design-system/assets/logos/`:

```javascript
import logo from '@dgem/design-system/assets/logos/logo-dgem.svg'
```

| Logo | Description |
|------|-------------|
| `logo-dgem.svg` | DGEM icon + "DGEM" logotype |
| `logo-cap.svg` | Capgemini full logo |
| `logo-cap-small.svg` | Capgemini mark only |
| `logo-ball.svg` | DGEM ball icon (standalone) |
| `logo-{module}.svg` | Module logo (color) |
| `logo-{module}-grey.svg` | Module logo (greyscale) |
| `logo-{module}-white.svg` | Module logo (for dark backgrounds) |

### Logo Rules

1. **The DGEM logo (`logo-dgem.svg`) must be visible on every screen** – both before and after login.
2. DGEM logo in the **header** (authenticated pages): `32px` height, left-aligned, links to home.
3. DGEM logo on the **login page**: `96px` height (`h-24`), centered above the page title.
4. Capgemini logo in footer is `24px` max-width.
5. Module logos in cards are `36px` height.
6. Use `-white` variant when placing a logo on a dark background.
7. Use `-grey` variant for inactive/unselected module indicators.
8. Never stretch or recolor logos – use the provided variants.

### Login / Public Page Logo Usage

Login and unauthenticated pages follow a consistent brand layout:

1. **DGEM logo** (`logo-dgem.svg`) – centered, `96px` height (`h-24`), above the page title.
2. **Capgemini spade** (`logo-cap-small.svg`) – fixed to the bottom-right corner, `24px` max-width, with `px-6 pb-6` padding from the viewport edge.
3. The login card itself has **no card wrapper** – content sits directly on the page background.
4. Button text reads **"Sign in with DGEM"** with a Lucide `LogIn` icon to the left of the text. The icon swaps to a CSS spinner while the OAuth redirect is in progress.
5. **Gradient background.** The login page uses the same `.gradient-bg` overlay as the rest of the app, rendered as a fixed `aria-hidden` layer behind the content over the `--color-page-bg` (`#F3F4F5`) base.
6. Loading state: replace the `LogIn` icon with a CSS-only spinner (`animate-spin rounded-full border-2`). Keep button text visible. Disable the button while loading.
7. Error state: if the URL contains an `?error` param, display an inline error banner above the button (red border, red text, rounded).

```html
<!-- Login page structure -->
<div class="min-h-screen flex flex-col relative">
  <main class="flex-1 flex items-center justify-center px-6 relative z-10">
    <div class="w-full max-w-sm text-center">
      <img src="logo-dgem.svg" alt="DGEM" class="h-24 w-auto mx-auto mb-6" />
      <h1 class="text-3xl font-bold mb-2">{App Name}</h1>
      <p class="text-muted-foreground mb-10">{Description}</p>
      <button class="dgem-btn dgem-btn-lg dgem-btn--filled w-full gap-2">
        <LogIn size={16} /> Sign in with DGEM
      </button>
    </div>
  </main>
  <div class="flex justify-end px-6 pb-6 relative z-10">
    <img src="logo-cap-small.svg" alt="Capgemini" class="max-w-[24px] h-auto" />
  </div>
</div>
```
