const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(__dirname, '..', 'catalogo.js'), 'utf8');
const htmlEn = fs.readFileSync(path.join(__dirname, '..', 'en', 'index.html'), 'utf8');
const catalogo = fs.readFileSync(path.join(__dirname, '..', 'proyectos.js'), 'utf8');

test('the page references existing local styles and images', () => {
  const markup = html.slice(0, html.indexOf('<script>'));
  const localFiles = [...markup.matchAll(/(?:src|href)="([^"#]+)"/g)]
    .map(match => match[1])
    .filter(value => !/^[a-z]+:/i.test(value));
  assert.ok(localFiles.includes('styles.css'));
  assert.ok(localFiles.includes('assets/arky/arky-logo.webp'));
  assert.ok(localFiles.includes('assets/cv/Lautaro_Florenza_CV.pdf'));
  for (const file of localFiles) {
    assert.ok(fs.statSync(path.join(__dirname, '..', file)).size > 0, file);
  }
});

// Minimal DOM stand-in: these tests exercise startup and demo logic.
// Layout, focus and real clipboard access are checked separately in a browser.
function createApp(lang = 'es') {
  class Element {
    constructor() {
      this.children = [];
      this.textContent = '';
      this.value = '';
      this.classList = { toggle() {} };
    }
    set innerHTML(value) { this.html = String(value); this.children = []; }
    get innerHTML() { return this.html || ''; }
    append(child) { this.children.push(child); }
    showModal() { this.open = true; }
  }
  const elements = new Map();
  const document = {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, new Element());
      return elements.get(id);
    },
    createElement() { return new Element(); },
    querySelectorAll() { return []; },
    documentElement: { lang },
  };
  const context = vm.createContext({ document, navigator: {}, console });
  vm.runInContext(catalogo, context, { timeout: 3000 });
  vm.runInContext(script, context, { timeout: 3000 });
  return { context, element: id => document.getElementById(id) };
}

test('startup renders the six curated projects', () => {
  const { element } = createApp();
  assert.match(element('count').textContent, /^6 de 6/);
  assert.equal((element('projects').innerHTML.match(/<article /g) || []).length, 6);
});

test('filtering and searching preserve the original project index', () => {
  const { element } = createApp();
  element('filters').onclick({ target: { dataset: { filter: 'Personal' } } });
  assert.match(element('count').textContent, /^2 de 6/);
  element('search').oninput({ target: { value: 'ARKY' } });
  assert.match(element('count').textContent, /^1 de 6/);
  assert.match(element('projects').innerHTML, /showProject\(0\)/);
  element('search').oninput({ target: { value: '' } });
  element('filters').onclick({ target: { dataset: { filter: 'Universidad' } } });
  assert.match(element('count').textContent, /^3 de 6/);
  element('search').oninput({ target: { value: 'yolov8' } });
  assert.match(element('count').textContent, /^1 de 6/);
  assert.match(element('projects').innerHTML, /showProject\(3\)/);
  element('search').oninput({ target: { value: 'ningun-proyecto' } });
  assert.match(element('count').textContent, /^0 de 6/);
});

test('project cards and dialogs link to separate repositories', () => {
  const { context, element } = createApp();
  const cards = element('projects').innerHTML;
  assert.match(cards, /href="https:\/\/github\.com\/Lauaf\/TP1_CV"/);
  assert.match(cards, /GitHub · Arky · privado ↗/);
  assert.match(cards, /href="https:\/\/arky-web-production\.up\.railway\.app"/);
  assert.match(cards, /href="https:\/\/arky-landing-production\.up\.railway\.app\/"/);
  // Lo que está en producción es el botón principal de su tarjeta, y no se repite abajo.
  assert.match(cards, /class="btn primary small" href="sando\/"[^>]*>Jugalo en el navegador/);
  assert.equal((cards.match(/class="btn primary small" href="https:\/\/arky-web-production\.up\.railway\.app"/g) || []).length, 1);
  assert.doesNotMatch(cards, /class="repo-link live" href="sando\/"/);
  assert.match(cards, /En producción/);
  for (const repo of ['Sando', 'TP2_VC', 'TP_1_PDI', 'TP_2_PDI', 'TP_3_PDI', 'Arky-Finances']) {
    assert.match(cards, new RegExp(`href="https://github\\.com/Lauaf/${repo}"`));
  }
  context.showProject(0);
  assert.equal(element('modal').open, true);
  assert.match(element('modalactions').innerHTML, /^<a class="btn primary" href="https:\/\/arky-web-production[^>]*>Probalo en producción/);
  assert.match(element('modalactions').innerHTML, /Arky-Finances/);
  assert.match(element('modalactions').innerHTML, /Arky · privado/);
  assert.match(element('modalactions').innerHTML, /target="_blank" rel="noopener noreferrer"/);
  context.showProject(1);
  assert.equal(element('modalactions').innerHTML, '');
});

test('the catalog has no filler entries', () => {
  const { element } = createApp();
  const cards = element('projects').innerHTML;
  for (const relleno of ['Plantillas de informes', 'Exportación de antibiogramas', 'Valdor', 'Algoritmos de búsqueda', 'Pixel Assets', 'Ver caso de estudio']) {
    assert.doesNotMatch(cards, new RegExp(relleno), relleno);
  }
});

test('the English page is the same page, translated', () => {
  const ids = h => [...h.matchAll(/<section id="([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(ids(htmlEn), ids(html));
  assert.match(htmlEn, /<html lang="en">/);
  for (const ref of ['../styles.css', '../proyectos.js', '../catalogo.js', '../vision.js', '../assets/cv/Lautaro_Florenza_CV.pdf']) assert.ok(htmlEn.includes(ref), ref);
  const { PROYECTOS, CATALOGO_EN } = require('../proyectos.js');
  assert.equal(CATALOGO_EN.proyectos.length, PROYECTOS.length);
  CATALOGO_EN.proyectos.forEach((p, i) => {
    assert.equal(p.length, PROYECTOS[i].length, p[0]);
    assert.equal(p[9], PROYECTOS[i][9], p[0]);
    assert.ok(CATALOGO_EN.imagenes[p[0]], `${p[0]} sin imagen`);
    assert.ok(fs.statSync(path.join(__dirname, '..', CATALOGO_EN.imagenes[p[0]].src)).size > 0, p[0]);
  });
});

test('the English catalog renders in English with paths from en/', () => {
  const { context, element } = createApp('en');
  assert.match(element('count').textContent, /^6 of 6 projects shown/);
  const cards = element('projects').innerHTML;
  assert.match(cards, /Try it in production ↗/);
  assert.match(cards, /View details/);
  assert.match(cards, /src="\.\.\/assets\/arky\/arky-chat-en\.webp"/);
  assert.match(cards, /href="\.\.\/sando\/"/);
  assert.doesNotMatch(cards, /Ver detalles|En producción/);
  element('filters').onclick({ target: { dataset: { filter: 'University' } } });
  assert.match(element('count').textContent, /^3 of 6/);
  context.showProject(1);
  assert.match(element('modalcontent').innerHTML, /What I did/);
});
