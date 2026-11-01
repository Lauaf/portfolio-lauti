// El pueblo (pueblo/) tiene que mostrar el catálogo completo y no apuntar a nada que no exista.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { PROYECTOS, PROYECTO_ENLACES } = require('../proyectos.js');

const raiz = path.join(__dirname, '..');
const cargar = () => import(path.join(raiz, 'pueblo', 'lugares.js'));

test('every catalog project lives in exactly one building', async () => {
  const { LUGARES, EXTRAS } = await cargar();
  const ubicados = LUGARES.flatMap(l => l.proyectos);
  for (const [nombre] of PROYECTOS) {
    assert.equal(ubicados.filter(n => n === nombre).length, 1, nombre);
  }
  for (const n of ubicados) assert.ok(PROYECTOS.some(p => p[0] === n) || EXTRAS[n], `${n} no está en el catálogo ni en EXTRAS`);
});

test('visual examples point to real files and real projects', async () => {
  const { VISUALES, EXTRAS } = await cargar();
  const todos = [...Object.entries(VISUALES), ...Object.entries(EXTRAS).map(([n, e]) => [n, e.visuales])];
  for (const [nombre, visuales] of todos) {
    assert.ok(PROYECTOS.some(p => p[0] === nombre) || EXTRAS[nombre], nombre);
    assert.ok(visuales.length > 0, `${nombre} sin ejemplos visuales`);
    for (const v of visuales) {
      assert.ok(v.cap, `${nombre}: falta el epígrafe`);
      const archivo = v.img || v.video;
      if (archivo) assert.ok(fs.statSync(path.join(raiz, 'sando', archivo)).size > 0, archivo); // las rutas se resuelven desde sando/ (<base>)
    }
  }
  // todo proyecto del catálogo tiene algo visual
  for (const [nombre] of PROYECTOS) assert.ok(VISUALES[nombre]?.length, `${nombre} sin visual`);
});

test('Arky links and demo deep links are offered where they exist', async () => {
  const { LUGARES } = await cargar();
  const arky = LUGARES.find(l => l.id === 'arky');
  for (const n of arky.proyectos) assert.ok(PROYECTO_ENLACES[n].some(e => e.live), n);
  const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
  assert.match(html, /#demo=/);
});

test('pathfinding reaches a door around obstacles and gives up when it cannot', async () => {
  const { camino } = await cargar();
  const w = 6, h = 4, bloqueado = Array.from({ length: h }, () => Array(w).fill(false));
  for (let y = 0; y < 3; y++) bloqueado[y][3] = true; // pared con un hueco abajo
  const m = { w, h, bloqueado, libre: (x, y) => x >= 0 && y >= 0 && x < w && y < h && !bloqueado[y][x] };
  const ruta = camino(m, { x: 0, y: 0 }, { x: 5, y: 0 });
  assert.equal(ruta.length, 11);
  assert.ok(ruta.every(p => !bloqueado[p.y][p.x]));
  bloqueado[3][3] = true;
  assert.equal(camino(m, { x: 0, y: 0 }, { x: 5, y: 0 }), null);
});
