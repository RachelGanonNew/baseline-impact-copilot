const fs = require('fs');
const path = require('path');
let FEATURES = require('./features');

// Try to enrich with official web-features data if available
try {
  // Some distributions expose as 'web-features/data/features.json'
  const wf = require('web-features/data/features.json');
  // Map a subset into our internal shape if present
  if (Array.isArray(wf) && wf.length) {
    // We won't replace our hand-curated patterns, but we can append MDN/baseline info for known ids
    const byId = new Map(FEATURES.map(f => [f.id, f]));
    for (const item of wf) {
      if (!item.id) continue;
      const existing = byId.get(item.id);
      if (existing) {
        existing.baseline = existing.baseline || (item.status && item.status.baseline && String(item.status.baseline));
        existing.mdn = existing.mdn || (item.mdn && (typeof item.mdn === 'string' ? item.mdn : item.mdn.url));
      }
    }
    FEATURES = Array.from(byId.values());
  }
} catch (_) {
  // offline fallback only
}

function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.css' || ext === '.scss' || ext === '.less') return 'css';
  if (ext === '.html' || ext === '.htm' || ext === '.svelte') return 'html';
  if (ext === '.vue') return 'html';
  return 'js';
}

function analyzeContent(filePath, content, options = {}) {
  const policy = normalizePolicy(options.policy);
  const lang = detectLanguage(filePath);
  const matches = [];
  for (const f of FEATURES) {
    if (policy.ignore && policy.ignore.includes(f.id)) continue;
    if (f.type !== lang && !(lang === 'html' && f.type === 'css')) continue; // allow inline CSS in HTML
    const regex = new RegExp(f.pattern);
    let m;
    while ((m = regex.exec(content)) !== null) {
      const idx = m.index;
      const before = content.slice(0, idx);
      const line = before.split(/\r?\n/).length;
      const severity = severityForFeature(f, policy);
      matches.push({
        featureId: f.id,
        title: f.title,
        mdn: f.mdn,
        fallback: f.fallback,
        baseline: f.baseline,
        severity,
        line,
        column: idx - before.lastIndexOf('\n'),
      });
    }
  }
  return { filePath, language: lang, findings: matches };
}

function analyzeFilesSync(filePaths, options = {}) {
  return filePaths.map((p) => {
    try {
      const content = fs.readFileSync(p, 'utf8');
      return analyzeContent(p, content, options);
    } catch (e) {
      return { filePath: p, language: detectLanguage(p), findings: [], error: e.message };
    }
  });
}

function toMarkdown(results) {
  const lines = [];
  let total = 0;
  lines.push('# Baseline Impact Report');
  for (const r of results) {
    if (!r.findings.length) continue;
    lines.push(`\n## ${r.filePath}`);
    lines.push('Feature | Line | Guidance');
    lines.push('--- | ---: | ---');
    for (const f of r.findings) {
      total++;
      lines.push(`${f.title} | ${f.line} | [MDN](${f.mdn}) — ${f.fallback}`);
    }
  }
  if (total === 0) lines.push('\nNo potential Baseline risks found.');
  return lines.join('\n');
}

function toSarif(results) {
  const runs = [{
    tool: { driver: { name: 'baseline-impact-copilot', version: '0.1.0' } },
    results: []
  }];
  for (const r of results) {
    for (const f of r.findings) {
      runs[0].results.push({
        ruleId: f.featureId,
        level: f.severity === 'error' ? 'error' : 'warning',
        message: { text: `${f.title}: see ${f.mdn}. ${f.fallback}` },
        locations: [{
          physicalLocation: {
            artifactLocation: { uri: r.filePath.replace(/\\/g, '/') },
            region: { startLine: f.line }
          }
        }]
      });
    }
  }
  return { $schema: 'https://json.schemastore.org/sarif-2.1.0.json', version: '2.1.0', runs };
}

function normalizePolicy(policy) {
  const p = policy || {};
  return {
    minBaselineYear: typeof p.minBaselineYear === 'number' ? p.minBaselineYear : null,
    ignore: Array.isArray(p.ignore) ? p.ignore : [],
  };
}

function severityForFeature(feature, policy) {
  if (!policy || !policy.minBaselineYear || !feature.baseline) return 'warning';
  const year = parseInt(String(feature.baseline).slice(0, 4), 10);
  if (!isNaN(year) && year > policy.minBaselineYear) return 'error';
  return 'warning';
}

module.exports = { analyzeContent, analyzeFilesSync, toMarkdown, toSarif, normalizePolicy };
