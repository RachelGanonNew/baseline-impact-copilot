#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { analyzeFilesSync, toMarkdown, toSarif, normalizePolicy } = require('@bic/core');
const recast = require('recast');
const t = recast.types.namedTypes;
const b = recast.types.builders;

function walk(dir, exts, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'dist', 'build', '.next'].includes(entry.name)) continue;
      walk(p, exts, out);
    } else {
      const ext = path.extname(p).toLowerCase();
      if (!exts.length || exts.includes(ext)) out.push(p);
    }
  }
  return out;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (typeof v !== 'undefined' && v !== '') {
        args[k] = v;
      } else {
        const next = argv[i + 1];
        if (next && !next.startsWith('-')) {
          args[k] = next;
          i++; // consume value
        } else {
          args[k] = true;
        }
      }
    } else {
      args._.push(a);
    }
  }
  return args;
}

function main() {
  const args = parseArgs(process.argv);
  const cmd = args._[0];
  if (cmd !== 'scan' && cmd !== 'fix') {
    console.error('Usage:\n  bic scan <path> [--exts=.js,.ts,.css,.html] [--format=md|sarif] [--out=FILE] [--diff] [--policy FILE] [--fail-on error|any|none]\n  bic fix  <path> [--exts=.js,.ts,.css,.html] [--dry-run] [--policy FILE]');
    process.exit(2);
  }
  const target = args._[1] || '.';
  const exts = (args.exts || '.js,.jsx,.ts,.tsx,.css,.html').split(',');
  let files = fs.existsSync(target) && fs.statSync(target).isDirectory()
    ? walk(target, exts)
    : [target];

  // Load policy from file or default
  let policy = null;
  const policyPath = args.policy || findPolicyFile(process.cwd());
  if (policyPath && fs.existsSync(policyPath)) {
    try { policy = JSON.parse(fs.readFileSync(policyPath, 'utf8')); } catch (_) { policy = null; }
  }
  policy = normalizePolicy(policy);

  // Diff-aware: restrict to changed files and lines if --diff
  let changed = null;
  if (args.diff) {
    changed = getChangedLines();
    const changedFiles = new Set(Object.keys(changed));
    files = files.filter(f => changedFiles.has(normalizeGitPath(f)));
  }

  let results = analyzeFilesSync(files, { policy });

  if (cmd === 'fix') {
    if (args.ast) {
      const jsFiles = files.filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
      const count = applyAstTransforms(jsFiles);
      console.log(`Applied AST transforms to ${count} file(s).`);
      return;
    }
    const plan = buildFixPlan(results);
    if (args['dry-run']) {
      printFixPlan(plan);
      return;
    }
    applyFixPlan(plan);
    console.log(`Applied fixes to ${Object.keys(plan).length} file(s).`);
    return;
  }

  if (args.diff && changed) {
    // Filter findings to only those on added/modified lines
    results = results.map(r => {
      const key = normalizeGitPath(r.filePath);
      const ranges = changed[key] || [];
      const kept = r.findings.filter(f => inAnyRange(f.line, ranges));
      return { ...r, findings: kept };
    });
  }
  const format = (args.format || 'md').toLowerCase();
  const failOn = (args['fail-on'] || (policy.minBaselineYear ? 'error' : 'none')).toLowerCase();
  if (format === 'sarif') {
    const sarif = JSON.stringify(toSarif(results), null, 2);
    if (args.out) fs.writeFileSync(args.out, sarif); else console.log(sarif);
  } else {
    const md = toMarkdown(results);
    if (args.out) fs.writeFileSync(args.out, md); else console.log(md);
  }

  // Determine exit code based on fail-on setting
  const flat = results.flatMap(r => r.findings);
  const hasAny = flat.length > 0;
  const hasError = flat.some(f => f.severity === 'error');
  if ((failOn === 'any' && hasAny) || (failOn === 'error' && hasError)) {
    process.exit(1);
  }
}

function applyAstTransforms(files) {
  let changed = 0;
  for (const file of files) {
    let src;
    try { src = fs.readFileSync(file, 'utf8'); } catch { continue; }
    let ast;
    try { ast = recast.parse(src, { parser: require('recast/parsers/typescript') }); } catch { continue; }
    let modified = false;
    recast.types.visit(ast, {
      visitCallExpression(path) {
        const { node } = path;
        // Match document.startViewTransition(<fn>)
        if (
          t.MemberExpression.check(node.callee) &&
          t.Identifier.check(node.callee.object) && node.callee.object.name === 'document' &&
          ((t.Identifier.check(node.callee.property) && node.callee.property.name === 'startViewTransition') ||
           (t.Literal.check(node.callee.property) && node.callee.property.value === 'startViewTransition')) &&
          node.arguments && node.arguments.length === 1 &&
          (t.FunctionExpression.check(node.arguments[0]) || t.ArrowFunctionExpression.check(node.arguments[0]))
        ) {
          const cb = node.arguments[0];
          // Build: document.startViewTransition ? document.startViewTransition(cb) : (cb())
          const cond = b.conditionalExpression(
            b.memberExpression(b.identifier('document'), b.identifier('startViewTransition')),
            b.callExpression(
              b.memberExpression(b.identifier('document'), b.identifier('startViewTransition')),
              [cb]
            ),
            b.callExpression(cb, [])
          );
          path.replace(cond);
          modified = true;
          return false;
        }
        this.traverse(path);
      }
    });
    if (modified) {
      const out = recast.print(ast).code;
      fs.writeFileSync(file, out, 'utf8');
      changed++;
    }
  }
  return changed;
}

if (require.main === module) main();

function findPolicyFile(cwd) {
  const candidates = [
    path.join(cwd, 'baseline.config.json'),
    path.join(cwd, '.baseline.json'),
  ];
  return candidates.find(p => fs.existsSync(p));
}

function normalizeGitPath(p) {
  return p.replace(/\\/g, '/');
}

function inAnyRange(line, ranges) {
  for (const [start, end] of ranges) {
    if (line >= start && line <= end) return true;
  }
  return false;
}

function getChangedLines() {
  // Use git diff against HEAD with zero context to capture added/modified lines
  try {
    const out = cp.execSync('git diff --unified=0 --no-color', { encoding: 'utf8' });
    return parseUnifiedDiff(out);
  } catch (_) {
    return {};
  }
}

function parseUnifiedDiff(text) {
  const fileRanges = {};
  let currentFile = null;
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (line.startsWith('+++ b/')) {
      currentFile = line.slice(6);
      if (currentFile) fileRanges[currentFile] = fileRanges[currentFile] || [];
    } else if (line.startsWith('@@')) {
      // Example: @@ -a,b +c,d @@
      const m = /@@\s-\d+(?:,\d+)?\s\+(\d+)(?:,(\d+))?\s@@/.exec(line);
      if (m && currentFile) {
        const start = parseInt(m[1], 10);
        const len = m[2] ? parseInt(m[2], 10) : 1;
        const end = start + Math.max(len - 1, 0);
        fileRanges[currentFile].push([start, end]);
      }
    }
  }
  return fileRanges;
}

function buildFixPlan(results) {
  // Returns { filePath: [{ line: number, text: string }, ...] }
  const plan = {};
  for (const r of results) {
    if (!r.findings.length) continue;
    for (const f of r.findings) {
      let text = null;
      if (f.featureId === 'view-transitions') {
        text = "if (document.startViewTransition) { /* TODO: move guarded call inside */ }";
      } else if (f.featureId === 'css-has-selector') {
        text = "/* Consider guarding styles with CSS.supports(':has(*)') */";
      } else if (f.featureId === 'html-dialog') {
        text = "<!-- Consider a dialog polyfill and feature-detect: 'if (window.HTMLDialogElement) { ... }' -->";
      }
      if (!text) continue;
      (plan[r.filePath] = plan[r.filePath] || []).push({ line: f.line, text });
    }
  }
  // Sort insertions per file by line asc to apply cleanly
  for (const k of Object.keys(plan)) {
    plan[k].sort((a, b) => a.line - b.line);
  }
  return plan;
}

function applyFixPlan(plan) {
  for (const [file, edits] of Object.entries(plan)) {
    let content = fs.readFileSync(file, 'utf8');
    const lines = content.split(/\r?\n/);
    let added = 0;
    for (const e of edits) {
      const idx = Math.max(e.line - 1 + added, 0);
      lines.splice(idx, 0, e.text);
      added += 1;
    }
    const out = lines.join('\n');
    fs.writeFileSync(file, out, 'utf8');
  }
}

function printFixPlan(plan) {
  for (const [file, edits] of Object.entries(plan)) {
    console.log(`\n# ${file}`);
    for (const e of edits) {
      console.log(`+ [line ${e.line}] ${e.text}`);
    }
  }
}
