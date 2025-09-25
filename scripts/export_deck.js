// Exports docs/presentation/index.html (Reveal.js + deck.md) to docs/presentation/deck.pdf
// Usage: node scripts/export_deck.js

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const root = path.resolve(__dirname, '..');
  const docsDir = path.join(root, 'docs', 'presentation');
  const htmlPath = path.join(docsDir, 'index.html');
  const mdPath = path.join(docsDir, 'deck.md');
  const outPath = path.join(docsDir, 'deck.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('Presentation HTML not found at', htmlPath);
    process.exit(1);
  }
  if (!fs.existsSync(mdPath)) {
    console.error('Markdown deck not found at', mdPath);
    process.exit(1);
  }

  // Build a temporary HTML that embeds the markdown to avoid file:// CORS
  const md = fs.readFileSync(mdPath, 'utf8');
  const embedHtml = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Baseline Impact Copilot — Deck (Embedded)</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/black.css" id="theme" />
    <style>.reveal section img { max-height: 70vh; }</style>
  </head>
  <body>
    <div class="reveal"><div class="slides">
      <section data-markdown data-separator="^---$" data-separator-vertical="^--$">
        <textarea data-template>${md.replace(/</g, '&lt;')}</textarea>
      </section>
    </div></div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/plugin/markdown/markdown.js"></script>
    <script>const deck = new Reveal({ hash: true, slideNumber: true }); deck.initialize({ plugins: [ RevealMarkdown ] });</script>
  </body>
  </html>`;
  const tmpPath = path.join(docsDir, '.deck_print.html');
  fs.writeFileSync(tmpPath, embedHtml, 'utf8');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const fileUrl = 'file://' + tmpPath.replace(/\\/g, '/');
  await page.goto(fileUrl + '?print-pdf', { waitUntil: 'networkidle0' });

  // Give Reveal a moment to finish layout
  await page.waitForTimeout(500);

  await page.pdf({
    path: outPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
  });

  await browser.close();
  console.log('Exported PDF to', outPath);
})();
