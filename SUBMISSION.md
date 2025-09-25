# Baseline Impact Copilot — Devpost Submission Draft

## Project Summary
Baseline Impact Copilot integrates Baseline web feature data into IDEs, CI, and PR workflows so teams can confidently adopt modern web features. It highlights risky usage, links to MDN with guidance, enforces team policy thresholds, and offers automated fixes (codemods).

- IDE (VS Code): Inline diagnostics and quick fixes for features like View Transitions, CSS :has(), <dialog>, Popover API.
- CLI: Scans code and outputs Markdown and SARIF (for GitHub Code Scanning).
- GitHub Action: Posts a Baseline Impact Report comment on PRs, diff-aware, and uploads SARIF.
- Codemods: AST-based guard insertion for `document.startViewTransition`. More codemods planned.

Repo: https://github.com/RachelGanonNew/baseline-impact-copilot

## Screenshots (placeholders)
![PR Report](docs/screenshots/pr-baseline-impact-report.png)
![Code Scanning Alerts](docs/screenshots/code-scanning-alerts.png)
![VS Code - View Transitions](docs/screenshots/vscode-main-view-transition.png)
![VS Code - CSS :has()](docs/screenshots/vscode-style-has.png)
![VS Code - Dialog & Popover](docs/screenshots/vscode-index-dialog-popover.png)
![VS Code - Quick Fix](docs/screenshots/vscode-quick-fix.png)
![CLI - Markdown](docs/screenshots/cli-scan-md.png)
![CLI - SARIF](docs/screenshots/cli-scan-sarif.png)
![Policy](docs/screenshots/baseline-config.png)
![Release VSIX](docs/screenshots/release-vsix.png)

## Problem
Developers hesitate to ship modern web features because they don’t know whether a feature is safe across their target environments. They jump between MDN, caniuse, and blog posts, and still can’t enforce decisions in CI or surface guidance in their IDE.

## Solution
Baseline Impact Copilot turns Baseline data into actionable, context-rich insights everywhere:

- VS Code surfaces diagnostics as you type, with MDN links and suggested fallbacks.
- The CLI produces Markdown (for humans) and SARIF (for scanners) reports.
- GitHub Action comments on PRs with a Baseline Impact Report and uploads SARIF to Code Scanning.
- Policy file (`baseline.config.json`) lets teams set thresholds (e.g., "fail on features newer than 2024").
- Codemods provide one-command refactors to guard or polyfill risky usage.

## What We Built
- `packages/core/`: Detection engine with curated feature patterns and optional enrichment via `web-features`.
- `packages/cli/`: `bic scan` to report risks, `bic fix` to apply quick fixes, and `--ast` for code transforms.
- `packages/vscode/`: Extension with diagnostics and quick fixes. A `.vsix` is packaged for easy install.
- `.github/workflows/baseline-impact-report.yml`: Diff-aware PR report and SARIF upload.
- `.github/workflows/release-vsix.yml`: Builds and uploads `.vsix` on release.

## Innovation
- Diff-aware PR comments: only discuss what changed. Clear, low-noise guidance.
- Policy-driven severity and CI behavior using `baseline.config.json`.
- Actionable fixes: beyond warnings, we provide AST-based codemods and IDE quick fixes.
- Unified tooling: IDE + CLI + PR + Code Scanning, all aligned on the same Baseline data and policy.

## Usefulness
- Immediate value with zero setup: Markdown reports and VSIX install.
- Applies across frameworks (React/Vue/Svelte) and ecosystems.
- SARIF makes findings visible in GitHub’s Code Scanning UI.

## How to Run (Judges)
1) Open the repo and the demo PR:
   - PRs: https://github.com/RachelGanonNew/baseline-impact-copilot/pulls
   - Observe the "Baseline Impact Report" PR comment and Code Scanning alerts.

2) Local run (Windows/macOS/Linux):
   ```bash
   npm install
   node packages/cli/bin/bic.js scan . --format md
   node packages/cli/bin/bic.js scan . --format md --diff
   node packages/cli/bin/bic.js scan . --format sarif --out baseline-impact.sarif
   ```

3) VS Code extension:
   - Install the `.vsix` from the release assets or run via F5 from `packages/vscode/`.
   - Open `examples/demo-app/` to see diagnostics and try quick fixes.

4) Codemods:
   ```bash
   node packages/cli/bin/bic.js fix examples/demo-app --ast
   node packages/cli/bin/bic.js fix . --dry-run
   ```

## Baseline Data Sources
- Curated patterns in `packages/core/features.js` targeting high-impact APIs (View Transitions, CSS :has(), Popover, Dialog, URLPattern, URL.canParse, FS Access, Intl APIs, Web Share, etc.).
- Optional enrichment from `web-features` provides MDN links and baseline status when available.

## Demo Flow (3–4 minutes)
1) Problem framing: adoption friction and uncertainty.
2) IDE demo: show diagnostics and quick fixes on `examples/demo-app/`.
3) PR demo: open the demo PR → see Baseline Impact Report comment and SARIF alerts.
4) CLI demo: run `bic scan` and show summary + details.
5) Codemods: run `bic fix --ast` for View Transitions.
6) Vision: more codemods, richer rules, and runtime readiness telemetry.

## Future Work
- Additional codemods and quick fixes for Dialog, Popover, CSS Nesting and :has() in CSS-in-JS.
- Repo-level Baseline policies integrated with build pipeline configurations.
- Runtime Guardian: real-user feature telemetry and automated polyfill removal recommendations.

## License
MIT
