const vscode = require('vscode');

// Inline minimal analyzer to avoid external deps in VSIX
const FEATURES = [
  {
    id: 'css-has-selector',
    title: 'CSS :has() selector',
    type: 'css',
    pattern: /:\s*has\s*\(/g,
    mdn: 'https://developer.mozilla.org/docs/Web/CSS/:has',
    fallback: "Use DOM-based toggles or parent-state classes. Consider CSS.supports(':has(*)').",
  },
  {
    id: 'html-dialog',
    title: '<dialog> element',
    type: 'html',
    pattern: /<\s*dialog\b/gi,
    mdn: 'https://developer.mozilla.org/docs/Web/HTML/Element/dialog',
    fallback: 'Polyfill with accessible modal patterns; feature-detect HTMLDialogElement.',
  },
  {
    id: 'view-transitions',
    title: 'View Transitions API',
    type: 'js',
    pattern: /document\.startViewTransition\s*\(/g,
    mdn: 'https://developer.mozilla.org/docs/Web/API/View_Transitions_API',
    fallback: "Guard with if (document.startViewTransition) { ... } and provide CSS fallback.",
  },
  {
    id: 'popover-api',
    title: 'Popover API',
    type: 'html',
    pattern: /\bpopover\b(=|\s|>)/gi,
    mdn: 'https://developer.mozilla.org/docs/Web/API/Popover_API',
    fallback: 'Use headless UI popover patterns as fallback.',
  }
];

function detectLanguage(filePath) {
  const ext = (filePath.split('.').pop() || '').toLowerCase();
  if (['css', 'scss', 'less'].includes(ext)) return 'css';
  if (['html', 'htm', 'svelte', 'vue'].includes(ext)) return 'html';
  return 'js';
}

function analyzeContent(filePath, text) {
  const lang = detectLanguage(filePath);
  const findings = [];
  for (const f of FEATURES) {
    if (f.type !== lang && !(lang === 'html' && f.type === 'css')) continue;
    const regex = new RegExp(f.pattern);
    let m;
    while ((m = regex.exec(text)) !== null) {
      const idx = m.index;
      const before = text.slice(0, idx);
      const line = before.split(/\r?\n/).length;
      findings.push({ ...f, line });
    }
  }
  return { language: lang, findings };
}

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  const collection = vscode.languages.createDiagnosticCollection('baselineImpact');
  context.subscriptions.push(collection);

  function refresh(doc) {
    if (!doc) return;
    const res = analyzeContent(doc.fileName, doc.getText());
    const diags = res.findings.map(f => {
      const range = new vscode.Range(Math.max(f.line - 1, 0), 0, Math.max(f.line - 1, 0), 200);
      const d = new vscode.Diagnostic(range, `${f.title}: ${f.fallback}`, vscode.DiagnosticSeverity.Warning);
      d.code = f.featureId;
      d.source = 'Baseline';
      d.relatedInformation = [new vscode.DiagnosticRelatedInformation(new vscode.Location(vscode.Uri.parse(f.mdn), new vscode.Position(0,0)), 'MDN Reference')];
      return d;
    });
    collection.set(doc.uri, diags);
  }

  vscode.workspace.textDocuments.forEach(refresh);
  context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(refresh));
  context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => refresh(e.document)));

  // Code actions (quick fixes)
  const provider = {
    provideCodeActions(document, range, context) {
      const actions = [];
      for (const diag of context.diagnostics) {
        if (diag.source !== 'Baseline') continue;
        const line = diag.range.start.line;
        if (diag.code === 'view-transitions') {
          actions.push(createInsertAboveAction(document, line, "if (document.startViewTransition) { /* TODO: move call inside */ }"));
        } else if (diag.code === 'css-has-selector') {
          actions.push(createInsertAboveAction(document, line, "/* Consider guarding styles with CSS.supports(':has(*)') */"));
        } else if (diag.code === 'html-dialog') {
          actions.push(createInsertAboveAction(document, line, "<!-- Consider a dialog polyfill and feature-detect HTMLDialogElement -->"));
        }
      }
      return actions;
    }
  };
  context.subscriptions.push(vscode.languages.registerCodeActionsProvider(['javascript','typescript','css','html'], provider, { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] }));

  function createInsertAboveAction(document, line, text) {
    const edit = new vscode.WorkspaceEdit();
    const insertPos = new vscode.Position(line, 0);
    edit.insert(document.uri, insertPos, text + "\n");
    const action = new vscode.CodeAction('Insert Baseline guard', vscode.CodeActionKind.QuickFix);
    action.edit = edit;
    action.isPreferred = true;
    return action;
  }
}

function deactivate() {}

module.exports = { activate, deactivate };
