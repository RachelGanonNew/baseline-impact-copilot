# Baseline Impact Copilot

Baseline Impact Copilot is a developer assistant that integrates Baseline web feature data into your workflow:

- VS Code extension that highlights risky modern web features and suggests fallbacks
- CLI that scans code and emits SARIF/Markdown reports for CI
- GitHub Action that posts a Baseline Impact Report on pull requests

This monorepo uses plain JavaScript for fast iteration and zero build steps. It ships with a small built-in feature dataset and supports the official `web-features` dataset when available.

## Quick start

1) Install dependencies

```bash
npm install
```

2) Run a scan on a directory

```bash
node packages/cli/bin/bic.js scan . --format md
```

3) VS Code extension

- Open `baseline-impact-copilot/` in VS Code
- Press F5 to launch the extension host and open a sample project

4) GitHub Action

See `.github/workflows/baseline-impact-report.yml` for a ready-to-copy workflow.

## Packages

- `packages/core` — feature detection and reporting engine
- `packages/cli` — CLI using the core engine
- `packages/vscode` — VS Code extension surfacing diagnostics

## Judging alignment

- Innovation: Diff-aware reports, actionable fallbacks, MDN links, and optional codemods 
- Usefulness: IDE diagnostics + CI reports + PR comments cover daily developer workflows

## Demo 
https://youtu.be/f7Jr-FxVMb0

## License

MIT


Built with ❤️ for Baseline Hackthon 2025
