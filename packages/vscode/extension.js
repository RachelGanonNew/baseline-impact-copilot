const vscode = require('vscode');
const { analyzeContent } = require('@bic/core');

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
