# Screenshots Checklist

Use this checklist when capturing assets for Devpost and the README.

## Required
- PR Baseline Impact Report comment (top summary and at least one file section)
- Code Scanning alerts page showing findings from `baseline-impact.sarif`
- VS Code diagnostics in `examples/demo-app/main.js` (View Transitions)
- VS Code diagnostics in `examples/demo-app/style.css` (CSS :has())
- VS Code diagnostics in `examples/demo-app/index.html` (<dialog> and `popover`)
- VS Code Quick Fix action displayed on a diagnostic
- CLI Markdown scan output (terminal): `bic scan . --format md`
- CLI SARIF generation (terminal): `bic scan . --format sarif --out baseline-impact.sarif`
- `baseline.config.json` open in editor, explain minBaselineYear
- GitHub Releases showing attached `.vsix`

## Filenames
- pr-baseline-impact-report.png
- code-scanning-alerts.png
- vscode-main-view-transition.png
- vscode-style-has.png
- vscode-index-dialog-popover.png
- vscode-quick-fix.png
- cli-scan-md.png
- cli-scan-sarif.png
- baseline-config.png
- release-vsix.png

## Tips
- Use a clean, high-DPI theme with readable font sizes.
- Crop tightly to the relevant UI.
- Keep consistent width when possible (e.g., 1600px).
- Store images in this directory and reference them from `SUBMISSION.md` and the repo `README.md`.
