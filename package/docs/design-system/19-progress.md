## Progress Indicators

### Progress Bar

```html
<div class="dgem-progress-bar" style="width: 200px">
  <div class="dgem-progress-bar-fill" style="width: 60%"></div>
</div>
```

Height: `4px`, full-width track with filled portion.

### Progress Steps

```html
<div class="dgem-progress-step dgem-progress-step-complete">✓</div>
<div class="dgem-progress-step dgem-progress-step-active">2</div>
<div class="dgem-progress-step dgem-progress-step-pending">3</div>
```

Step icons: `32×32px` circles, numbered or with check/error/warning icons.

| Step State | Background | Text |
|------------|-----------|------|
| Complete | `#17A34C` | White (check icon) |
| Active | `#0058AB` | White (number) |
| Error | `#E30021` | White |
| Warning | `#FEB100` | Dark Blue |
| Pending | `#E5E5E5` | `#71717A` |
| Disabled | `#F4F4F5` | `#CCCCCC` |

### Loader

SVG circular spinner with DGEM brand colors cycling through:

```
#0058AB → #1DB8F2 → #00D5D0 → #121A38 → #FEB100
```

Default size: `48px`. Implement as a lightweight SVG animation component.
