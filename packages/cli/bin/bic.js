#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const { analyzeFilesSync, toMarkdown, toSarif, normalizePolicy } = require('@bic/core');

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
  if (cmd !== 'scan') {
    console.error('Usage: bic scan <path> [--exts=.js,.ts,.css,.html] [--format=md|sarif] [--out=FILE]');
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
