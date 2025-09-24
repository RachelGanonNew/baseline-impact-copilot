# Demo Script (3–4 minutes)

## Scene 1 — Problem (20s)
- Open a small web app PR that adds modern features (e.g., CSS :has(), URLPattern, View Transitions).
- Say: "Developers hesitate to ship new features because compatibility is unclear. Baseline Impact Copilot turns that uncertainty into clear, actionable guidance."

## Scene 2 — IDE Assistance (60s)
- Open a file in VS Code using the extension.
- Show inline diagnostics on lines using `:has()`, `document.startViewTransition()`, and `<dialog>`.
- Click MDN link in related information.
- Mention fallback guidance baked into the diagnostic message.

## Scene 3 — CI & PR Report (60s)
- Show `.github/workflows/baseline-impact-report.yml`.
- Open a PR where the Action posted a "Baseline Impact Report".
- Highlight the table: file, line, MDN link, fallback.
- Note: "Teams can set a Baseline policy to fail CI only when risk exceeds thresholds (future work)."

## Scene 4 — CLI for local checks (30s)
- Run:
  ```bash
  node packages/cli/bin/bic.js scan . --format md
  ```
- Show quick summary and how to emit SARIF for code scanning dashboards.

## Scene 5 — Vision (30s)
- Mention upcoming features:
  - Diff-aware PR comments and autofix codemods for common patterns.
  - Runtime Guardian: real-user feature telemetry to recommend removing polyfills.
  - Design System DocSync to propagate Baseline contracts upstream.

## Close (10s)
- "Baseline Impact Copilot integrates Baseline data into IDE, CI, and PRs—actionable, context-rich, and ready to adopt today."
