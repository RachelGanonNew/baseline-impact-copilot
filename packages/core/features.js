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
  ,
  {
    id: "popover-api-js",
    title: "Popover API (JS)",
    type: "js",
    pattern: /\.(showPopover|hidePopover)\s*\(/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/Popover_API",
    fallback: "Guard with if (HTMLElement.prototype.showPopover) or provide headless UI fallback.",
    baseline: "2023"
  },
  
  {
    id: "css-nesting",
    title: "CSS Nesting",
    type: "css",
    pattern: /\n\s*&\s*[.#:\[]|@nest\b/g,
    mdn: "https://developer.mozilla.org/docs/Web/CSS/CSS_nesting",
    fallback: "Use PostCSS nesting plugin or flatten selectors for unsupported targets.",
    baseline: "2024"
  },
  {
    id: "url-can-parse",
    title: "URL.canParse",
    type: "js",
    pattern: /URL\s*\.\s*canParse\s*\(/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/URL/canParse_static",
    fallback: "Fallback to try/catch around new URL() or regex validation.",
    baseline: "2023"
  },
  {
    id: "fs-access-api",
    title: "File System Access API",
    type: "js",
    pattern: /show(Save|Open)FilePicker\s*\(|FileSystem(File|Directory)Handle\b/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/File_System_Access_API",
    fallback: "Fallback to <input type=file> uploads and server-side storage.",
    baseline: "2022"
  },
  {
    id: "intl-duration-format",
    title: "Intl.DurationFormat",
    type: "js",
    pattern: /Intl\s*\.\s*DurationFormat\b/g,
    mdn: "https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Intl/DurationFormat",
    fallback: "Fallback to custom formatting utilities when unavailable.",
    baseline: "2024"
  },
  {
    id: "web-share",
    title: "Web Share API",
    type: "js",
    pattern: /navigator\s*\.\s*share\s*\(/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/Navigator/share",
    fallback: "Provide copy-to-clipboard fallback or custom share UI when not supported.",
    baseline: "2020"
  }
  ,
  {
    id: "css-view-transitions-selectors",
    title: "CSS View Transitions selectors",
    type: "css",
    pattern: /::view-transition\b|:active-view-transition\b|::view-transition-(group|old|new)\b/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/View_Transitions_API",
    fallback: "Gate styles with feature detection and provide CSS animation fallbacks.",
    baseline: "2024"
  },
  {
    id: "urlpattern-usage",
    title: "URLPattern (routes)",
    type: "js",
    pattern: /new\s+URLPattern\s*\(\s*\{[^}]*\}/g,
    mdn: "https://developer.mozilla.org/docs/Web/API/URLPattern",
    fallback: "Prefer library routing or guard with try/catch and regex fallback.",
    baseline: "2023"
  }
];
