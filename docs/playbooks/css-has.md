# Playbook: CSS :has()

## Summary
The `:has()` selector enables parent-selecting patterns. Support is improving but not universal; use progressive enhancement.

## Guard Pattern
```css
@supports selector(:has(*)) {
  /* Place styles that rely on :has() here */
  .card:has(img) {
    border: 1px solid #ccc;
  }
}
```

## Notes
- For non-supporting browsers, consider DOM-based toggles or parent state classes.
- Test performance on complex selectors.

## References
- MDN: https://developer.mozilla.org/docs/Web/CSS/:has
