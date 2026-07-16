## Modals & Popups

### Standard Modal (Figma component)

Standard modals are used for content-heavy dialogs (forms, detail views, editors). They use the full `56rem` max-width and have separator borders between header/body/footer.

```html
<div class="dgem-modal-overlay">
  <div class="dgem-modal">
    <div class="dgem-modal-header">
      <h2>Title</h2>
      <button class="dgem-btn dgem-btn-sm dgem-btn--icon dgem-btn--ghost" aria-label="Close">
        <X size={14} />
      </button>
    </div>
    <div class="dgem-modal-body">
      <!-- content -->
    </div>
    <div class="dgem-modal-footer">
      <button class="dgem-btn dgem-btn-md dgem-btn--outlined">Cancel</button>
      <button class="dgem-btn dgem-btn-md dgem-btn--filled">Confirm</button>
    </div>
  </div>
</div>
```

| Property | Value |
|----------|-------|
| Overlay | `rgba(18,26,56,0.5)`, `backdrop-filter: blur(4px)`, centered flex |
| Modal background | `var(--color-background)` |
| Border radius | `12px` |
| Max width | `56rem` (896px) |
| Max height | `90vh` |
| Header padding | `24px` |
| Body padding | `0 24px 24px` (no top – flows from header) |
| Footer padding | `16px 24px`, gap `12px` |
| Z-index | `50` |
| Header/footer borders | **None** – clean, borderless layout |

### Entrance & Exit Animation

Modals use the same entrance pattern as the DGEM Search command palette, with a matching reverse exit animation:

| Element | Animation | Duration | Easing | Keyframes |
|---------|-----------|----------|--------|-----------|
| **Overlay enter** | Opacity 0 → 1 | 150ms | ease | `dgem-modal-overlay-in` |
| **Panel enter** | Opacity 0 → 1, scale 0.97 → 1, translateY(-8px → 0) | 200ms | ease | `dgem-modal-panel-in` |
| **Overlay exit** | Opacity 1 → 0 | 150ms | ease | `dgem-modal-overlay-out` |
| **Panel exit** | Opacity 1 → 0, scale 1 → 0.97, translateY(0 → -8px) | 150ms | ease | `dgem-modal-panel-out` |

**How it works:**
- **Enter**: The overlay fades in with `backdrop-filter: blur(4px)`. The panel fades in with a subtle scale-up and upward shift, creating a smooth "pop-in" feel. Both use `animation-fill-mode: both`.
- **Exit**: Adding the `dgem-modal-closing` class to the overlay triggers the reverse animations. The component stays mounted for 150ms while the animations play, then unmounts.
- Exit is slightly faster (150ms) than enter (200ms) for a snappy, responsive feel.

**Implementation pattern (React):**
```tsx
// The Modal component manages a two-phase close:
// 1. Parent sets open=false
// 2. Modal adds .dgem-modal-closing class (triggers exit CSS)
// 3. After 150ms, Modal unmounts from the DOM
// Body scroll lock is held until full unmount.
```

> **Note:** The exit animation is CSS-only via a `dgem-modal-closing` modifier class
> on the overlay. The React component simply delays unmount by 150ms to let the
> animation complete.

### Confirmation Dialog Pattern

Confirmation dialogs are a **compact modal variant** for binary/ternary decisions: "Are you sure?", "Discard changes?", "Leave without saving?". They use a **narrower width**, **no separator borders**, and a **split footer layout**.

```html
<div class="dgem-modal-overlay">
  <div class="dgem-modal dgem-modal--confirm">
    <div class="dgem-modal-header">
      <h2 class="text-h2 font-medium">Unsaved changes</h2>
      <button class="dgem-btn dgem-btn-sm dgem-btn--icon dgem-btn--ghost" aria-label="Close">
        <X size={14} />
      </button>
    </div>
    <div class="dgem-modal-body">
      <p>You have unsaved changes. Would you like to save your draft before leaving?</p>
    </div>
    <div class="dgem-modal-footer">
      <button class="dgem-btn dgem-btn-md dgem-btn--destructive">Leave without saving</button>
      <button class="dgem-btn dgem-btn-md dgem-btn--filled">Save and close</button>
    </div>
  </div>
</div>
```

**Confirmation dialog anatomy:**

| Property | Value |
|----------|-------|
| CSS modifier | `dgem-modal--confirm` (sets `max-width: 28rem` and `justify-content: space-between` on footer) |
| Max width | `28rem` (448px) – or Tailwind `!max-w-md` as override |
| Header/footer borders | **None** – clean separation via spacing only |
| Body text | `text-body2`, high-contrast (`text-navy/90` or similar) |
| Footer layout | `justify-content: space-between` – destructive action on **left**, safe/primary action on **right** |

**Button arrangement in confirmation dialogs:**

| Position | Button | Variant | Purpose |
|----------|--------|---------|----------|
| Left | Destructive action | `dgem-btn--destructive` | The dangerous choice (leave, discard, delete) |
| Right | Safe action | `dgem-btn--filled` | The safe choice (save, keep, cancel) |

> **Why no Cancel button?** Confirmation dialogs should present a clear binary choice.
> The close (×) icon in the header and overlay click already serve as "go back" / dismiss.
> Adding a third "Cancel" button creates decision fatigue and clutters the compact layout.

**When to use a confirmation dialog:**
- Navigating away from a form with unsaved changes
- Deleting a resource that cannot be recovered
- Discarding a draft or in-progress work
- Any action that may result in data loss

### Legacy Popup (deprecated)

The legacy popup pattern (avoid in new code):

| Property | Value |
|----------|-------|
| Overlay | `rgba(0,0,0,0.8)` |
| Width | `920px`, `max-width: 95%` |
| Border radius | `0` (legacy – no radius) |
| Padding | `24px` |
| Close button | `top: 16px`, `right: 16px` |
| Z-index | `1000` |

### Modal/Popup Rules

1. **Always use an overlay** – semi-transparent background prevents interaction with content behind.
2. **Lock body scroll** when modal is open: `body { overflow: hidden }`.
3. **Close on overlay click** (unless the modal requires an explicit decision).
4. **Close on Escape key**.
5. **Focus trap** – Tab should cycle within the modal.
6. **No separator borders** – header, body, and footer sections are visually separated by spacing alone. Do NOT add `border-bottom` or `border-top` between modal sections.
7. **Footer buttons**: Destructive action on left, primary/safe action on right. For standard (non-confirmation) modals: cancel left, confirm right.
8. **Confirmation dialogs** use a narrow width (`max-w-md` / `28rem`) and a binary button layout (see the Confirmation Dialog Pattern section above).
9. **Body text in confirmation dialogs** should be clearly legible – use `text-navy/90` or higher contrast, never below `text-navy/70`.
10. Always use the `dgem-modal` CSS classes. The legacy popup pattern is deprecated.
