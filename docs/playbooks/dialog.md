# Playbook: HTML Dialog

## Summary
Use `<dialog>` for modal and non-modal dialogs where supported; otherwise use accessible modal patterns with ARIA.

## Guard Pattern
```html
<!-- Feature detect and polyfill as needed -->
<script>
if (!('HTMLDialogElement' in window)) {
  // Initialize your dialog polyfill here
}
</script>
```

## Notes
- Always trap focus and provide keyboard escape.
- Ensure `aria-modal="true"` and labelled content.

## References
- MDN: https://developer.mozilla.org/docs/Web/HTML/Element/dialog
