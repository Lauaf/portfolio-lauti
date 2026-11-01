// Arranque: carga la partida, arma el pueblo, enruta el teclado y chequea la IA.
import { $, el, sonido, audio, sfx } from './util.js';
import { cargar, P, pintarHUD, guardar, sincronizar } from './progreso.js';
import { Motor } from './motor.js';
import { crearMundo, interacciones, JUGADOR_INICIO, bienvenida, mostrarLugar, irA } from './mundo.js';
import { dialogo } from './dialogo.js';
import { actividad } from './actividad.js';
import { revisarIA } from './ia.js';
import { fichaInicial } from './casa.js';

function ajustarTamano() {
  const disponibleAlto = innerHeight - 34 - 26 - 30;
  const disponibleAncho = innerWidth - 40;
  let escala = Math.min(disponibleAncho / 240, disponibleAlto / 160);
  if (Math.floor(escala) >= 3 && Math.floor(escala) / escala > 0.86) escala = Math.floor(escala);
  escala = Math.max(1.5, escala);
  const r = document.documentElement.style;
  r.setProperty('--ancho', `${Math.round(240 * escala)}px`);
  r.setProperty('--alto', `${Math.round(160 * escala)}px`);
  r.setProperty('--px', `${escala}px`);
}

// ---------- Menú rápido: todos los lugares a un toque (M / Esc / ☰, o los números 1-6) ----------
const LUGARES = [
  { id: 'dojo', ico: '道', nombre: 'Dojo', desc: 'japonés' },
  { id: 'cine', ico: '映', nombre: 'Cine', desc: 'videos' },
  { id: 'musica', ico: '♪', nombre: 'Música', desc: 'piano' },
  { id: 'cafe', ico: '☕', nombre: 'Café', desc: 'barista' },
  { id: 'casa', ico: '家', nombre: 'Casa', desc: 'progreso' },
  { id: 'tablon', ico: '✅', nombre: 'Misiones', desc: 'del día' },
];
const menu = { abierto: false, sel: 0 };
const MAPA = 2; // versión del mapa del pueblo

function abrirMenu() {
  if (menu.abierto) return cerrarMenu();
  menu.abierto = true;
  sfx.cursor();
  const caja = $('#menu-rapido');
  const pintar = () => caja.querySelectorAll('.lugar').forEach((b, i) => b.classList.toggle('sel', i === menu.sel));
  caja.replaceChildren(
    el('div.menu-titulo', '¿Adónde vamos?', el('small', 'números 1-6 · flechas + Enter · Esc cierra')),
    el('div.menu-lugares', LUGARES.map((l, i) => el('button.lugar', {
      onclick: () => elegir(i), onmouseenter: () => { menu.sel = i; pintar(); },
    }, el('span.lugar-num', i + 1), el('span.lugar-ico', l.ico), el('span.lugar-nombre', l.nombre), el('span.lugar-desc', l.desc)))),
    el('div.menu-extra',
      el('button.btn.chico', { onclick: e => {
        sonido.activo = P.opciones.sonido = !P.opciones.sonido; guardar();
        e.currentTarget.textContent = P.opciones.sonido ? '🔊 Sonido: sí' : '🔇 Sonido: no';
      } }, P.opciones.sonido ? '🔊 Sonido: sí' : '🔇 Sonido: no'),
      el('button.btn.chico', { onclick: () => revisarIA() }, '🔄 Revisar IA'),
      el('button.btn.chico', { onclick: cerrarMenu }, '✕ Cerrar')));
  pintar();
  caja.classList.remove('oculto');
}

function cerrarMenu() {
  menu.abierto = false;
  $('#menu-rapido').classList.add('oculto');
}

function elegir(i) {
  cerrarMenu();
  sfx.aceptar();
  irA(LUGARES[i].id);
}

function teclaMenu(e) {
  const n = +e.key;
  if (n >= 1 && n <= LUGARES.length) return elegir(n - 1);
  const mover = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 3, ArrowUp: -3, KeyD: 1, KeyA: -1, KeyS: 3, KeyW: -3 }[e.code];
  if (mover) {
    menu.sel = (menu.sel + mover + LUGARES.length) % LUGARES.length;
    sfx.cursor();
    $('#menu-rapido').querySelectorAll('.lugar').forEach((b, i) => b.classList.toggle('sel', i === menu.sel));
  } else if (['Enter', ' ', 'z', 'Z'].includes(e.key)) elegir(menu.sel);
  else if (['Escape', 'm', 'M', 'x', 'X'].includes(e.key)) cerrarMenu();
}

async function iniciar() {
  ajustarTamano();
  addEventListener('resize', ajustarTamano);
  await cargar();
  sonido.activo = P.opciones.sonido !== false;
  pintarHUD();

  const mundo = crearMundo();
  // la posición guardada solo vale si es del mismo mapa (el pueblo cambió de forma en la versión 2)
  const inicio = P.pos?.mapa === MAPA && mundo.libre(P.pos.x, P.pos.y) ? { ...JUGADOR_INICIO, ...P.pos } : JUGADOR_INICIO;
  const motor = new Motor($('#lienzo'), mundo, inicio);
  Object.defineProperty(motor, 'pausado', { get: () => dialogo.activo || actividad.abierta || menu.abierto });
  interacciones(motor);
  motor.onPisar = (x, y) => { P.pos = { x, y, dir: motor.j.dir, mapa: MAPA }; guardar(); };
  window.sando = { P, motor }; // para depurar desde la consola

  addEventListener('keydown', e => {
    audio(); // el navegador exige un gesto para habilitar el audio
    if (dialogo.activo || actividad.abierta) return;
    if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) return;
    if (menu.abierto) { e.preventDefault(); return teclaMenu(e); }
    const n = +e.key;
    if (n >= 1 && n <= LUGARES.length) { e.preventDefault(); return elegir(n - 1); }
    if (['z', 'Z', 'Enter', ' '].includes(e.key)) { e.preventDefault(); motor.interactuar(); }
    else if (['m', 'M', 'Escape'].includes(e.key)) { e.preventDefault(); abrirMenu(); }
  });
  addEventListener('pointerdown', () => audio(), { once: true });
  $('#btn-menu').addEventListener('click', e => { e.stopPropagation(); if (!dialogo.activo && !actividad.abierta) abrirMenu(); });
  // clic en el lienzo = interactuar (para jugar con mouse)
  $('#lienzo').addEventListener('click', () => { if (!dialogo.activo && !actividad.abierta) motor.interactuar(); });

  // otra ventana pudo haber jugado mientras esta estaba en segundo plano
  const alVolver = () => { if (!document.hidden && !actividad.abierta && !dialogo.activo) sincronizar(); };
  document.addEventListener('visibilitychange', alVolver);
  addEventListener('focus', alVolver);

  revisarIA();
  setInterval(revisarIA, 30000);
  setInterval(pintarHUD, 60000);

  mostrarLugar('三道 Sando');
  if (!P.presentado) {
    await bienvenida();
    fichaInicial(() => {
      if (!P.presentado) { P.presentado = true; P.jp.nivel ??= 'cero'; guardar(); }
      pintarHUD();
    });
  }
}

iniciar();
