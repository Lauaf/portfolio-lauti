// Genera assets/cv/Lautaro_Florenza_CV.pdf a partir de cv/cv.html.
// Requiere Playwright con Chromium (no es dependencia del sitio): node cv/render.cjs
const path = require('node:path');
const fs = require('node:fs');
const { chromium } = require('playwright');

(async () => {
  const raiz = path.join(__dirname, '..');
  const salida = path.join(raiz, 'assets', 'cv', 'Lautaro_Florenza_CV.pdf');
  fs.mkdirSync(path.dirname(salida), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'cv.html'));
  await page.pdf({ path: salida, format: 'A4', preferCSSPageSize: true, printBackground: true });
  await browser.close();
  console.log('CV generado en', path.relative(raiz, salida));
})();
