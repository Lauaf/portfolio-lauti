const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

test('the page references existing local styles and images', () => {
  const markup = html.slice(0, html.indexOf('<script>'));
  const localFiles = [...markup.matchAll(/(?:src|href)="([^"#]+)"/g)]
    .map(match => match[1])
    .filter(value => !/^[a-z]+:/i.test(value));
  assert.ok(localFiles.includes('styles.css'));
  assert.ok(localFiles.includes('assets/quiet-study.webp'));
  for (const file of localFiles) {
    assert.ok(fs.statSync(path.join(__dirname, '..', file)).size > 0, file);
  }
});

// Minimal DOM stand-in: these tests exercise startup and demo logic.
// Layout, focus and real clipboard access are checked separately in a browser.
function createApp() {
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
  };
  const context = vm.createContext({ document, navigator: {}, console });
  vm.runInContext(script, context, { timeout: 3000 });
  return { context, element: id => document.getElementById(id) };
}

test('startup renders 20 projects and both interactive boards', () => {
  const { element } = createApp();
  assert.match(element('count').textContent, /^20 de 20/);
  assert.equal((element('projects').innerHTML.match(/<article /g) || []).length, 20);
  assert.equal(element('grid').children.length, 64);
  assert.equal((element('ticboard').innerHTML.match(/<button /g) || []).length, 9);
});

test('filtering and searching preserve the original project index', () => {
  const { element } = createApp();
  element('filters').onclick({ target: { dataset: { filter: 'Personal' } } });
  assert.match(element('count').textContent, /^3 de 20/);
  element('search').oninput({ target: { value: 'ARKY AI' } });
  assert.match(element('count').textContent, /^1 de 20/);
  assert.match(element('projects').innerHTML, /showProject\(12\)/);
  element('search').oninput({ target: { value: 'ningun-proyecto' } });
  assert.match(element('count').textContent, /^0 de 20/);
});

test('project cards and dialogs link to separate repositories', () => {
  const { context, element } = createApp();
  const cards = element('projects').innerHTML;
  assert.match(cards, /href="https:\/\/github\.com\/Lauaf\/TP1_CV"/);
  assert.match(cards, /href="https:\/\/github\.com\/Lauaf\/TP1_Prog3"/);
  assert.match(cards, /GitHub · repositorio privado ↗/);
  context.showProject(14);
  assert.equal(element('modal').open, true);
  assert.match(element('modalactions').innerHTML, /Arky-Finances/);
  assert.match(element('modalactions').innerHTML, /Versión integrada · privado/);
  assert.match(element('modalactions').innerHTML, /target="_blank" rel="noopener noreferrer"/);
  context.showProject(0);
  assert.equal(element('modalactions').innerHTML, '');
});

test('all search modes solve the initial maze and report blocked routes', () => {
  const { context, element } = createApp();
  for (const mode of ['bfs', 'dfs', 'ucs', 'astar']) {
    element('algorithm').value = mode;
    context.runPath();
    assert.equal(element('pathmetric').textContent, '14 pasos');
  }
  context.resetPath();
  element('grid').children[1].onclick();
  element('grid').children[8].onclick();
  assert.equal(element('pathmetric').textContent, '—');
  context.runPath();
  assert.equal(element('pathmetric').textContent, 'Sin ruta');
});

test('WHONET rejects blank numeric values and exports valid values', () => {
  const { context, element } = createApp();
  for (const [id, value] of Object.entries({
    sample: 'DEMO-01', organism: 'Ejemplo', antibiotic: 'Demo',
    resulttype: 'mic', resultvalue: '',
  })) element(id).value = value;
  context.generateWhonet();
  assert.match(element('whonetout').textContent, /^Validación fallida/);
  element('resultvalue').value = '0.25';
  context.generateWhonet();
  assert.match(element('whonetout').textContent, /\tMIC\t0\.25$/);
  element('resulttype').value = 'sir';
  element('resultvalue').value = 's';
  context.generateWhonet();
  assert.match(element('whonetout').textContent, /\tSIR\tS$/);
});

test('Minimax completes a drawn game and resets', () => {
  const { context, element } = createApp();
  for (const index of [0, 8, 7, 2, 3]) context.ticMove(index);
  assert.equal(element('ticstatus').textContent, 'Empate');
  assert.equal((element('ticboard').innerHTML.match(/disabled/g) || []).length, 9);
  context.resetTic();
  assert.equal(element('ticstatus').textContent, 'Tu turno: X');
  assert.doesNotMatch(element('ticboard').innerHTML, /disabled/);
});
