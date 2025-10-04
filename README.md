# Baseline Impact Copilot

Baseline Impact Copilot integrates Baseline web feature data into your workflow (IDE, CLI, and PRs) to accelerate safe adoption of modern web features. It flags risky usage, links to MDN with guidance, enforces team policies, and even applies automated fixes (codemods).

## Why Baseline
- Baseline provides a common, vendor-backed understanding of when web features are broadly safe to use.
- Developers waste time checking MDN/caniuse and guessing about production readiness. We bring those answers into the IDE, CI, and PR reviews.
- Data sources: curated rules in `packages/core/features.js` and optional enrichment via the `web-features` dataset.

## Sources
- `web-features` npm package (official Baseline dataset)
- Web Platform Dashboard (Baseline status reference)

Baseline Impact Copilot is a developer assistant that integrates Baseline web feature data into your workflow:

- VS Code extension that highlights risky modern web features and suggests fallbacks
- CLI that scans code and emits SARIF/Markdown reports for CI
- GitHub Action that posts a Baseline Impact Report on pull requests

This monorepo uses plain JavaScript for fast iteration and zero build steps. It ships with a small built-in feature dataset and supports the official `web-features` dataset when available.

## Presentation
- Slides: `docs/presentation/deck.md` (Reveal.js at `docs/presentation/index.html`)
- GitHub Pages (optional): set Pages source to `/docs` to serve the deck at `/presentation/`

## Quick start

1) Install dependencies

```bash
npm install
```

2) Run a scan on a directory

```bash
node packages/cli/bin/bic.js scan . --format md
```

3) Diff-aware scan (only changed lines in git)

```bash
node packages/cli/bin/bic.js scan . --format md --diff
```

4) Apply policy and fail on errors

```bash
# baseline.config.json controls minBaselineYear and ignored features
node packages/cli/bin/bic.js scan . --format sarif --fail-on error --out baseline-impact.sarif
```

5) VS Code extension

- Open `baseline-impact-copilot/` in VS Code
- Press F5 to launch the extension host and open a sample project

6) GitHub Action

See `.github/workflows/baseline-impact-report.yml` for a ready-to-copy workflow.

## Fixes (codemods)

Preview fixes without changing files:

```bash
node packages/cli/bin/bic.js fix . --dry-run
```

Apply simple guard/fallback inserts:

```bash
node packages/cli/bin/bic.js fix .
```

Currently implemented:

- View Transitions: insert `if (document.startViewTransition) { ... }` guard hint.
- CSS :has(): suggest `CSS.supports(':has(*)')` guard comment.
- HTML <dialog>: suggest polyfill and feature-detect comment.

## Packages

- `packages/core` — feature detection and reporting engine
- `packages/cli` — CLI using the core engine
- `packages/vscode` — VS Code extension surfacing diagnostics

## Judging alignment

- Innovation: Diff-aware reports, actionable fallbacks, MDN links, and optional codemods (future work)
- Usefulness: IDE diagnostics + CI reports + PR comments cover daily developer workflows

## License

MIT
