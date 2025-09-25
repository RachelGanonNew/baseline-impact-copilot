# Baseline Impact Copilot

- Rachel Ganon — Hackathon Submission
- Repo: https://github.com/RachelGanonNew/baseline-impact-copilot
- VSIX: see latest Release
- Demo PR: GitHub → Pull Requests

---

## Problem

- Developers hesitate to ship modern web features.
- They bounce between MDN, caniuse, and blogs.
- No consistent, enforceable signal in IDE/CI/PR.

---

## Solution

- Integrate Baseline data where developers work.
- IDE diagnostics + quick fixes.
- CLI with Markdown + SARIF.
- PR bot with diff-aware Baseline Impact Report.
- Policy thresholds and codemods.

---

## Demo Flow (90–120s)

- IDE: open `examples/demo-app/` and show diagnostics.
- Quick fix: View Transitions guard snippet.
- PR: Baseline Impact Report + Code Scanning.
- CLI: `bic scan` (md + sarif) and `bic fix` (plan/patch).

---

## Architecture

- `packages/core/` — detection + reporting engine.
- `packages/cli/` — scan/fix, SARIF/patch/plan.
- `packages/vscode/` — diagnostics + quick fixes.
- `.github/workflows/` — PR report, SARIF, fix plan + patch artifacts.

---

## Key Features

- Summary + Top risks + Next steps in reports.
- Playbook links for actionable guidance.
- Diff-aware PR comments (base..head).
- Policy in `baseline.config.json`.
- Codemods (`--ast`, `--emit-patch`, `--out-plan`).

---

## Baseline + Data

- Curated rules: View Transitions, CSS :has(), Dialog, Popover, URLPattern, URL.canParse,
  File System Access, Intl APIs, Web Share, CSS Nesting, CSS View Transitions selectors.
- Optional enrichment via `web-features` package.

---

## Innovation

- Not just warnings: codemods, patch artifacts, and Playbooks.
- Diff-aware precision in PRs.
- Unified IDE + CI + PR + Code Scanning.

---

## Usefulness

- Works immediately with minimal setup.
- Clear, consistent guidance with MDN links.
- Enforcement via policy and CI fail-on.

---

## Policy & Governance

- `baseline.config.json` → minBaselineYear + ignore.
- CI gate: `--fail-on error`.
- Team-wide consistency.

---

## Codemods & Patches

- `bic fix . --dry-run --out-plan fix-plan.md` (plan)
- `bic fix . --emit-patch baseline-fixes.patch` (unified diff)
- `bic fix examples/demo-app --ast` (View Transitions)

---

## Roadmap

- More codemods: Dialog, :has() CSS-in-JS, Popover JS.
- Report grouping by severity/feature.
- Framework adapters (React/Vue/Svelte).
- Runtime readiness telemetry.

---

## Call to Action

- Try the VSIX and CLI.
- Open the demo PR.
- Review the Baseline Impact Report and artifacts.
- Adopt policy + codemods, ship modern features safely.
