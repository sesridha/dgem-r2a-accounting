## Scrollbars

Custom scrollbar styling (Webkit):

```css
.dgem-scrollbar::-webkit-scrollbar { width: 6px; }
.dgem-scrollbar::-webkit-scrollbar-track { background: transparent; }
.dgem-scrollbar::-webkit-scrollbar-thumb {
  background-color: #CCCCCC;
  border-radius: 9999px;
}
.dgem-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: #9A9A9A;
}
```

Apply `.dgem-scrollbar` to any scrollable container. Track: transparent (or `#F4F4F5`), thumb: `#CCCCCC`, width: `4–6px`.
