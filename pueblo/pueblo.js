// El portfolio como un pueblo de Sandō: cada edificio es una parte del trabajo de Lautaro.
// Usa el motor, el arte y a Arky del juego (../sando/js) sin modificarlos. El menú es el camino
// principal: elegir un lugar hace que Arky camine solo hasta la puerta y abre lo que hay adentro.
import { Mundo, Motor, T } from '../sando/js/motor.js';
import { sonido, sfx } from '../sando/js/util.js';
import { IMG, VISUALES, EXTRAS, LUGARES, PLAZA, camino } from './lugares.js';

const { PROYECTOS, PROYECTO_ENLACES } = window;
const porNombre = Object.fromEntries(PROYECTOS.map(p => [p[0], p]));
// ---------- El pueblo ----------
const PAL = {
  obaasan: { piel: '#f0c8a0', pelo: '#d9d2c8', ropa: '#8e6fb5', pantalon: '#5a3a8e', estilo: 'rodete' },
  kenta: { piel: '#f3c9a0', pelo: '#2b2233', ropa: '#f2c14e', pantalon: '#3b5ba5', estilo: 'gorra', gorra: '#4a90d9' },
  hana: { piel: '#f6d2b0', pelo: '#1a1424', ropa: '#f6eedb', ropa2: '#2d3a6b', pantalon: '#2d3a6b', estilo: 'largo' },
  mio: { piel: '#f6d2b0', pelo: '#7a3a2a', ropa: '#a8203a', ropa2: '#f2c14e', pantalon: '#2e1a3a', estilo: 'rodete' },
  yuki: { piel: '#f6d2b0', pelo: '#4a2c1a', ropa: '#f4a6b8', pantalon: '#6d5a86', estilo: 'largo' },
};
const CHARLAS = {
  obaasan: { nombre: 'おばあさん', lineas: ['¡Bienvenido a Sandō! Este pueblo es el portfolio de Lautaro.', 'Cada edificio es una parte de su trabajo. Elegí un lugar en el menú y Arky te lleva.'], ir: 'plaza' },
  hana: { nombre: 'Hana', lineas: ['En el laboratorio clínico trabaja Lautaro de día: integraciones de salud, plantillas, microbiología…'], ir: 'lab' },
  mio: { nombre: 'Mio', lineas: ['El estudio creativo tiene los sprites de Arky y los acertijos de una campaña de D&D.'], ir: 'estudio' },
  kenta: { nombre: 'Kenta', lineas: ['¡En esa casa vive Arky! Es un asistente con IA que te ayuda con la cocina y con la plata.'], ir: 'arky' },
  yuki: { nombre: 'Yuki', lineas: ['El kissaten es el corazón de Sandō: ahí está la academia de barismo.'], ir: 'cafe' },
};

function crearPueblo() {
  const W = 35, H = 26, CX = 17, CY = 12.5, R = 5.5;
  const edificios = LUGARES.map(l => ({ id: l.id, estilo: l.estilo, x: l.x, y: l.y, w: l.w, h: l.h, puerta: l.puerta, cartel: l.kanji }));
  const decor = [];
  const d = (tipo, x, y, extra = {}) => decor.push({ tipo, x, y, ...extra });
  for (let y = 1; y < H - 1; y++) { d(y % 5 === 2 ? 'sakura' : 'arbol', 0, y); d(y % 5 === 4 ? 'sakura' : 'arbol', W - 1, y); }
  for (let x = 0; x < W; x++) { d(x % 5 === 2 ? 'sakura' : 'arbol', x, 0); d(x % 6 === 3 ? 'sakura' : 'arbol', x, H - 1); }
  d('fuenteGrande', CX, 12);
  for (const [x, y] of [[CX - 1, 12], [CX + 1, 12], [CX - 1, 13], [CX, 13], [CX + 1, 13]]) d('fuente-parte', x, y);
  [[12, 6], [22, 6], [11, 11], [23, 11], [11, 18], [23, 18], [14, 20], [20, 20]].forEach(([x, y]) => d('sakura', x, y));
  [[3, 9], [31, 9], [2, 19], [32, 19], [8, 21], [26, 21]].forEach(([x, y], i) => d(i % 2 ? 'arbol' : 'sakura', x, y));
  [[14, 8], [20, 8], [12, 10], [22, 10], [13, 16], [21, 16], [16, 20], [18, 20]].forEach(([x, y]) => d('farol', x, y));
  [[1, 8], [33, 8], [10, 8], [24, 8], [1, 17], [33, 17], [5, 20], [29, 20], [11, 21], [23, 21]].forEach(([x, y]) => d('arbusto', x, y));
  for (let x = 2; x < W - 2; x += 3) d('arbusto', x, 24);
  d('torii', 8, 9, { bloquea: false }); d('nada', 7, 9); d('nada', 9, 9);
  d('banco', 14, 15); d('banco', 20, 15);
  d('macetas', 15, 7); d('macetas', 19, 7); d('macetas', 3, 17); d('macetas', 9, 17); d('macetas', 25, 17); d('macetas', 31, 17);
  d('roca', 4, 21); d('roca', 30, 21); d('roca', 12, 3);
  const carteles = [{ id: 'clasica', x: 13, y: 9 }];
  const npcs = [
    { id: 'obaasan', x: 15, y: 10, dir: 0, radio: 1 },
    { id: 'kenta', x: 22, y: 15, dir: 2, radio: 1 },
    { id: 'hana', x: 25, y: 9, dir: 0, radio: 1 },
    { id: 'mio', x: 19, y: 9, dir: 0, radio: 1 },
    { id: 'yuki', x: 8, y: 18, dir: 0, radio: 1 },
  ].map(n => ({ ...n, ox: n.x, oy: n.y, pal: PAL[n.id], paso: 0, marca: '…' }));
  const m = new Mundo({ ancho: W, alto: H, edificios, decor, npcs, carteles });
  let s = 7;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (rnd() < 0.07) m.set(x, y, ',');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x - CX) ** 2 + ((y - CY) * 1.1) ** 2 <= R * R) m.set(x, y, '#');
  m.rect(8, 8, 1, 3, ':'); m.rect(8, 10, 5, 1, ':');
  m.rect(26, 8, 1, 3, ':'); m.rect(22, 10, 5, 1, ':');
  m.rect(6, 17, 10, 1, ':'); m.rect(19, 17, 10, 1, ':');
  m.rect(17, 18, 1, 4, ':');
  m.rect(1, 22, W - 2, 2, '~');
  m.calcularBloqueos();
  m.plaza = { x: CX * T + 8, y: Math.round(CY * T + 8), rx: Math.round(R * T), ry: Math.round(R * T / 1.1) };
  m.fuente = { x: CX, y: 12 };
  return m;
}

// El motor de Sandō con piloto automático: las flechas siempre mandan, y sin flechas sigue la ruta.
class Piloto extends Motor {
  ir(destino, alLlegar, mirar = 1) {
    this.destino = destino; this.alLlegar = alLlegar; this.mirar = mirar;
    const ruta = camino(this.m, this.j, destino);
    if (!ruta) return this.cancelar(); // no se puede llegar: no se abre nada a medio camino
    this.ruta = ruta;
    this.esperando = 0;
    if (!this.ruta.length && this.j.x === destino.x && this.j.y === destino.y) this.llegar();
  }
  cancelar() { this.ruta = []; this.alLlegar = null; this.destino = null; }
  // Con piloto automático Arky trota: el menú tiene que sentirse rápido.
  actualizar(dt, t) { super.actualizar(this.destino ? dt * 2.4 : dt, t); }
  llegar() {
    const f = this.alLlegar;
    this.cancelar();
    this.j.dir = this.mirar;
    if (f) f();
  }
  direccion() {
    const manual = super.direccion();
    if (manual >= 0) { if (this.destino) this.cancelar(); return manual; }
    if (!this.destino) return -1;
    const j = this.j;
    while (this.ruta?.length && this.ruta[0].x === j.x && this.ruta[0].y === j.y) this.ruta.shift();
    if (!this.ruta?.length) { this.llegar(); return -1; }
    const sig = this.ruta[0];
    if (!this.m.libre(sig.x, sig.y)) {
      // alguien se cruzó: esperar un toque y buscar otro camino que lo esquive
      if (++this.esperando > 20) { this.ruta = camino(this.m, j, this.destino, true) || this.ruta; this.esperando = 0; }
      return -1;
    }
    this.esperando = 0;
    return sig.y > j.y ? 0 : sig.y < j.y ? 1 : sig.x < j.x ? 2 : 3;
  }
}

// ---------- Interfaz ----------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function datosProyecto(nombre) {
  const p = porNombre[nombre];
  if (p) return { nombre, categoria: p[1], resumen: p[2], tags: p[3], icono: p[4], estado: p[6], trabajado: p[7], notas: p[8], demo: p[9], enlaces: PROYECTO_ENLACES[nombre] || [], visuales: VISUALES[nombre] || [] };
  const e = EXTRAS[nombre];
  return { nombre, categoria: 'Personal', resumen: e.resumen, tags: e.tags, icono: e.icono, estado: e.estado, trabajado: e.trabajado, notas: '', demo: null, enlaces: e.enlaces, visuales: e.visuales };
}

function htmlVisual(v, grande = false) {
  if (v.img) return `<img src="${esc(v.img)}" alt="${esc(v.cap)}" loading="lazy">`;
  if (v.video) return `<video src="${esc(v.video)}" muted loop playsinline ${grande ? 'autoplay controls' : ''} preload="metadata"></video>`;
  if (v.sprite) return '<div class="sprite-arky" role="img" aria-label="Arky caminando"><span></span></div>';
  if (v.caras) return '<div class="caras-arky" role="img" aria-label="Expresiones de Arky"></div>';
  if (v.flujo) return `<div class="flujo">${v.flujo.map((p, i) => `${i ? '<span class="flecha" aria-hidden="true">→</span>' : ''}<span class="paso">${esc(p)}</span>`).join('')}</div>`;
  if (v.grafico) {
    const max = Math.max(...v.grafico), min = Math.min(...v.grafico);
    const pts = v.grafico.map((n, i) => `${(i / (v.grafico.length - 1)) * 300},${90 - ((n - min) / (max - min)) * 70}`).join(' ');
    return `<svg class="grafico" viewBox="-10 0 320 110" role="img" aria-label="Gráfico ilustrativo"><polyline points="${pts}" fill="none" stroke="currentColor" stroke-width="3"/>${v.grafico.map((n, i) => `<circle cx="${(i / (v.grafico.length - 1)) * 300}" cy="${90 - ((n - min) / (max - min)) * 70}" r="4"/>`).join('')}<text x="0" y="108">ene</text><text x="270" y="108">ago</text></svg>`;
  }
  return '';
}

// Miniatura: las imágenes se achican; lo dibujado (esquemas, gráficos, sprites) se resume con un ícono.
function miniatura(v) {
  if (v.img) return htmlVisual(v);
  if (v.video) return '<span class="mini-txt">▶<small>Video</small></span>';
  if (v.flujo) return '<span class="mini-txt">⇢<small>Esquema</small></span>';
  if (v.grafico) return '<span class="mini-txt">📈<small>Gráfico</small></span>';
  return '<span class="mini-txt">🐉<small>Sprites</small></span>';
}

let motor, lugarAbierto = null, proyectoAbierto = 0;

function abrirLugar(id, indice = 0) {
  const l = LUGARES.find(x => x.id === id);
  if (!l) return id === 'plaza' ? abrirSobreMi() : null;
  lugarAbierto = l; proyectoAbierto = indice;
  motor.pausado = true; motor.expresar?.('feliz');
  sfx.puerta();
  const panel = $('#panel');
  const i = LUGARES.indexOf(l), siguiente = LUGARES[(i + 1) % LUGARES.length];
  panel.innerHTML = `
    <header class="panel-top">
      <button class="pbtn" data-cerrar aria-label="Salir al pueblo">✕ Salir</button>
      <div><h2><span class="kanji">${esc(l.kanji)}</span> ${esc(l.nombre)}</h2><p>${esc(l.linea)}</p></div>
      <button class="pbtn" data-ir="${siguiente.id}">Siguiente: ${esc(siguiente.icono)} ${esc(siguiente.nombre)} →</button>
    </header>
    <p class="intro">${esc(l.intro)}</p>
    <div class="cuerpo">
      <nav class="lista" aria-label="Proyectos de ${esc(l.nombre)}">${l.proyectos.map((n, k) => { const p = datosProyecto(n); return `<button class="item${k === indice ? ' activo' : ''}" data-p="${k}"><span class="ico">${esc(p.icono)}</span><span><b>${esc(n)}</b><small>${esc(p.estado)}</small></span></button>`; }).join('')}</nav>
      <article class="ficha" id="ficha" tabindex="-1"></article>
    </div>`;
  mostrarPanel();
  pintarFicha();
  panel.querySelector('[data-cerrar]').focus();
  history.replaceState(null, '', '#' + l.id);
}

function pintarFicha() {
  const l = lugarAbierto, p = datosProyecto(l.proyectos[proyectoAbierto]);
  document.querySelectorAll('#panel .item').forEach((b, k) => b.classList.toggle('activo', k === proyectoAbierto));
  const v = p.visuales;
  const enlaces = [
    ...p.enlaces.map(e => `<a class="pbtn${e.live ? ' vivo' : ''}" href="${esc(e.url)}" target="_blank" rel="noopener noreferrer">${esc(e.label)}</a>`),
    p.demo ? `<a class="pbtn vivo" href="../#demo=${esc(p.demo)}" target="_blank" rel="noopener">Probar en el laboratorio ↗</a>` : '',
  ].join('');
  $('#ficha').innerHTML = `
    <div class="ficha-top"><span class="ico grande">${esc(p.icono)}</span><div><h3>${esc(p.nombre)}</h3><p class="chips"><span>${esc(p.categoria)}</span><span>${esc(p.estado)}</span></p></div></div>
    <p class="resumen">${esc(p.resumen)}</p>
    ${v.length ? `<figure class="galeria"><div class="principal" data-zoom="0">${htmlVisual(v[0], true)}</div><figcaption>${esc(v[0].cap)}</figcaption>
      ${v.length > 1 ? `<div class="miniaturas">${v.map((x, k) => `<button class="mini${k ? '' : ' activo'}" data-v="${k}" aria-label="Ver ejemplo ${k + 1}: ${esc(x.cap)}">${miniatura(x)}</button>`).join('')}</div>` : ''}</figure>` : ''}
    <h4>Qué se trabajó</h4><p>${esc(p.trabajado)}</p>
    <h4>Stack y conceptos</h4><p class="tags">${p.tags.split(',').map(t => `<span>${esc(t)}</span>`).join('')}</p>
    ${p.notas ? `<h4>A tener en cuenta</h4><p>${esc(p.notas)}</p>` : ''}
    ${enlaces ? `<div class="enlaces">${enlaces}</div>` : ''}`;
  $('#ficha').scrollTop = 0;
}

function cambiarVisual(k) {
  const v = datosProyecto(lugarAbierto.proyectos[proyectoAbierto]).visuales[k];
  const fig = $('#ficha .galeria');
  fig.querySelector('.principal').innerHTML = htmlVisual(v, true);
  fig.querySelector('.principal').dataset.zoom = k;
  fig.querySelector('figcaption').textContent = v.cap;
  fig.querySelectorAll('.mini').forEach((b, i) => b.classList.toggle('activo', i === k));
}

function abrirSobreMi() {
  lugarAbierto = null;
  motor.pausado = true; sfx.aceptar();
  const panel = $('#panel');
  panel.innerHTML = `
    <header class="panel-top"><button class="pbtn" data-cerrar aria-label="Salir al pueblo">✕ Salir</button><div><h2><span class="kanji">⛲</span> Sobre mí</h2><p>Lautaro Florenza · Rosario, Argentina</p></div><a class="pbtn" href="../">Versión clásica ↗</a></header>
    <div class="sobre">
      <img src="${IMG}arky-saludo.webp" alt="Arky saludando" class="arky-saludo">
      <div>
        <p class="resumen">Soy desarrollador Full-Stack en Wiener Lab y estudiante de Inteligencia Artificial en la UNR. Me gusta transformar ideas en herramientas, experiencias y cosas que antes no existían.</p>
        <p>En 2024 viví un año en Japón con una visa Working Holiday: Tokio, Yokohama, Okinawa y Hokkaido, y trabajé de Night Auditor en Niseko. Sandō, el juego de este pueblo, es mi forma de seguir practicando japonés.</p>
        <p>Español nativo, inglés avanzado y japonés en curso. Fuera del código: café, videojuegos, D&amp;D, música, fotografía y snowboard.</p>
        <div class="datos">${LUGARES.map(l => `<button class="dato" data-ir="${l.id}"><b>${esc(l.icono)} ${l.proyectos.length}</b><span>${esc(l.nombre)}</span></button>`).join('')}</div>
        <div class="enlaces"><a class="pbtn vivo" href="https://github.com/Lauaf" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a class="pbtn" href="../#proyectos">Catálogo clásico ↗</a><a class="pbtn" href="../#laboratorio">Laboratorio de demos ↗</a></div>
      </div>
    </div>`;
  mostrarPanel();
  panel.querySelector('[data-cerrar]').focus();
  history.replaceState(null, '', '#sobre-mi');
}

function mostrarPanel() {
  $('#panel').classList.remove('oculto');
  $('#cartel').classList.add('oculto');
  $('.pantalla').classList.add('con-panel');
}

function cerrarPanel() {
  const panel = $('#panel');
  if (panel.classList.contains('oculto')) return;
  panel.classList.add('oculto');
  panel.innerHTML = '';
  $('.pantalla').classList.remove('con-panel');
  motor.pausado = false; lugarAbierto = null;
  history.replaceState(null, '', location.pathname);
  $('#lienzo').focus();
}

// Ir a un lugar: Arky camina hasta la puerta (o la fuente) y abre el panel al llegar.
function irA(id, indice = 0) {
  cerrarPanel(); cerrarCharla();
  if (id === 'plaza') {
    motor.ir({ x: motor.m.fuente.x, y: motor.m.fuente.y + 2 }, () => abrirSobreMi(), 1);
  } else {
    const l = LUGARES.find(x => x.id === id);
    motor.ir({ x: l.puerta.x, y: l.puerta.y + 1 }, () => abrirLugar(id, indice), 1);
  }
  marcarMenu(id);
  avisar(id === 'plaza' ? 'Arky va a la fuente…' : `Arky va a ${LUGARES.find(x => x.id === id).nombre}…`);
}

function marcarMenu(id) {
  document.querySelectorAll('#menu [data-ir]').forEach(b => b.classList.toggle('activo', b.dataset.ir === id));
}

let avisoTimer;
function avisar(txt) {
  const a = $('#aviso');
  a.textContent = txt; a.classList.remove('oculto');
  clearTimeout(avisoTimer); avisoTimer = setTimeout(() => a.classList.add('oculto'), 2400);
}

function charlar(id) {
  const c = CHARLAS[id];
  motor.pausado = true;
  const caja = $('#charla');
  let k = 0;
  const pintar = () => {
    const ultima = k === c.lineas.length - 1;
    const destino = c.ir === 'plaza' ? PLAZA : LUGARES.find(l => l.id === c.ir);
    caja.innerHTML = `<b>${esc(c.nombre)}</b><p>${esc(c.lineas[k])}</p><div class="acciones">${ultima ? `<button class="pbtn vivo" data-ir="${c.ir}">${esc(destino.icono)} Ir a ${esc(destino.nombre)}</button><button class="pbtn" data-cerrar-charla>Seguir paseando</button>` : '<button class="pbtn" data-seguir>▼ Seguir</button>'}</div>`;
    caja.querySelector('button').focus();
  };
  caja.onclick = e => { if (e.target.closest('[data-seguir]')) { k++; pintar(); } };
  caja.classList.remove('oculto');
  pintar();
}
function cerrarCharla() {
  const caja = $('#charla');
  if (caja.classList.contains('oculto')) return;
  caja.classList.add('oculto'); caja.innerHTML = '';
  if ($('#panel').classList.contains('oculto')) motor.pausado = false;
}

// Al caminar contra algo (o con Enter): puertas, personas, la fuente y el tablón.
function interactuar(x, y) {
  const m = motor.m;
  const l = LUGARES.find(e => e.puerta.x === x && e.puerta.y === y);
  if (l) return abrirLugar(l.id);
  const n = m.npcs.find(p => p.x === x && p.y === y);
  if (n) { n.dir = [1, 0, 3, 2][motor.j.dir]; return charlar(n.id); }
  if (m.carteles.some(c => c.x === x && c.y === y)) return charlarTablon();
  if (m.decor.some(d => (d.tipo === 'fuenteGrande' || d.tipo === 'fuente-parte') && d.x === x && d.y === y)) return abrirSobreMi();
}
function charlarTablon() {
  CHARLAS.tablon = { nombre: '掲示板 Tablón', lineas: ['¿Preferís la versión clásica? El portfolio tradicional tiene el catálogo completo con filtros.'], ir: 'plaza' };
  const caja = $('#charla');
  motor.pausado = true;
  caja.innerHTML = `<b>掲示板 Tablón</b><p>${esc(CHARLAS.tablon.lineas[0])}</p><div class="acciones"><a class="pbtn vivo" href="../">Ir a la versión clásica ↗</a><button class="pbtn" data-cerrar-charla>Seguir paseando</button></div>`;
  caja.classList.remove('oculto');
  caja.querySelector('a').focus();
}

// Lugar más cercano a Arky, para el cartel de abajo.
function cercano() {
  const j = motor.j;
  let mejor = null, dist = 4;
  for (const l of LUGARES) {
    const dd = Math.abs(l.puerta.x - j.x) + Math.abs(l.puerta.y + 1 - j.y);
    if (dd < dist) { dist = dd; mejor = l; }
  }
  const f = motor.m.fuente;
  if (!mejor && Math.abs(f.x - j.x) + Math.abs(f.y - j.y) < 4) mejor = PLAZA;
  return mejor;
}

// Etiquetas sobre los edificios: siguen a la cámara del motor y se esconden fuera de cuadro.
function etiquetas() {
  const cont = $('#etiquetas');
  cont.innerHTML = LUGARES.map(l => `<button class="etiqueta" data-ir="${l.id}" tabindex="-1">${esc(l.icono)} ${esc(l.nombre)}</button>`).join('');
  const els = [...cont.children];
  const mover = () => {
    const cam = motor.cam, ancho = cont.clientWidth;
    if (cam && ancho) {
      const k = ancho / 240; // px de pantalla por píxel del juego
      LUGARES.forEach((l, i) => {
        // sobre la puerta: es lo que siempre queda a la vista y donde Arky entra
        // si la puerta quedó fuera de cuadro pero se ve parte del edificio, la etiqueta va sobre esa parte
        const b0 = Math.max((l.x * T - cam.ox) * k, 80), b1 = Math.min(((l.x + l.w) * T - cam.ox) * k, ancho - 80);
        const x = Math.max(b0, Math.min(b1, (l.puerta.x * T + 8 - cam.ox) * k)), y = (l.puerta.y * T - 4 - cam.oy) * k;
        const dentro = b1 - b0 > 0 && y > 30 && y < cont.clientHeight - 10;
        els[i].style.left = `${x}px`;
        els[i].style.top = `${y}px`;
        els[i].style.display = dentro && $('#panel').classList.contains('oculto') ? '' : 'none';
      });
    }
    requestAnimationFrame(mover);
  };
  mover();
}

// Mini mapa: el pueblo entero, los edificios y dónde está Arky. Tocarlo también lleva.
function miniMapa() {
  const c = $('#minimapa'), m = motor.m, k = 4;
  c.width = m.w * k; c.height = m.h * k;
  const g = c.getContext('2d');
  const colores = { musica: '#4a6ad0', casa: '#3a9a88', cafe: '#a8603a', dojo: '#d0402e', cine: '#7a3aa8' };
  const dibujar = () => {
    g.fillStyle = '#5fa04a'; g.fillRect(0, 0, c.width, c.height);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const t = m.tiles[y][x];
      if (t === '~') g.fillStyle = '#4aa6d8'; else if (t === '#') g.fillStyle = '#c9c2b0'; else if (t === ':') g.fillStyle = '#d8c08a'; else continue;
      g.fillRect(x * k, y * k, k, k);
    }
    for (const l of LUGARES) { g.fillStyle = colores[l.estilo]; g.fillRect(l.x * k, l.y * k, l.w * k, l.h * k); }
    g.fillStyle = '#9fd8f0'; g.fillRect((m.fuente.x - 1) * k, m.fuente.y * k, 3 * k, 2 * k);
    const j = motor.j;
    g.fillStyle = '#fff8ec'; g.fillRect(j.px / T * k - 1, j.py / T * k - 1, k + 2, k + 2);
    g.fillStyle = '#2f9a4a'; g.fillRect(j.px / T * k, j.py / T * k, k, k);
    requestAnimationFrame(dibujar);
  };
  dibujar();
  c.onclick = e => {
    const r = c.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * m.w), y = Math.floor((e.clientY - r.top) / r.height * m.h);
    tocarCasilla(x, y);
  };
}

// Tocar el pueblo: un edificio lleva a su puerta, una persona a charlar, el resto camina hasta ahí.
function tocarCasilla(x, y) {
  const m = motor.m;
  const l = LUGARES.find(e => x >= e.x && x < e.x + e.w && y >= e.y && y < e.y + e.h);
  if (l) return irA(l.id);
  if (Math.abs(x - m.fuente.x) <= 1 && (y === m.fuente.y || y === m.fuente.y + 1)) return irA('plaza');
  const n = m.npcs.find(p => p.x === x && p.y === y);
  if (n) {
    const vecinos = [[0, 1, 1], [0, -1, 0], [1, 0, 2], [-1, 0, 3]].map(([dx, dy, dir]) => ({ x: n.x + dx, y: n.y + dy, dir })).filter(p => m.libre(p.x, p.y));
    const p = vecinos[0];
    if (p) return motor.ir({ x: p.x, y: p.y }, () => charlar(n.id), p.dir);
  }
  if (x >= 0 && y >= 0 && x < m.w && y < m.h && !m.bloqueado[y][x]) motor.ir({ x, y }, null, motor.j.dir);
}

function iniciar() {
  sonido.activo = false; // un portfolio no debería sonar sin que lo pidan
  const m = crearPueblo();
  motor = new Piloto($('#lienzo'), m, { x: 17, y: 9, dir: 0, pal: { arky: true } });
  motor.hora = 11;
  motor.onInteractuar = (x, y) => interactuar(x, y);
  motor.onPisar = () => {
    const l = cercano();
    $('#cartel').textContent = l ? `${l.icono} ${l.nombre} · Enter para entrar` : '';
    $('#cartel').classList.toggle('oculto', !l);
  };

  // Menú principal
  $('#lugares').innerHTML = [...LUGARES, PLAZA].map((l, i) => `
    <button class="lugar" data-ir="${l.id}">
      <span class="ico">${esc(l.icono)}</span>
      <span class="txt"><b>${esc(l.nombre)}</b><small>${esc(l.linea)}</small></span>
      <span class="num">${l.proyectos ? `${l.proyectos.length}` : ''}<kbd>${i + 1}</kbd></span>
    </button>`).join('');
  miniMapa();
  etiquetas();

  document.addEventListener('click', e => {
    const ir = e.target.closest('[data-ir]');
    if (ir) { e.preventDefault(); return irA(ir.dataset.ir); }
    if (e.target.closest('[data-cerrar]')) return cerrarPanel();
    if (e.target.closest('[data-cerrar-charla]')) return cerrarCharla();
    const item = e.target.closest('#panel .item');
    if (item) { proyectoAbierto = +item.dataset.p; return pintarFicha(); }
    const mini = e.target.closest('#panel .mini');
    if (mini) return cambiarVisual(+mini.dataset.v);
    const zoom = e.target.closest('#panel .principal');
    if (zoom && zoom.querySelector('img')) return ampliar(zoom.querySelector('img'));
    if (e.target.closest('[data-saltar]')) { $('#bienvenida').classList.add('oculto'); motor.pausado = false; return $('#lugares button').focus(); }
    if (e.target.closest('#bienvenida [data-empezar]')) { $('#bienvenida').classList.add('oculto'); motor.pausado = false; $('#lugares button').focus(); }
    if (e.target.closest('[data-recorrido]')) { $('#bienvenida').classList.add('oculto'); motor.pausado = false; irA(LUGARES[0].id); }
  });
  $('#lienzo').addEventListener('click', e => {
    if (motor.pausado) return;
    const r = e.currentTarget.getBoundingClientRect(), esc2 = 240 / r.width;
    const px = (e.clientX - r.left) * esc2 + motor.cam.ox, py = (e.clientY - r.top) * esc2 + motor.cam.oy;
    tocarCasilla(Math.floor(px / T), Math.floor(py / T));
  });
  $('#zoom').addEventListener('click', () => $('#zoom').close());
  $('#sonido').onclick = e => { sonido.activo = !sonido.activo; e.currentTarget.textContent = sonido.activo ? '🔊' : '🔇'; e.currentTarget.setAttribute('aria-pressed', sonido.activo); };
  $('#noche').onclick = e => { motor.hora = motor.hora === 11 ? 21 : 11; e.currentTarget.textContent = motor.hora === 11 ? '☀️' : '🌙'; };

  addEventListener('keydown', e => {
    if (e.target.matches('input, textarea, select')) return;
    const panelAbierto = !$('#panel').classList.contains('oculto'), charlaAbierta = !$('#charla').classList.contains('oculto');
    if (e.key === 'Escape') { if ($('#zoom').open) return; if (charlaAbierta) return cerrarCharla(); if (panelAbierto) return cerrarPanel(); }
    if (panelAbierto) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!e.target.closest('.lista')) return;
        e.preventDefault();
        const n = lugarAbierto.proyectos.length;
        proyectoAbierto = (proyectoAbierto + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
        pintarFicha(); document.querySelectorAll('#panel .item')[proyectoAbierto].focus();
      }
      return;
    }
    if (charlaAbierta || !$('#bienvenida').classList.contains('oculto')) return;
    if (/^[1-6]$/.test(e.key)) { e.preventDefault(); return irA([...LUGARES, PLAZA][+e.key - 1].id); }
    if ((e.key === 'Enter' || e.key === ' ' || e.key.toLowerCase() === 'z') && (e.target === document.body || e.target.id === 'lienzo')) { e.preventDefault(); motor.interactuar(); }
    if (/^Arrow/.test(e.key) && (e.target === document.body || e.target.id === 'lienzo')) e.preventDefault();
  });

  // Un enlace directo a un lugar (pueblo/#arky) lo abre al llegar.
  const hash = location.hash.slice(1);
  if (hash === 'sobre-mi') { $('#bienvenida').classList.add('oculto'); irA('plaza'); }
  else if (LUGARES.some(l => l.id === hash)) { $('#bienvenida').classList.add('oculto'); irA(hash); }
  else motor.pausado = true;
}

function ampliar(imagen) {
  const d = $('#zoom');
  d.innerHTML = `<img src="${esc(imagen.src)}" alt="${esc(imagen.alt)}"><p>${esc(imagen.alt)} · tocá para cerrar</p>`;
  d.showModal();
}

if (typeof document !== 'undefined' && document.getElementById('lienzo')) {
  document.fonts?.load?.('16px DotGothic16').finally?.(iniciar) ?? iniciar();
}
