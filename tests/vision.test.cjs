// El laboratorio de visión debe dar lo mismo que los trabajos prácticos originales en Python.
// Las referencias de tests/fixtures se generaron corriendo ese código (OpenCV) sobre las mismas imágenes.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const V = require('../vision.js');
const leerPNG = require('./png.cjs');

const raiz = path.join(__dirname, '..');
const ref = require('./fixtures/pdi-python.json');
const gris = archivo => { const p = leerPNG(path.join(raiz, archivo)); return V.gris(p.rgba, p.w, p.h); };

test('local equalization matches the Python output pixel by pixel', () => {
  const out = V.ecualizarLocal(gris('assets/pdi/detalles.png'), 21, 21);
  const esperado = gris('tests/fixtures/eq_21x21.png');
  assert.deepEqual(Array.from(out.d), Array.from(esperado.d));
});

test('form validation gives the same type and field results as Python', () => {
  for (const [id, r] of Object.entries(ref.formularios)) {
    const o = V.analizarFormulario(gris(`assets/pdi/formulario_${id}.png`));
    assert.equal(o.tipo, r.tipo, `tipo del formulario ${id}`);
    assert.deepEqual(o.resultados, r.res, `campos del formulario ${id}`);
  }
});

test('plate segmentation keeps the same character boxes as Python', () => {
  V.PARAMS_PATENTES.forEach((p, i) => {
    const id = String(i + 1).padStart(2, '0');
    const o = V.segmentarPatente(gris(`assets/pdi/img${id}.png`), p);
    const cajas = o.caracteres.map(s => [s.x, s.y, s.w, s.h]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    assert.deepEqual(cajas, ref.patentes[id], `patente img${id}`);
  });
});

test('morphology and contours behave like OpenCV on small shapes', () => {
  assert.deepEqual(Array.from(V.elipse(3).m), [0, 1, 0, 1, 1, 1, 0, 1, 0]);
  const w = 12, h = 12, fg = new Uint8Array(w * h);
  for (let y = 2; y < 8; y++) for (let x = 2; x < 8; x++) fg[y * w + x] = 255;   // cuadrado 6x6
  fg[10 * w + 10] = 255;                                                              // píxel suelto
  const c = V.contornosExternos(fg, w, h).sort((a, b) => b.area - a.area);
  assert.equal(c.length, 2);
  assert.equal(c[0].area, 25);        // contourArea del borde de un cuadrado de 6 px
  assert.equal(c[0].perimetro, 20);
  assert.equal(c[1].perimetro, 0);
  const abierto = V.apertura({ w, h, d: fg }, V.rect(3, 3));
  assert.equal(abierto.d[10 * w + 10], 0);
  assert.equal(abierto.d[4 * w + 4], 255);
});

test('every lab asset and the Sandō game are present for the static site', () => {
  for (const f of ['detalles.png', 'monedas_resultado.jpg', 'monedas_original.jpg', ...[1, 2, 3, 4].map(n => `tirada_${n}.mp4`)]) {
    assert.ok(fs.statSync(path.join(raiz, 'assets/pdi', f)).size > 0, f);
  }
  const sando = fs.readFileSync(path.join(raiz, 'sando/index.html'), 'utf8');
  assert.match(sando, /js\/main\.js/);
});
