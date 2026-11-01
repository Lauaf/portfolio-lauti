// Arte del pueblo al estilo de los Zelda de GBA (Minish Cap): personajes cabezones dibujados
// píxel por píxel, sombreado de 3-4 tonos con contornos oscuros, pasto con matas, árboles
// grandes de copas redondas, techos de tejas y agua con brillos. Todo se genera por código.

export const T = 16;

// ---------- utilidades de color ----------
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const aHex = rgb => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
/** f < 0 oscurece (hacia un violeta oscuro, como en GBA), f > 0 aclara (hacia un amarillo cálido). */
export function tono(c, f) {
  const [r, g, b] = hex(c);
  if (f < 0) { const k = -f; return aHex([r + (40 - r) * k, g + (24 - g) * k, b + (56 - b) * k]); }
  return aHex([r + (255 - r) * f, g + (250 - g) * f, b + (225 - b) * f]);
}
const OUT = '#20142a'; // contorno general

export const hash = (x, y, s = 0) => {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) >>> 0;
  h = ((h ^ (h >>> 13)) * 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
function rng(semilla) {
  let s = semilla >>> 0 || 1;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
export const lienzo = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

/** Pinta una matriz de caracteres con una paleta ('.' o ' ' = transparente). */
function pixeles(g, filas, pal, ox = 0, oy = 0, espejo = false) {
  const ancho = Math.max(...filas.map(f => f.length));
  filas.forEach((f, y) => {
    for (let x = 0; x < f.length; x++) {
      const col = pal[f[x]];
      if (!col) continue;
      g.fillStyle = col;
      g.fillRect(ox + (espejo ? ancho - 1 - x : x), oy + y, 1, 1);
    }
  });
}

// =====================================================================
// Personajes (16x24): cabeza grande + cuerpo, 3 direcciones (izquierda = espejo de derecha)
// o contorno · S/s piel · e ojo · k cachete · H/h/I pelo · C/c/D ropa · W cuello · Y cinto · P/p pantalón · B/b botas
// =====================================================================
const CABEZA = {
  frente: [
    '................',
    '.....oooooo.....',
    '...ooHHHIIHoo...',
    '..oHHHHHIIHHHo..',
    '.oHHHHHHHHHHHHo.',
    '.oHHHHHHHHHHHho.',
    '.ohHHhHHHHhHHho.',
    '.ohSSHSSSSHSSho.',
    '.ohSSeSSSSeSSho.',
    '.ohSSeSSSSeSSho.',
    '..oskSSSSSSkso..',
    '...osSSSSSSso...',
    '....oossssoo....',
  ],
  espalda: [
    '................',
    '.....oooooo.....',
    '...ooHHHIIHoo...',
    '..oHHHIIHHHHHo..',
    '.oHHHIIHHHHHHHo.',
    '.oHHHHHHHHHHHho.',
    '.oHHHHHHHHHHHho.',
    '.oHHHHHHHHHHhho.',
    '.ohHHHHHHHHHhho.',
    '.ohhHHHHHHHhhho.',
    '..ohhhHHHHhhho..',
    '...oShhhhhhSo...',
    '....oossssoo....',
  ],
  lado: [
    '................',
    '....ooooo.......',
    '..ooHHHIIoo.....',
    '.oHHHHHHIIHo....',
    '.oHHHHHHHHHHo...',
    'oHHHHHHHHHHHHo..',
    'ohHHHHHHhSSHHo..',
    'ohHHHHHhSSSSSo..',
    'ohHHHHsSSSSeSo..',
    'ohhHHhSSSSSeSSo.',
    '.ohhhSSSkSSSso..',
    '..ohsSSSSSSso...',
    '...oossssoo.....',
  ],
};
const CUERPO_FRENTE = [
  '....oCCWWCCo....',
  '...oDCCCCCCco...',
  '..oCoDCCCCCcoCo.',
  '..oCoDCCCCCcoCo.',
  '..oSoCCCCCCcoSo.',
  '...ooYYYYYYoo...',
  '....oPPPPPPo....',
];
const PIERNAS_FRENTE = [
  ['....oPpooPpo....', '....oPpooPpo....', '...oBBboobBBo...', '...oooo..oooo...'],
  ['....oPpooPpo....', '...oBBbooPpo....', '...oooo.oBBbo...', '........oooo....'],
];
const CUERPO_LADO = [
  '....oCCWWo......',
  '....oDCCCCo.....',
  '....oDCcDCo.....',
  '....oDCcDCo.....',
  '....oCCcSCo.....',
  '....oYYYYYo.....',
  '....oPPPPpo.....',
];
const PIERNAS_LADO = [
  ['....oPPoPpo.....', '....oPPoPpo.....', '....oBBoBBBo....', '....oooooooo....'],
  ['....oPPoPpo.....', '...oPPo.oPpo....', '..oBBo...oBBBo..', '..ooo....oooo...'],
  ['....oPPoPpo.....', '....oPo.oPo.....', '...oBBo.oBBo....', '...ooo..oooo....'],
];
// extras por peinado (se dibujan encima)
const EXTRA = {
  largo: {
    frente: { y: 7, f: ['oh............ho', 'oh............ho', 'ohh..........hho', 'ohh..........hho', '.oh..........ho.', '.oh..........ho.', '..o..........o..'] },
    espalda: { y: 10, f: ['.ohhhHHHHHHhhho.', '.ohHHHHHHHHHHho.', '.ohhHHHHHHHHhho.', '..ohhHHHHHHhho..', '...ohhhhhhhho...', '....oooooooo....'] },
    lado: { y: 7, f: ['oh', 'oh', 'ohh', 'ohh', 'ohh', '.oh', '..o'] },
  },
  rodete: {
    frente: { y: -2, f: ['......oooo......', '.....oHIIHo.....', '.....ohHHho.....'] },
    espalda: { y: -2, f: ['......oooo......', '.....oHIIHo.....', '.....ohHHho.....'] },
    lado: { y: -2, f: ['...oooo.........', '..oHIIHo........', '..ohHHho........'] },
  },
  gorra: {
    frente: { y: 0, f: ['.....oooooo.....', '...ooGGGQQGoo...', '..oGGGGGQGGGGo..', '.oGGGGGGGGGGGGo.', '.ogggggggggggo..', '.oooooooooooooo.'] },
    espalda: { y: 0, f: ['.....oooooo.....', '...ooGGGQQGoo...', '..oGGGGGQGGGGo..', '.oGGGGGGGGGGGGo.', '.ogggggggggggggo', '.oooooooooooooo.'] },
    lado: { y: 0, f: ['....ooooo.......', '..ooGGGQQoo.....', '.oGGGGGGQGGo....', 'oGGGGGGGGGGGooo.', 'ogggggggggggggo.', 'oooooooooooooo..'] },
  },
  barba: {
    frente: { y: 9, f: ['...hH......Hh...', '...ohHHHHHHho...', '....ohHHHHho....', '.....oohhoo.....'] },
    lado: { y: 9, f: ['......hHHHH.....', '......ohHHHho...', '.......ohhho....', '........ooo.....'] },
  },
  delantal: {
    frente: { y: 15, f: ['.....AAAAAA.....', '.....AAAAAA.....', '.....AaaaaA.....', '......AAAA......'] },
    lado: { y: 15, f: ['.........AA.....', '.........AA.....', '.........Aa.....'] },
  },
};

const cacheSprites = new Map();
/**
 * pal: {piel, pelo, ropa, ropa2, pantalon, estilo: corto|largo|gorra|rodete|barba, gorra, delantal}
 * dir: 0 abajo, 1 arriba, 2 izquierda, 3 derecha. cuadro: 0 quieto, 1 paso A, 2 paso B
 */
export function spritePersona(pal, dir, cuadro = 0) {
  const clave = JSON.stringify([pal, dir, cuadro]);
  if (cacheSprites.has(clave)) return cacheSprites.get(clave);
  const c = lienzo(16, 26);
  const g = c.getContext('2d');
  const piel = pal.piel, pelo = pal.pelo, ropa = pal.ropa, pant = pal.pantalon;
  const gorra = pal.gorra || (pal.estilo === 'gorra' ? '#c33' : null);
  const P = {
    o: OUT, S: piel, s: tono(piel, -0.22), e: '#1d1424', k: '#f08a8a',
    H: pelo, h: tono(pelo, -0.3), I: tono(pelo, 0.35),
    C: ropa, c: tono(ropa, -0.28), D: tono(ropa, 0.3),
    W: pal.ropa2 || tono(ropa, 0.55), Y: pal.ropa2 ? tono(pal.ropa2, -0.15) : '#7a4a2a',
    P: pant, p: tono(pant, -0.3), B: '#6a4028', b: '#45281a',
    G: gorra, g: gorra && tono(gorra, -0.3), Q: gorra && tono(gorra, 0.35),
    A: pal.delantal, a: pal.delantal && tono(pal.delantal, -0.2),
  };
  const lado = dir >= 2, espejo = dir === 2;
  const vista = dir === 0 ? 'frente' : dir === 1 ? 'espalda' : 'lado';
  const y0 = 2;
  // pelo largo por detrás (de espaldas va encima)
  const ex = k => EXTRA[k]?.[vista];
  if (pal.estilo === 'largo' && vista !== 'espalda') pixeles(g, ex('largo').f, P, 0, y0 + ex('largo').y, espejo);
  // piernas y cuerpo
  const piernas = lado ? PIERNAS_LADO[cuadro] : (cuadro === 0 ? PIERNAS_FRENTE[0] : PIERNAS_FRENTE[1]);
  const espejoPiernas = lado ? espejo : cuadro === 2;
  pixeles(g, piernas, P, 0, y0 + 20, espejoPiernas);
  let cuerpo = lado ? CUERPO_LADO : CUERPO_FRENTE;
  if (vista === 'espalda') cuerpo = cuerpo.map(f => f.replace(/W/g, 'C'));
  pixeles(g, cuerpo, P, 0, y0 + 13, espejo);
  if (pal.delantal && vista !== 'espalda') pixeles(g, ex('delantal').f, P, 0, y0 + ex('delantal').y, espejo);
  // cabeza
  pixeles(g, CABEZA[vista], P, 0, y0, espejo);
  if (pal.estilo === 'largo' && vista === 'espalda') pixeles(g, ex('largo').f, P, 0, y0 + ex('largo').y, espejo);
  for (const k of ['barba', 'rodete']) if (pal.estilo === k && ex(k)) pixeles(g, ex(k).f, P, 0, y0 + ex(k).y, espejo);
  if (gorra) pixeles(g, ex('gorra').f, P, 0, y0 + ex('gorra').y, espejo);
  // sombra en el piso, abajo de todo
  const s = lienzo(16, 26);
  const gs = s.getContext('2d');
  gs.fillStyle = 'rgba(24,40,20,.32)';
  gs.fillRect(3, 24, 10, 2); gs.fillRect(2, 25 - 0, 12, 1);
  gs.drawImage(c, 0, 0);
  cacheSprites.set(clave, s);
  return s;
}

// =====================================================================
// Suelo: pasto, caminos (autotile), plaza empedrada, agua y puente
// =====================================================================
const PASTO = { luz: '#b4e46c', claro: '#8fd058', base: '#72bc48', medio: '#5ea63c', osc: '#47882f', muyOsc: '#356b26' };
const TIERRA = { luz: '#f6e2ae', base: '#e6c88a', medio: '#d4ad6c', osc: '#b48a50', borde: '#8e6a3c' };
const AGUA = { prof: '#2f62c0', base: '#3c7ee0', claro: '#68a8f4', brillo: '#d8f0ff', espuma: '#eaf6ff' };

const variantes = {};
function tilePasto(n) {
  const c = lienzo(T, T);
  const g = c.getContext('2d');
  const r = rng(n * 977 + 13);
  g.fillStyle = PASTO.base; g.fillRect(0, 0, T, T);
  // manchas suaves
  for (let k = 0; k < 6; k++) {
    g.fillStyle = r() < 0.5 ? PASTO.claro : PASTO.medio;
    g.fillRect(Math.floor(r() * 14), Math.floor(r() * 14), 2 + Math.floor(r() * 3), 1 + Math.floor(r() * 2));
  }
  // matas en forma de "v" (las del Minish Cap)
  const matas = n === 0 ? 1 : 2 + Math.floor(r() * 2);
  for (let k = 0; k < matas; k++) {
    const x = 1 + Math.floor(r() * 11), y = 3 + Math.floor(r() * 11);
    g.fillStyle = PASTO.osc;
    g.fillRect(x, y, 1, 2); g.fillRect(x + 2, y, 1, 2); g.fillRect(x + 4, y + 1, 1, 1); g.fillRect(x + 1, y + 1, 1, 2); g.fillRect(x + 3, y + 1, 1, 2);
    g.fillStyle = PASTO.muyOsc; g.fillRect(x + 1, y + 2, 3, 1);
    g.fillStyle = PASTO.luz; g.fillRect(x, y - 1, 1, 1); g.fillRect(x + 2, y - 1, 1, 1);
  }
  return c;
}
const pastoTile = n => (variantes['p' + n] ??= tilePasto(n));

function tileTierra(n) {
  const c = lienzo(T, T);
  const g = c.getContext('2d');
  const r = rng(n * 131 + 7);
  g.fillStyle = TIERRA.base; g.fillRect(0, 0, T, T);
  for (let k = 0; k < 7; k++) { g.fillStyle = r() < 0.5 ? TIERRA.luz : TIERRA.medio; g.fillRect(Math.floor(r() * 15), Math.floor(r() * 15), 1 + Math.floor(r() * 2), 1); }
  for (let k = 0; k < 2; k++) { // piedritas
    const x = 1 + Math.floor(r() * 12), y = 1 + Math.floor(r() * 12);
    g.fillStyle = TIERRA.osc; g.fillRect(x, y + 1, 3, 1); g.fillRect(x + 2, y, 1, 1);
    g.fillStyle = TIERRA.luz; g.fillRect(x, y, 2, 1);
  }
  return c;
}
const tierraTile = n => (variantes['t' + n] ??= tileTierra(n));

function tilePlaza(n) {
  const c = lienzo(T, T);
  const g = c.getContext('2d');
  const r = rng(n * 53 + 3);
  g.fillStyle = '#8c7c6a'; g.fillRect(0, 0, T, T);
  const piedras = [[0, 0, 8, 5], [8, 0, 8, 5], [-4, 5, 8, 6], [4, 5, 8, 6], [12, 5, 8, 6], [0, 11, 7, 5], [7, 11, 9, 5]];
  for (const [x, y, w, h] of piedras) {
    const base = ['#d8ccb4', '#cfc0a4', '#e2d6bf'][Math.floor(r() * 3)];
    g.fillStyle = base; g.fillRect(x + 1, y + 1, w - 1, h - 1);
    g.fillStyle = tono(base, 0.4); g.fillRect(x + 1, y + 1, w - 2, 1);
    g.fillStyle = tono(base, -0.15); g.fillRect(x + 1, y + h - 1, w - 1, 1);
  }
  return c;
}
const plazaTile = n => (variantes['z' + n] ??= tilePlaza(n));

// elipse "a mano", fila por fila: bordes pixelados sin antialias
function elipsePx(g, cx, cy, rx, ry, col, soloRuta = false) {
  if (!soloRuta) g.fillStyle = col;
  for (let dy = -ry; dy <= ry; dy++) {
    const mitad = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy / ry) ** 2)));
    if (soloRuta) g.rect(cx - mitad, cy + dy, mitad * 2 + 1, 1);
    else g.fillRect(cx - mitad, cy + dy, mitad * 2 + 1, 1);
  }
}

/** Plaza redonda empedrada con cordón de piedra y un anillo alrededor de la fuente. */
function plazaCircular(g, { x, y, rx, ry }) {
  const empedrar = (rrx, rry) => {
    g.save();
    g.beginPath(); elipsePx(g, x, y, rrx, rry, null, true); g.clip();
    for (let ty = y - rry - T; ty < y + rry + T; ty += T) for (let tx = x - rrx - T; tx < x + rrx + T; tx += T) {
      g.drawImage(plazaTile(Math.floor(hash(tx, ty) * 4)), tx, ty);
    }
    g.restore();
  };
  g.fillStyle = 'rgba(24,48,20,.25)'; elipsePx(g, x, y + 2, rx + 3, ry + 3, 'rgba(24,48,20,.25)');
  elipsePx(g, x, y, rx + 2, ry + 2, '#6e6458');
  elipsePx(g, x, y, rx + 1, ry + 1, '#c8bca4');
  empedrar(rx - 1, ry - 1);
  // anillo de piedras más oscuras alrededor de la fuente
  const ax = Math.round(rx * 0.62), ay = Math.round(ry * 0.62);
  elipsePx(g, x, y, ax + 3, ay + 3, '#8c7c6a');
  elipsePx(g, x, y, ax + 2, ay + 2, '#b0a28a');
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 14) {
    g.fillStyle = '#d8ccb4'; g.fillRect(Math.round(x + Math.cos(a) * (ax + 1)), Math.round(y + Math.sin(a) * (ay + 1)), 2, 1);
  }
  empedrar(ax, ay);
}

/** Fondo estático del mapa (todo menos el agua animada). */
export function pintarFondo(m) {
  const c = lienzo(m.w * T, m.h * T);
  const g = c.getContext('2d');
  const es = (x, y, ch) => m.tiles[y]?.[x] === ch;
  const suelo = (x, y) => { const k = m.tiles[y]?.[x]; return k === ':' || k === '#'; };
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const k = m.tiles[y][x], px = x * T, py = y * T, h = hash(x, y);
    if (k === ':') g.drawImage(tierraTile(Math.floor(h * 4)), px, py);
    else if (k === '#' && !m.plaza) g.drawImage(plazaTile(Math.floor(h * 4)), px, py);
    else if (k !== '~' && k !== '=') g.drawImage(pastoTile(h < 0.25 ? 0 : 1 + Math.floor(h * 5)), px, py);
  }
  // bordes de camino: el pasto "muerde" la tierra con un borde irregular y una línea oscura
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (!suelo(x, y)) continue;
    const px = x * T, py = y * T;
    const lados = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    lados.forEach(([dx, dy], li) => {
      const vecino = m.tiles[y + dy]?.[x + dx];
      if (!vecino || suelo(x + dx, y + dy) || vecino === '~' || vecino === '=') return;
      for (let i = 0; i < T; i++) {
        const prof = 1 + Math.floor(hash(x * 16 + i, y * 16 + li, 5) * 2.4);
        const [ex, ey] = dy ? [px + i, dy < 0 ? py : py + T - prof] : [dx < 0 ? px : px + T - prof, py + i];
        g.fillStyle = PASTO.base;
        g.fillRect(ex, ey, dy ? 1 : prof, dy ? prof : 1);
        g.fillStyle = PASTO.osc; // sombra del pasto sobre la tierra
        if (dy) g.fillRect(px + i, dy < 0 ? py + prof : py + T - prof - 1, 1, 1);
        else g.fillRect(dx < 0 ? px + prof : px + T - prof - 1, py + i, 1, 1);
      }
    });
  }
  if (m.plaza) plazaCircular(g, m.plaza);
  // orilla del río: piedras y pasto colgando
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (!es(x, y, '~') && !es(x, y, '=')) continue;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const v = m.tiles[y + dy]?.[x + dx];
      if (!v || v === '~' || v === '=') continue;
      // franja de piedras de 4 px del lado de la tierra
      const bx = dx > 0 ? x * T + T - 4 : x * T, by = dy > 0 ? y * T + T - 4 : y * T;
      const w = dx ? 4 : T, h = dy ? 4 : T;
      g.fillStyle = '#7a6a58'; g.fillRect(bx, by, w, h);
      for (let i = 0; i < T; i += 4) {
        g.fillStyle = hash(x * 4 + i * dy, y * 4 + i * dx) < 0.5 ? '#b8a890' : '#a49480';
        if (dx) g.fillRect(bx, by + i, 4, 3); else g.fillRect(bx + i, by, 3, 4);
        g.fillStyle = '#d8ccb8';
        if (dx) g.fillRect(bx, by + i, 3, 1); else g.fillRect(bx + i, by, 2, 1);
      }
    }
  }
  // puente de madera
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (!es(x, y, '=')) continue;
    const px = x * T, py = y * T;
    const arriba = !es(x, y - 1, '='), abajo = !es(x, y + 1, '=');
    g.fillStyle = '#9a6a3c'; g.fillRect(px, py, T, T);
    for (let i = 0; i < T; i += 4) {
      g.fillStyle = '#c08a54'; g.fillRect(px + i, py, 3, T);
      g.fillStyle = '#d8a46a'; g.fillRect(px + i, py, 1, T);
      g.fillStyle = '#6e4628'; g.fillRect(px + i + 3, py, 1, T);
    }
    if (arriba) { g.fillStyle = OUT; g.fillRect(px, py, T, 4); g.fillStyle = '#8a5a30'; g.fillRect(px, py, T, 3); g.fillStyle = '#b07a44'; g.fillRect(px, py, T, 1); }
    if (abajo) {
      g.fillStyle = 'rgba(20,30,80,.35)'; g.fillRect(px, py + T, T, 3);
      g.fillStyle = OUT; g.fillRect(px, py + T - 4, T, 4); g.fillStyle = '#8a5a30'; g.fillRect(px, py + T - 4, T, 3); g.fillStyle = '#b07a44'; g.fillRect(px, py + T - 4, T, 1);
      if (x % 2 === 0) { g.fillStyle = OUT; g.fillRect(px + 1, py + T - 7, 3, 7); g.fillStyle = '#a06a38'; g.fillRect(px + 2, py + T - 6, 1, 5); }
    }
  }
  return c;
}

/** Agua animada (se dibuja cada cuadro por casilla visible). */
export function dibujarAgua(g, m, x, y, px, py, t) {
  const h = hash(x, y);
  const tierra = (dx, dy) => { const v = m.tiles[y + dy]?.[x + dx]; return v && !'~='.includes(v); };
  const tierraIzq = tierra(-1, 0), tierraDer = tierra(1, 0), tierraArr = tierra(0, -1), tierraAba = tierra(0, 1);
  // las piedras de la orilla quedan a la vista
  const x0 = tierraIzq ? 4 : 0, x1 = tierraDer ? T - 4 : T, y0 = tierraArr ? 4 : 0, y1 = tierraAba ? T - 4 : T;
  g.save();
  g.beginPath(); g.rect(px + x0, py + y0, x1 - x0, y1 - y0); g.clip();
  g.fillStyle = AGUA.base; g.fillRect(px, py, T, T);
  g.fillStyle = AGUA.prof;
  for (let i = 0; i < T; i += 2) g.fillRect(px + ((i * 3 + y * 5) % T), py + i, 4, 1);
  // olas que se desplazan
  const o = (t / 90 + h * 40) % 32;
  g.fillStyle = AGUA.claro;
  g.fillRect(px + Math.floor(o) % T, py + 3 + Math.floor(h * 4), 4, 1);
  g.fillRect(px + Math.floor(o + 9) % T, py + 10, 3, 1);
  g.fillRect(px + Math.floor(o + 9) % T + 1, py + 9, 1, 1);
  // destellos
  const fase = Math.floor(t / 180 + h * 12) % 12;
  if (fase < 2) { g.fillStyle = AGUA.brillo; g.fillRect(px + 4 + Math.floor(h * 8), py + 6, fase ? 3 : 1, 1); if (fase) g.fillRect(px + 5 + Math.floor(h * 8), py + 5, 1, 3); }
  // espuma contra las piedras
  const ola = Math.sin(t / 400 + y) > 0 ? 1 : 0;
  g.fillStyle = AGUA.espuma;
  if (tierraIzq) for (let i = 0; i < T; i += 3) g.fillRect(px + x0 + (i % 2) + ola, py + i, 2, 2);
  if (tierraDer) for (let i = 0; i < T; i += 3) g.fillRect(px + x1 - 2 - (i % 2) - ola, py + i, 2, 2);
  if (tierraArr) for (let i = 0; i < T; i += 3) g.fillRect(px + i, py + y0 + (i % 2) + ola, 2, 2);
  if (tierraAba) for (let i = 0; i < T; i += 3) g.fillRect(px + i, py + y1 - 2 - (i % 2) - ola, 2, 2);
  g.restore();
}

/** Flores animadas (sobre el fondo, en casillas ','). */
export function dibujarFlores(g, x, y, px, py, t) {
  const h = hash(x, y, 9);
  const cols = [['#ffffff', '#f2c14e'], ['#f7a8c4', '#fff4c2'], ['#fff07a', '#e89a2a'], ['#c8b0ff', '#fff4c2']];
  const [pet, cen] = cols[Math.floor(h * cols.length)];
  const vaiven = Math.floor(t / 520 + h * 4) % 2;
  for (const [fx, fy] of [[3 + Math.floor(h * 3), 4], [10 - Math.floor(h * 2), 10]]) {
    const ax = px + fx + vaiven, ay = py + fy;
    g.fillStyle = PASTO.osc; g.fillRect(ax, ay + 2, 1, 2);
    g.fillStyle = OUT; g.fillRect(ax - 1, ay - 2, 3, 1); g.fillRect(ax - 2, ay - 1, 5, 3); g.fillRect(ax - 1, ay + 2, 3, 0);
    g.fillStyle = pet; g.fillRect(ax - 1, ay - 1, 3, 2); g.fillRect(ax, ay - 2 + 1, 1, 3); g.fillRect(ax - 1, ay, 3, 1);
    g.fillStyle = cen; g.fillRect(ax, ay - 1 + 1, 1, 1);
  }
}

// =====================================================================
// Árboles grandes (32x40) de copas redondas, arbustos y piedras
// =====================================================================
const PAL_ARBOL = {
  arbol: { o: '#173a22', osc: '#2c6a34', med: '#3f8f3e', base: '#58ad48', luz: '#8fd462', brillo: '#c4ec86' },
  sakura: { o: '#5a1f3a', osc: '#c25a86', med: '#e07ea4', base: '#f4a2c0', luz: '#ffc8da', brillo: '#fff0f4' },
};
const cacheArbol = {};
function copa(tipo, variante) {
  const k = tipo + variante;
  if (cacheArbol[k]) return cacheArbol[k];
  const p = PAL_ARBOL[tipo];
  const c = lienzo(36, 32);
  const g = c.getContext('2d');
  const r = rng(variante * 71 + (tipo === 'sakura' ? 5 : 1));
  const bolas = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + r() * 0.5;
    const d = i === 0 ? 0 : 7 + r() * 3;
    bolas.push({ x: 18 + Math.cos(a) * d * 1.15, y: 15 + Math.sin(a) * d * 0.85, r: 6 + r() * 2.5 });
  }
  bolas.push({ x: 18, y: 12, r: 8 }, { x: 13, y: 18, r: 7 }, { x: 23, y: 18, r: 7 });
  bolas.sort((a, b) => a.y - b.y);
  const disco = (x, y, rad, col) => { g.fillStyle = col; g.beginPath(); g.arc(Math.round(x), Math.round(y), rad, 0, 7); g.fill(); };
  for (const b of bolas) disco(b.x, b.y, b.r + 1, p.o); // contorno de toda la copa
  for (const b of bolas) {
    disco(b.x, b.y, b.r, p.osc);
    disco(b.x - 0.5, b.y - 1, b.r - 1, p.med);
    disco(b.x - 1.2, b.y - 1.8, b.r - 2.4, p.base);
    disco(b.x - b.r * 0.35, b.y - b.r * 0.45, Math.max(1.2, b.r * 0.32), p.luz);
    // borde oscuro de cada bola sobre la anterior (los "racimos" del Minish Cap)
    g.strokeStyle = p.o; g.lineWidth = 1;
    g.beginPath(); g.arc(Math.round(b.x), Math.round(b.y), b.r, 0.15 * Math.PI, 0.85 * Math.PI); g.stroke();
  }
  // brillitos
  for (let i = 0; i < 6; i++) { g.fillStyle = p.brillo; g.fillRect(8 + Math.floor(r() * 18), 5 + Math.floor(r() * 12), 1, 1); }
  if (tipo === 'sakura') for (let i = 0; i < 10; i++) { g.fillStyle = '#ffffff'; g.fillRect(6 + Math.floor(r() * 24), 5 + Math.floor(r() * 20), 1, 1); }
  // quitar el antialias del canvas: todo píxel semitransparente pasa a sólido o vacío
  const d = g.getImageData(0, 0, c.width, c.height);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 110 ? 255 : 0;
  g.putImageData(d, 0, 0);
  return (cacheArbol[k] = c);
}

/** px, py: posición en pantalla; x, y: casilla en el mapa (la variante y el meneo dependen de ella, no de la cámara). */
export function arbol(g, px, py, tipo, t, x, y) {
  const v = Math.floor(hash(x, y, 3) * 3);
  const cx = px + 8;
  // sombra
  g.fillStyle = 'rgba(24,48,20,.3)';
  g.beginPath(); g.ellipse(cx + 2, py + 14, 13, 4, 0, 0, 7); g.fill();
  // tronco con raíces
  g.fillStyle = OUT; g.fillRect(cx - 5, py + 1, 10, 15); g.fillRect(cx - 7, py + 12, 14, 4);
  g.fillStyle = '#7a4e30'; g.fillRect(cx - 4, py + 1, 8, 14); g.fillRect(cx - 6, py + 12, 12, 3);
  g.fillStyle = '#9c6a40'; g.fillRect(cx - 3, py + 1, 3, 13); g.fillRect(cx - 5, py + 13, 3, 1);
  g.fillStyle = '#56341f'; g.fillRect(cx + 2, py + 1, 2, 14); g.fillRect(cx + 3, py + 13, 3, 2);
  g.fillStyle = '#56341f'; g.fillRect(cx - 1, py + 6, 1, 3);
  // copa (se mece un píxel cada tanto)
  const meneo = Math.sin(t / 1100 + x * 2.1 + y * 1.1) > 0.6 ? 1 : 0;
  g.drawImage(copa(tipo, v), cx - 18 + meneo, py - 26);
}

export function arbusto(g, px, py) {
  const p = PAL_ARBOL.arbol;
  g.fillStyle = 'rgba(24,48,20,.3)'; g.fillRect(px + 2, py + 13, 13, 3);
  pixeles(g, [
    '....oooooooo....',
    '..ooLLBBLLBBoo..',
    '.oLLLBBBLLBBBBo.',
    '.oLLBBBBBBBBBMo.',
    'oBBBBBMBBBBBMMMo',
    'oBLLBMMBBLLBBMMo',
    'oBLLBBMMBLLBBMMo',
    'oBBBBMMMBBBBMMMo',
    '.oMBBBMMMBBBMMo.',
    '.oMMMMMMMMMMMMo.',
    '..ooMMMMMMMMoo..',
    '....oooooooo....',
  ], { o: p.o, L: p.luz, B: p.base, M: p.med }, px, py + 2);
}

export function roca(g, px, py) {
  g.fillStyle = 'rgba(24,48,20,.3)'; g.fillRect(px + 2, py + 13, 13, 3);
  pixeles(g, [
    '....oooooo......',
    '..ooLLLLMMoo....',
    '.oLLWLLMMMMMo...',
    '.oLWLLMMMMMMDo..',
    'oLLLLMMMMMMDDDo.',
    'oLLMMMMMMMDDDDo.',
    'oMMMMMMMDDDDDDo.',
    'oMMMMMDDDDDDDDo.',
    '.oDDDDDDDDDDDo..',
    '..ooooooooooo...',
  ], { o: OUT, W: '#f0f0f4', L: '#c8c8d4', M: '#9898aa', D: '#6e6e84' }, px + 1, py + 4);
}

// =====================================================================
// Edificios: techos de tejas, paredes con vigas, ventanas con macetas
// =====================================================================
const ESTILOS = {
  dojo: { techo: '#d0402e', pared: '#f4ead2', viga: '#5a3424', base: '#9a8e80', puerta: '#6a3e26', persiana: null, japones: true },
  musica: { techo: '#4a6ad0', pared: '#eef0f6', viga: '#3a3e5a', base: '#9a96a8', puerta: '#30407a', persiana: '#4a6ad0' },
  cafe: { techo: '#a8603a', pared: '#f4e2c4', viga: '#5a3824', base: '#a8927a', puerta: '#5a3420', persiana: '#3f8f5a', toldo: ['#e04a5a', '#fff4e6'] },
  casa: { techo: '#3a9a88', pared: '#fbf2de', viga: '#6a4a34', base: '#a8a090', puerta: '#7a4e32', persiana: '#e8a040', chimenea: true },
  cine: { techo: '#7a3aa8', pared: '#2e1a3a', viga: '#f2c14e', base: '#4a3050', puerta: '#a8203a', persiana: null, cine: true },
};

function techo(g, s, px, py, w, alto, japones) {
  const base = s.techo, osc = tono(base, -0.35), med = tono(base, -0.15), luz = tono(base, 0.3);
  const vuelo = 6; // alero que sobresale
  const forma = []; // [x0, x1] por fila: angosto arriba (cumbrera), ancho abajo con alero
  const arriba = Math.max(8, w / 2 - 18), abajo = w / 2 + vuelo;
  for (let y = 0; y < alto; y++) {
    const f = y / (alto - 1);
    const mitad = arriba + (abajo - arriba) * Math.min(1, f * 1.5);
    const curva = japones ? Math.max(0, y - (alto - 5)) : 0; // alero japonés que se levanta en las puntas
    forma.push([Math.round(px + w / 2 - mitad - curva), Math.round(px + w / 2 + mitad + curva)]);
  }
  // contorno
  forma.forEach(([x0, x1], y) => { g.fillStyle = OUT; g.fillRect(x0 - 1, py + y, x1 - x0 + 2, 1); });
  g.fillRect(forma[0][0] - 1, py - 1, forma[0][1] - forma[0][0] + 2, 1);
  g.fillRect(forma[alto - 1][0] - 1, py + alto, forma[alto - 1][1] - forma[alto - 1][0] + 2, 1);
  // tejas: filas de 4 px con bordes redondeados
  forma.forEach(([x0, x1], y) => {
    const fila = Math.floor(y / 4), dentro = y % 4;
    const off = fila % 2 ? 3 : 0;
    for (let x = x0; x < x1; x++) {
      const k = (x - px + off + 60) % 6;
      let col = med;
      if (dentro === 0) col = luz;
      else if (dentro === 3) col = osc;
      else if (k === 0) col = osc;
      else if (dentro === 1 && k < 3) col = base;
      if (dentro === 3 && (k === 2 || k === 3)) col = med;
      g.fillStyle = col; g.fillRect(x, py + y, 1, 1);
    }
  });
  // cumbrera
  const [c0, c1] = forma[0];
  g.fillStyle = OUT; g.fillRect(c0 - 2, py - 3, c1 - c0 + 4, 4);
  g.fillStyle = tono(base, -0.5); g.fillRect(c0 - 1, py - 2, c1 - c0 + 2, 2);
  g.fillStyle = tono(base, -0.2); g.fillRect(c0 - 1, py - 2, c1 - c0 + 2, 1);
  // alero (sombra fuerte abajo)
  const [a0, a1] = forma[alto - 1];
  g.fillStyle = tono(base, -0.55); g.fillRect(a0, py + alto - 2, a1 - a0, 2);
  if (japones) { // puntas curvas hacia arriba
    g.fillStyle = OUT; g.fillRect(a0 - 3, py + alto - 6, 3, 4); g.fillRect(a1, py + alto - 6, 3, 4);
    g.fillStyle = base; g.fillRect(a0 - 2, py + alto - 5, 2, 2); g.fillRect(a1 + 0, py + alto - 5, 2, 2);
  }
  return forma;
}

function ventana(g, x, y, s, noche, t, n = 0) {
  const vidrio = noche ? '#ffd27a' : '#7ab8e8';
  g.fillStyle = OUT; g.fillRect(x - 1, y - 1, 14, 13);
  g.fillStyle = s.viga; g.fillRect(x, y, 12, 11);
  g.fillStyle = vidrio; g.fillRect(x + 1, y + 1, 10, 8);
  g.fillStyle = noche ? '#fff0c0' : '#c8e8ff'; g.fillRect(x + 1, y + 1, 4, 3); g.fillRect(x + 6, y + 5, 2, 1);
  g.fillStyle = s.viga; g.fillRect(x + 5, y + 1, 2, 8); g.fillRect(x + 1, y + 4, 10, 1);
  if (s.persiana) { // postigos
    for (const sx of [x - 5, x + 13]) {
      g.fillStyle = OUT; g.fillRect(sx - 1, y - 1, 6, 12);
      g.fillStyle = s.persiana; g.fillRect(sx, y, 4, 10);
      g.fillStyle = tono(s.persiana, -0.3); for (let k = 1; k < 10; k += 2) g.fillRect(sx, y + k, 4, 1);
    }
  }
  // maceta con flores
  g.fillStyle = OUT; g.fillRect(x - 1, y + 10, 14, 4);
  g.fillStyle = '#a0603a'; g.fillRect(x, y + 11, 12, 2);
  g.fillStyle = '#4a9a3c'; g.fillRect(x, y + 9, 12, 2);
  const fl = ['#ff7a9a', '#fff4a0', '#ffffff'];
  for (let k = 0; k < 4; k++) { g.fillStyle = fl[(k + n) % 3]; g.fillRect(x + 1 + k * 3, y + 8 + ((k + Math.floor(t / 700)) % 2), 2, 1); }
}

function shoji(g, x, y, noche) {
  g.fillStyle = OUT; g.fillRect(x - 1, y - 1, 16, 12);
  g.fillStyle = '#6a3e26'; g.fillRect(x, y, 14, 10);
  g.fillStyle = noche ? '#ffe2a0' : '#fbf5e6'; g.fillRect(x + 1, y + 1, 12, 8);
  g.fillStyle = '#b8a07a';
  for (let k = 4; k < 13; k += 4) g.fillRect(x + k, y + 1, 1, 8);
  g.fillRect(x + 1, y + 5, 12, 1);
}

// texto pixelado y nítido: se dibuja aparte y se binariza el alfa (sin bordes borrosos)
const cacheTexto = new Map();
function textoNitido(txt, color, tam = 10) {
  const k = txt + color + tam;
  if (cacheTexto.has(k)) return cacheTexto.get(k);
  const m = lienzo(1, 1).getContext('2d');
  const fuente = `${tam}px DotGothic16, 'MS Gothic', monospace`;
  m.font = fuente;
  const c = lienzo(Math.ceil(m.measureText(txt).width) + 2, tam + 3);
  const g = c.getContext('2d');
  g.font = fuente; g.textBaseline = 'top'; g.fillStyle = color; g.fillText(txt, 1, 1);
  const d = g.getImageData(0, 0, c.width, c.height);
  for (let i = 3; i < d.data.length; i += 4) d.data[i] = d.data[i] > 105 ? 255 : 0;
  g.putImageData(d, 0, 0);
  if (document.fonts?.check?.(fuente)) cacheTexto.set(k, c); // si la fuente no cargó aún, no lo guardamos
  return c;
}

function letrero(g, txt, cx, cy, fondo = '#f6eedb', tinta = OUT) {
  const tx = textoNitido(txt, tinta);
  const tw = tx.width + 4;
  const x = Math.round(cx - tw / 2);
  g.fillStyle = OUT; g.fillRect(x - 2, cy - 2, tw + 4, 15);
  g.fillStyle = '#8a5a30'; g.fillRect(x - 1, cy - 1, tw + 2, 13);
  g.fillStyle = fondo; g.fillRect(x, cy, tw, 11);
  g.fillStyle = tono(fondo, 0.4); g.fillRect(x, cy, tw, 1);
  g.drawImage(tx, x + 2, cy - 1);
}

export function edificio(g, e, ox, oy, noche, t) {
  const s = ESTILOS[e.estilo];
  const px = e.x * T - ox, py = e.y * T - oy, w = e.w * T, h = e.h * T;
  const techoH = Math.floor(h * 0.5);
  const paredY = py + techoH - 2;
  // sombra proyectada
  g.fillStyle = 'rgba(24,40,30,.28)'; g.fillRect(px + 6, py + h - 3, w, 6); g.fillRect(px + w, py + techoH, 6, h - techoH + 3);
  // chimenea (detrás del techo)
  if (s.chimenea) {
    g.fillStyle = OUT; g.fillRect(px + w - 22, py - 8, 10, 18);
    g.fillStyle = '#b05a3c'; g.fillRect(px + w - 21, py - 7, 8, 16);
    g.fillStyle = '#d8805a'; g.fillRect(px + w - 21, py - 7, 8, 2);
    const humo = (t / 60) % 24;
    g.fillStyle = 'rgba(240,240,250,.6)';
    g.beginPath(); g.arc(px + w - 17 + Math.sin(t / 400) * 2, py - 10 - humo, 2 + humo / 8, 0, 7); g.fill();
  }
  // paredes
  g.fillStyle = OUT; g.fillRect(px + 1, paredY, w - 2, py + h - paredY);
  g.fillStyle = s.pared; g.fillRect(px + 2, paredY, w - 4, py + h - paredY - 1);
  g.fillStyle = tono(s.pared, -0.08);
  for (let i = px + 4; i < px + w - 4; i += 7) g.fillRect(i, paredY + 2, 1, h - techoH - 6); // textura de revoque
  // vigas (entramado)
  g.fillStyle = s.viga;
  g.fillRect(px + 2, paredY, 3, py + h - paredY - 1); g.fillRect(px + w - 5, paredY, 3, py + h - paredY - 1);
  g.fillRect(px + 2, paredY + 1, w - 4, 2);
  if (s.japones) for (let i = px + 18; i < px + w - 8; i += 24) g.fillRect(i, paredY, 3, py + h - paredY - 1);
  // zócalo de piedra
  for (let i = px + 2, n = 0; i < px + w - 2; i += 6, n++) {
    g.fillStyle = OUT; g.fillRect(i, py + h - 6, 6, 5);
    g.fillStyle = n % 2 ? s.base : tono(s.base, 0.15); g.fillRect(i + 1, py + h - 5, 5, 3);
    g.fillStyle = tono(s.base, 0.4); g.fillRect(i + 1, py + h - 5, 4, 1);
  }
  // ventanas
  const puertaX = (e.puerta.x - e.x) * T + px;
  const vy = paredY + 7;
  for (let i = px + 14; i < px + w - 20; i += 28) {
    if (Math.abs(i + 6 - (puertaX + 8)) < 22) continue;
    if (s.cine) break;
    if (s.japones) shoji(g, i - 1, vy, noche);
    else ventana(g, i, vy, s, noche, t, (i - px) / 28 + e.x);
  }
  if (s.cine) fachadaCine(g, px, py, w, h, paredY, puertaX, noche, t);
  // techo
  techo(g, s, px - 2, py, w + 4, techoH, s.japones);
  // toldo a rayas del café
  if (s.toldo) {
    const ty = paredY + 3;
    for (let i = px + 6; i < px + w - 6; i += 4) {
      g.fillStyle = s.toldo[((i - px) / 4) % 2]; g.fillRect(i, ty, 4, 5);
      g.beginPath(); g.arc(i + 2, ty + 5, 2, 0, Math.PI); g.fill();
    }
    g.fillStyle = OUT; g.fillRect(px + 6, ty - 1, w - 12, 1);
  }
  // marquesina del cine con foquitos
  if (s.cine) {
    const mx = px + 10, my = paredY - 6, mw = w - 20;
    g.fillStyle = OUT; g.fillRect(mx - 1, my - 1, mw + 2, 14);
    g.fillStyle = '#3a1a48'; g.fillRect(mx, my, mw, 12);
    const fase = Math.floor(t / 250) % 3;
    for (let i = 0; i < mw; i += 4) {
      g.fillStyle = (i / 4) % 3 === fase ? '#fff6c8' : '#c9952e';
      g.fillRect(mx + i + 1, my + 1, 2, 1); g.fillRect(mx + i + 1, my + 10, 2, 1);
    }
  }
  // puerta (arco de madera + escalón)
  const dx = puertaX + 3, dy = py + h - 17;
  g.fillStyle = OUT; g.fillRect(dx - 2, dy - 2, 14, 18); g.fillRect(dx - 1, dy - 3, 12, 1);
  g.fillStyle = s.viga; g.fillRect(dx - 1, dy - 1, 12, 16);
  g.fillStyle = s.puerta; g.fillRect(dx, dy, 10, 15);
  g.fillStyle = tono(s.puerta, 0.2); g.fillRect(dx + 1, dy + 1, 1, 13); g.fillRect(dx + 5, dy + 1, 1, 13);
  g.fillStyle = tono(s.puerta, -0.3); g.fillRect(dx + 4, dy, 1, 15); g.fillRect(dx + 9, dy, 1, 15);
  g.fillStyle = '#f2c14e'; g.fillRect(dx + 7, dy + 8, 1, 2);
  g.fillStyle = OUT; g.fillRect(dx - 3, py + h - 2, 16, 3);
  g.fillStyle = '#c8bca8'; g.fillRect(dx - 2, py + h - 2, 14, 2);
  if (s.japones) { // noren (cortina) sobre la puerta
    g.fillStyle = OUT; g.fillRect(dx - 3, dy - 2, 16, 8);
    g.fillStyle = '#26346a'; g.fillRect(dx - 2, dy - 1, 14, 6);
    g.fillStyle = '#3a4a8a'; g.fillRect(dx + 4, dy - 1, 1, 6);
    g.fillStyle = '#f6eedb'; g.fillRect(dx + 1, dy + 1, 2, 2); g.fillRect(dx + 7, dy + 1, 2, 2);
  }
  if (s.cine) { // alfombra roja y sogas de terciopelo
    g.fillStyle = OUT; g.fillRect(dx - 2, py + h - 1, 14, 9);
    g.fillStyle = '#a8203a'; g.fillRect(dx - 1, py + h - 1, 12, 8);
    g.fillStyle = '#d83a50'; g.fillRect(dx - 1, py + h - 1, 12, 1); g.fillRect(dx - 1, py + h + 2, 1, 5); g.fillRect(dx + 10, py + h + 2, 1, 5);
    for (const sx of [dx - 9, dx + 16]) {
      g.fillStyle = OUT; g.fillRect(sx - 1, py + h - 2, 4, 11);
      g.fillStyle = '#f2c14e'; g.fillRect(sx, py + h - 1, 2, 9); g.fillStyle = '#fff0b0'; g.fillRect(sx, py + h - 1, 1, 2);
    }
    g.fillStyle = '#a8203a';
    for (let k = 0; k < 5; k++) { g.fillRect(dx - 7 + k, py + h + 1 + (k > 0 && k < 4 ? 1 : 0), 1, 2); g.fillRect(dx + 12 + k, py + h + 1 + (k > 0 && k < 4 ? 1 : 0), 1, 2); }
  }
  // farolito junto a la puerta (de noche alumbra)
  if (!s.japones) {
    const lx = dx + 14, ly = dy + 2;
    g.fillStyle = OUT; g.fillRect(lx - 1, ly - 1, 5, 6);
    g.fillStyle = noche ? '#ffe08a' : '#f6eedb'; g.fillRect(lx, ly, 3, 4);
  }
  // cartel con kanji
  if (e.cartel) {
    if (s.cine) letrero(g, e.cartel, px + w / 2, paredY - 5, '#3a1a48', '#fff0b0');
    else letrero(g, e.cartel, px + w / 2, py + techoH - 16);
  }
}

function fachadaCine(g, px, py, w, h, paredY, puertaX, noche, t) {
  const abajo = py + h - 6;
  // franja superior más clara y patrón de rombos dorados apagados
  g.fillStyle = '#4a2a5e'; g.fillRect(px + 5, paredY + 3, w - 10, 4);
  g.fillStyle = '#3a2048';
  for (let y = paredY + 10; y < abajo - 2; y += 6) for (let x = px + 8 + ((y / 6) % 2) * 3; x < px + w - 8; x += 6) g.fillRect(x, y, 1, 1);
  // pilastras doradas
  const pil = [px + 30, px + w - 33, puertaX - 6, puertaX + 19];
  for (const x of pil) {
    g.fillStyle = OUT; g.fillRect(x - 1, paredY + 3, 5, abajo - paredY - 3);
    g.fillStyle = '#c9952e'; g.fillRect(x, paredY + 3, 3, abajo - paredY - 3);
    g.fillStyle = '#fff0b0'; g.fillRect(x, paredY + 3, 1, abajo - paredY - 3);
    g.fillStyle = '#f2c14e'; g.fillRect(x - 1, paredY + 3, 5, 2); g.fillRect(x - 1, abajo - 3, 5, 2);
  }
  // afiches enmarcados (iluminados de noche)
  const vy = paredY + 11;
  const afiches = [[px + 10, '#e85a7a', '#ffd0dc'], [px + w - 26, '#5ab0e8', '#d8f0ff'], [px + 37, '#8ad46a', '#e8ffd0'], [px + w - 53, '#f2c14e', '#fff6c8']];
  for (const [x, col, luz] of afiches) {
    if (x > puertaX - 22 && x < puertaX + 22) continue;
    g.fillStyle = OUT; g.fillRect(x - 2, vy - 2, 18, 24);
    g.fillStyle = '#f2c14e'; g.fillRect(x - 1, vy - 1, 16, 22);
    g.fillStyle = '#8a6420'; g.fillRect(x, vy, 14, 20);
    g.fillStyle = col; g.fillRect(x + 1, vy + 1, 12, 18);
    g.fillStyle = luz; g.fillRect(x + 1, vy + 1, 12, 3);
    g.fillStyle = tono(col, -0.45); g.beginPath(); g.arc(x + 7, vy + 10, 4, 0, 7); g.fill();
    g.fillStyle = luz; g.fillRect(x + 5, vy + 8, 2, 2);
    g.fillStyle = '#fff'; g.fillRect(x + 3, vy + 16, 8, 1);
    if (noche) { g.fillStyle = 'rgba(255,240,180,.25)'; g.fillRect(x + 1, vy + 1, 12, 18); }
  }
  // boletería junto a la puerta
  const bx = puertaX - 20, by = abajo - 18;
  g.fillStyle = OUT; g.fillRect(bx - 1, by - 1, 13, 18);
  g.fillStyle = '#c9952e'; g.fillRect(bx, by, 11, 16);
  g.fillStyle = noche ? '#ffe2a0' : '#9fd0f0'; g.fillRect(bx + 1, by + 2, 9, 7);
  g.fillStyle = '#2a1a2a'; g.beginPath(); g.arc(bx + 5.5, by + 7, 2.5, Math.PI, 0); g.fill(); g.fillRect(bx + 3, by + 7, 5, 2);
  g.fillStyle = '#a8203a'; g.fillRect(bx, by + 10, 11, 6);
  g.fillStyle = '#f2c14e'; g.fillRect(bx + 2, by + 12, 7, 1);
  void t;
}

// =====================================================================
// Decoración
// =====================================================================
export function decorar(g, d, px, py, t, noche) {
  switch (d.tipo) {
    case 'arbol': case 'sakura': arbol(g, px, py, d.tipo, t, d.x, d.y); break;
    case 'arbusto': arbusto(g, px, py); break;
    case 'roca': roca(g, px, py); break;
    case 'farol': { // tōrō de piedra
      g.fillStyle = 'rgba(24,48,20,.3)'; g.fillRect(px + 2, py + 13, 13, 3);
      pixeles(g, [
        '......oooo......',
        '....ooLLLLoo....',
        '..ooLLLLLLMMoo..',
        '.oMMMMMMMMMMDDo.',
        '..ooooooooooo...',
        '....oMooooMo....',
        '....oMFFFFMo....',
        '....oMFFFFMo....',
        '....oMooooMo....',
        '...oLLLLLLMMo...',
        '....ooMMMDoo....',
        '.....oLMMDo.....',
        '.....oLMMDo.....',
        '.....oLMMDo.....',
        '....oLLMMDDo....',
        '...oMMMMMDDDo...',
        '...ooooooooo....',
      ], { o: OUT, L: '#d0d0d8', M: '#a0a0b0', D: '#74748a', F: noche ? '#ffe08a' : '#4a4a58' }, px, py - 3);
      break;
    }
    case 'torii': {
      const r = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(px + x, py + y, w, h); };
      const rojo = '#d83a2a', rojoOsc = '#9a2418', rojoLuz = '#f06a4a';
      // pilares
      for (const x of [-9, 2 * T - 5]) { r(OUT, x - 1, -12, 6, 30); r(rojo, x, -12, 4, 29); r(rojoLuz, x, -12, 1, 29); r(rojoOsc, x + 3, -12, 1, 29); r(OUT, x - 2, 15, 8, 3); r('#2a2a34', x - 1, 15, 6, 2); }
      // nuki (viga de abajo)
      r(OUT, -12, -9, 2 * T + 22, 5); r(rojo, -11, -8, 2 * T + 20, 3); r(rojoLuz, -11, -8, 2 * T + 20, 1);
      // kasagi (viga de arriba, curvada y negra encima)
      r(OUT, -16, -18, 2 * T + 30, 7); r(rojo, -15, -17, 2 * T + 28, 4); r(rojoLuz, -15, -17, 2 * T + 28, 1);
      r(OUT, -18, -21, 2 * T + 34, 4); r('#3a2a34', -17, -20, 2 * T + 32, 2);
      r(OUT, -20, -23, 5, 4); r(OUT, 2 * T + 13, -23, 5, 4);
      // placa con el nombre
      r(OUT, 2 * T / 2 - 9, -12, 8, 9); r('#2a2a34', 2 * T / 2 - 8, -11, 6, 7); r('#f2c14e', 2 * T / 2 - 6, -10, 2, 5);
      break;
    }
    case 'banco':
      g.fillStyle = 'rgba(24,48,20,.3)'; g.fillRect(px + 1, py + 12, 15, 3);
      pixeles(g, [
        'oooooooooooooooo',
        'oLLLLLLLLLLLLLLo',
        'oMMMMMMMMMMMMMMo',
        'oooooooooooooooo',
        '.oDo........oDo.',
        'oooooooooooooooo',
        'oLLLLLLLLLLLLLLo',
        'oMMMMMMMMMMMMMMo',
        'oooooooooooooooo',
        '.oDo........oDo.',
        '.oDo........oDo.',
        '.ooo........ooo.',
      ], { o: OUT, L: '#d8a46a', M: '#a8703e', D: '#6e4628' }, px, py + 2);
      break;
    case 'buzon': // buzón japonés rojo
      g.fillStyle = 'rgba(24,48,20,.3)'; g.fillRect(px + 3, py + 13, 11, 3);
      pixeles(g, [
        '....oooooooo....',
        '...oLRRRRRRDo...',
        '...oLRRRRRRDo...',
        '...ooooooooo....',
        '...oLRWWWWRDo...',
        '...oLRRRRRRDo...',
        '...oLRRRRRRDo...',
        '...oLRRWRRRDo...',
        '...oLRRRRRRDo...',
        '...oLRRRRRRDo...',
        '...ooooooooo....',
        '.....oKKKKo.....',
        '....oooooooo....',
      ], { o: OUT, L: '#ff7a6a', R: '#d8302a', D: '#9a1a18', W: '#2a1a1a', K: '#5a5a68' }, px, py + 1);
      break;
    case 'fuente': {
      const cx = px + 8, cy = py + 10;
      g.fillStyle = 'rgba(24,48,20,.3)'; g.beginPath(); g.ellipse(cx + 1, cy + 3, 17, 8, 0, 0, 7); g.fill();
      g.fillStyle = OUT; g.beginPath(); g.ellipse(cx, cy, 17, 9, 0, 0, 7); g.fill();
      g.fillStyle = '#c8c4d4'; g.beginPath(); g.ellipse(cx, cy, 16, 8, 0, 0, 7); g.fill();
      g.fillStyle = '#9894ac'; g.fillRect(cx - 16, cy, 32, 3);
      g.fillStyle = OUT; g.beginPath(); g.ellipse(cx, cy - 1, 13, 6, 0, 0, 7); g.fill();
      g.fillStyle = AGUA.base; g.beginPath(); g.ellipse(cx, cy - 1, 12, 5, 0, 0, 7); g.fill();
      const k = (t / 140) % 8;
      g.strokeStyle = AGUA.claro; g.lineWidth = 1;
      g.beginPath(); g.ellipse(cx, cy - 1, 3 + k, 1 + k / 2.5, 0, 0, 7); g.stroke();
      g.fillStyle = OUT; g.fillRect(cx - 3, cy - 13, 6, 12);
      g.fillStyle = '#c8c4d4'; g.fillRect(cx - 2, cy - 12, 4, 11); g.fillStyle = '#f0f0f4'; g.fillRect(cx - 2, cy - 12, 1, 11);
      g.fillStyle = AGUA.brillo;
      const j = (t / 90) % 6;
      g.fillRect(cx - 1, cy - 18 + j * 0.3, 2, 5);
      g.fillStyle = AGUA.claro;
      g.fillRect(cx - 5 - j * 0.6, cy - 12 + j, 1, 2); g.fillRect(cx + 4 + j * 0.6, cy - 12 + j, 1, 2);
      break;
    }
    case 'fuenteGrande': { // fuente de dos pisos, centro de la plaza (ocupa 3x2 casillas)
      const cx = px + 8, cy = py + 12;
      const elipse = (rx, ry, col, dy = 0) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy + dy, rx, ry, 0, 0, 7); g.fill(); };
      elipse(27, 12, 'rgba(24,48,20,.28)', 5);
      // pileta de abajo: borde de piedra con frente
      elipse(26, 12, OUT, 4); elipse(25, 11, '#8a86a0', 4);
      elipse(26, 12, OUT); elipse(25, 11, '#d8d4e4'); elipse(25, 11, '#c8c4d4', 1);
      elipse(21, 8, OUT); elipse(20, 7, AGUA.prof); elipse(20, 6, AGUA.base, 1);
      // ondas que se abren desde el centro
      g.strokeStyle = AGUA.claro; g.lineWidth = 1;
      for (let k = 0; k < 2; k++) {
        const r = ((t / 70 + k * 9) % 18);
        g.beginPath(); g.ellipse(cx, cy + 1, 3 + r, 1 + r * 0.38, 0, 0, 7); g.stroke();
      }
      const brillo = Math.floor(t / 200) % 6;
      g.fillStyle = AGUA.brillo; g.fillRect(cx - 12 + brillo * 4, cy + 3, 2, 1); g.fillRect(cx + 8 - brillo * 2, cy - 2, 1, 1);
      // columna y pileta de arriba
      g.fillStyle = OUT; g.fillRect(cx - 4, cy - 16, 8, 17);
      g.fillStyle = '#c8c4d4'; g.fillRect(cx - 3, cy - 15, 6, 15);
      g.fillStyle = '#f0f0f4'; g.fillRect(cx - 3, cy - 15, 2, 15);
      g.fillStyle = '#9894ac'; g.fillRect(cx + 2, cy - 15, 1, 15);
      g.fillStyle = OUT; g.beginPath(); g.ellipse(cx, cy - 16, 11, 4, 0, 0, 7); g.fill();
      g.fillStyle = '#d8d4e4'; g.beginPath(); g.ellipse(cx, cy - 16, 10, 3, 0, 0, 7); g.fill();
      g.fillStyle = '#8a86a0'; g.fillRect(cx - 10, cy - 16, 20, 2);
      g.fillStyle = AGUA.base; g.beginPath(); g.ellipse(cx, cy - 17, 7, 1.6, 0, 0, 7); g.fill();
      // chorro y gotas que caen a la pileta grande
      const j = (t / 80) % 8;
      g.fillStyle = AGUA.brillo; g.fillRect(cx - 1, cy - 25 + (j % 2), 2, 8);
      g.fillStyle = AGUA.claro; g.fillRect(cx - 2, cy - 22, 1, 3); g.fillRect(cx + 2, cy - 22, 1, 3);
      for (const lado of [-1, 1]) for (let k = 0; k < 3; k++) {
        const f = ((t / 400 + k / 3) % 1);
        g.fillStyle = k === 0 ? AGUA.brillo : AGUA.claro;
        g.fillRect(Math.round(cx + lado * (9 + f * 7)), Math.round(cy - 16 + f * f * 16), 1, 2);
      }
      break;
    }
    case 'macetas':
      g.fillStyle = 'rgba(24,48,20,.3)'; g.fillRect(px + 2, py + 13, 13, 3);
      pixeles(g, [
        '..1..2...3..1...',
        '.111222.333111..',
        '..1GG2GGG3GG1G..',
        '.GGGGGGGGGGGGGG.',
        'oooooooooooooooo',
        'oLLLLLLLLLLLLLLo',
        '.oMMMMMMMMMMMMo.',
        '.oMMMMMMMMMMMMo.',
        '.oDDDDDDDDDDDDo.',
        '..oooooooooooo..',
      ], { o: OUT, L: '#e08a5a', M: '#b8603a', D: '#8a4028', G: '#4a9a3c', 1: '#ff7a9a', 2: '#fff4a0', 3: '#ffffff' }, px, py + 5);
      break;
  }
}

/** Tablón de misiones (cartel grande con papelitos). */
export function cartel(g, px, py) {
  g.fillStyle = 'rgba(24,48,20,.3)'; g.fillRect(px + 1, py + 13, 15, 3);
  pixeles(g, [
    '.oooooooooooooo.',
    'oLLLLLLLLLLLLLLo',
    'oMWWMMPPMMWWWMMo',
    'oMWWMMPPMMWWWMMo',
    'oMMMMMMMMMMMMMMo',
    'oMMYYMMMWWMMMMMo',
    'oMMYYMMMWWMMPPMo',
    'oDDDDDDDDDDDDDDo',
    '.oooooooooooooo.',
    '..oMo......oMo..',
    '..oMo......oMo..',
    '..oDo......oDo..',
    '..ooo......ooo..',
  ], { o: OUT, L: '#d8a46a', M: '#a8703e', D: '#6e4628', W: '#fbf5e6', P: '#f7a8c4', Y: '#fff07a' }, px, py);
}

// =====================================================================
// Ambiente: mariposas
// =====================================================================
export function mariposa(g, x, y, t, col) {
  const ala = Math.floor(t / 120) % 2;
  g.fillStyle = OUT; g.fillRect(x, y, 1, 3);
  g.fillStyle = col;
  if (ala) { g.fillRect(x - 2, y, 2, 2); g.fillRect(x + 1, y, 2, 2); }
  else { g.fillRect(x - 1, y - 1, 1, 3); g.fillRect(x + 1, y - 1, 1, 3); }
}
