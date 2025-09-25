// Exports docs/presentation/index.html (Reveal.js + deck.md) to docs/presentation/deck.pdf
// Usage: node scripts/export_deck.js

const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

(async () => {
  const root = path.resolve(__dirname, '..');
  const htmlPath = path.join(root, 'docs', 'presentation', 'index.html');
  const outPath = path.join(root, 'docs', 'presentation', 'deck.pdf');

  if (!fs.existsSync(htmlPath)) {
    console.error('Presentation HTML not found at', htmlPath);
    process.exit(1);
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  const fileUrl = 'file://' + htmlPath.replace(/\\/g, '/');
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
