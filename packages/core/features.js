// Minimal built-in feature dataset with patterns and guidance.
// When available, prefer consuming the official `web-features` package.

module.exports = [
  {
    id: "css-has-selector",
    title: "CSS :has() selector",
    type: "css",
    pattern: /:has\s*\(/g,
    mdn: "https://developer.mozilla.org/docs/Web/CSS/:has",
    fallback: "Use DOM-based toggles or parent-state classes. Consider progressive enhancement: guard with CSS.supports(':has(*)').",
    baseline: "2023"
  },
  {
    id: "css-subgrid",
    title: "CSS Subgrid",
    type: "css",
    pattern: /subgrid/g,
    mdn: "https://developer.mozilla.org/docs/Web/CSS/CSS_grid_layout/Subgrid",
    fallback: "Fallback to nested grids or explicit row/column sizing for non-supporting browsers.",
    baseline: "2023"
  },
  {
    id: "html-dialog",
    title: "<dialog> element",
    type: "html",
    pattern: /<\s*dialog\b/gi,
    mdn: "https://developer.mozilla.org/docs/Web/HTML/Element/dialog",
    fallback: "Polyfill with accessible modal patterns; feature-detect with HTMLDialogElement in window.",
    baseline: "2022"
  },
  {
    id: "view-transitions",
    title: "View Transitions API",
    type: "js",
    pattern: /document\.startViewTransition\s*\(/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/View_Transitions_API",
    fallback: "Guard calls with 'if (document.startViewTransition) { ... }' and provide CSS-based fallback animations.",
    baseline: "2024"
  },
  {
    id: "intl-segmenter",
    title: "Intl.Segmenter",
    type: "js",
    pattern: /Intl\s*\.\s*Segmenter\b/g,
    mdn: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter",
    fallback: "Gracefully degrade to simple tokenization when Segmenter is unavailable.",
    baseline: "2022"
  },
  {
    id: "urlpattern",
    title: "URLPattern",
    type: "js",
    pattern: /\bURLPattern\b/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/URLPattern",
    fallback: "Use regex-based routing libs or 'path-to-regexp' as a fallback.",
    baseline: "2023"
  },
  {
    id: "scheduler-posttask",
    title: "scheduler.postTask",
    type: "js",
    pattern: /scheduler\s*\.\s*postTask\s*\(/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/Scheduler/postTask",
    fallback: "Fallback to requestIdleCallback or setTimeout with priortization heuristics.",
    baseline: "2023"
  },
  {
    id: "popover-api",
    title: "Popover API",
    type: "html",
    pattern: /\bpopover\b(=|\s|>)/gi,
    mdn: "https://developer.mozilla.org/docs/Web/API/Popover_API",
    fallback: "Use headless UI patterns for popovers; gate by HTMLPopoverElement in window.",
    baseline: "2023"
  }
];
