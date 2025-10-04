# Playbook: View Transitions API

## Summary
Use `document.startViewTransition(fn)` to animate DOM updates when supported; otherwise gracefully fall back.

## Guard Pattern
```js
if (document.startViewTransition) {
  document.startViewTransition(() => {
    // DOM update here
  });
} else {
  // Fallback DOM update
}
```

## Notes
- Keep transitions short and avoid heavy synchronous work in the callback.
- Consider reduced-motion preferences.

## References
- MDN: https://developer.mozilla.org/docs/Web/API/View_Transitions_API
