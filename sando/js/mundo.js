// El pueblo de Sando: mapa, vecinos, puertas y qué pasa al interactuar.
import { Mundo, T } from './motor.js';
import { el, elegir, sfx, $ } from './util.js';
import { P, misionesDeHoy, rachaViva, SKILLS, guardar } from './progreso.js';
import { decir, cerrar as cerrarDialogo, charla } from './dialogo.js';
import { parsear } from './jp/texto.js';
import { abrirDojo, charlarVecino } from './japones.js';
import { abrirSalaMusica } from './piano.js';
import { abrirCafeteria } from './cafe.js';
import { abrirCasa } from './casa.js';
import { abrirCine } from './cine.js';
import { VECINOS } from './datos/frases.js';

const PAL = {
  jugador: { arky: true }, // Arky, el dragoncito (sprites en arky.js)
  obaasan: { piel: '#f0c8a0', pelo: '#d9d2c8', ropa: '#8e6fb5', pantalon: '#5a3a8e', estilo: 'rodete' },
  kenta: { piel: '#f3c9a0', pelo: '#2b2233', ropa: '#f2c14e', pantalon: '#3b5ba5', estilo: 'gorra', gorra: '#4a90d9' },
  yubin: { piel: '#e8b890', pelo: '#2b2233', ropa: '#4a63b8', ropa2: '#2d3a6b', pantalon: '#2d3a6b', estilo: 'gorra', gorra: '#2d3a6b' },
  tsuri: { piel: '#d9a57a', pelo: '#5a4a3a', ropa: '#6b8e4e', pantalon: '#4a3a2a', estilo: 'barba', gorra: '#c9a974' },
  yuki: { piel: '#f6d2b0', pelo: '#4a2c1a', ropa: '#f4a6b8', pantalon: '#6d5a86', estilo: 'largo' },
  hana: { piel: '#f6d2b0', pelo: '#1a1424', ropa: '#f6eedb', ropa2: '#2d3a6b', pantalon: '#2d3a6b', estilo: 'largo' },
  mio: { piel: '#f6d2b0', pelo: '#7a3a2a', ropa: '#a8203a', ropa2: '#f2c14e', pantalon: '#2e1a3a', estilo: 'rodete' },
};

/**
 * Pueblo compacto: una plaza circular con la fuente en el centro y todo alrededor, a pocos pasos.
 * Arriba: dojo, cine y sala de música; a los costados: café y casa; abajo, el arroyo.
 */
export function crearMundo() {
  const W = 35, H = 26;
  const CX = 17, CY = 12.5, R = 5.5; // centro y radio de la plaza
  const edificios = [
    { id: 'dojo', estilo: 'dojo', x: 4, y: 2, w: 8, h: 6, puerta: { x: 8, y: 7 }, cartel: '道場' },
    { id: 'cine', estilo: 'cine', x: 13, y: 1, w: 9, h: 7, puerta: { x: 17, y: 7 }, cartel: '映画館' },
    { id: 'musica', estilo: 'musica', x: 23, y: 2, w: 8, h: 6, puerta: { x: 26, y: 7 }, cartel: '音楽堂' },
    { id: 'cafe', estilo: 'cafe', x: 2, y: 12, w: 8, h: 5, puerta: { x: 6, y: 16 }, cartel: '喫茶店' },
    { id: 'casa', estilo: 'casa', x: 26, y: 12, w: 7, h: 5, puerta: { x: 28, y: 16 }, cartel: '家' },
  ];
  const decor = [];
  const d = (tipo, x, y, extra = {}) => decor.push({ tipo, x, y, ...extra });
  for (let y = 1; y < H - 1; y++) { d(y % 5 === 2 ? 'sakura' : 'arbol', 0, y); d(y % 5 === 4 ? 'sakura' : 'arbol', W - 1, y); }
  for (let x = 0; x < W; x++) { d(x % 5 === 2 ? 'sakura' : 'arbol', x, 0); d(x % 6 === 3 ? 'sakura' : 'arbol', x, H - 1); }
  // la fuente grande en el centro (las 'fuente-parte' solo bloquean y responden al hablar)
  d('fuenteGrande', CX, 12);
  for (const [x, y] of [[CX - 1, 12], [CX + 1, 12], [CX - 1, 13], [CX, 13], [CX + 1, 13]]) d('fuente-parte', x, y);
  // anillo de cerezos y faroles alrededor de la plaza
  [[12, 6], [22, 6], [11, 11], [23, 11], [11, 18], [23, 18], [14, 20], [20, 20]].forEach(([x, y]) => d('sakura', x, y));
  [[3, 9], [31, 9], [2, 19], [32, 19], [8, 21], [26, 21]].forEach(([x, y], i) => d(i % 2 ? 'arbol' : 'sakura', x, y));
  [[14, 8], [20, 8], [12, 10], [22, 10], [13, 16], [21, 16], [16, 20], [18, 20]].forEach(([x, y]) => d('farol', x, y));
  [[1, 8], [33, 8], [10, 8], [24, 8], [1, 17], [33, 17], [5, 20], [29, 20], [11, 21], [23, 21]].forEach(([x, y]) => d('arbusto', x, y));
  for (let x = 2; x < W - 2; x += 3) d('arbusto', x, 24);
  d('torii', 8, 9, { bloquea: false }); d('nada', 7, 9); d('nada', 9, 9);
  d('banco', 14, 15); d('banco', 20, 15);
  d('buzon', 30, 17);
  d('macetas', 15, 7); d('macetas', 19, 7); d('macetas', 3, 17); d('macetas', 9, 17); d('macetas', 25, 17); d('macetas', 31, 17);
  d('roca', 4, 21); d('roca', 30, 21); d('roca', 12, 3);
  const carteles = [{ id: 'tablon', x: 13, y: 9 }];
  const npcs = [
    { id: 'obaasan', x: 15, y: 10, dir: 0, radio: 1 },
    { id: 'kenta', x: 19, y: 15, dir: 2, radio: 2 },
    { id: 'yubin', x: 29, y: 18, dir: 0, radio: 1 },
    { id: 'tsuri', x: 17, y: 21, dir: 0, radio: 0 },
    { id: 'yuki', x: 7, y: 18, dir: 0, radio: 1 },
    { id: 'hana', x: 25, y: 9, dir: 0, radio: 1 },
    { id: 'mio', x: 19, y: 9, dir: 0, radio: 1 },
  ].map(n => ({ ...n, ox: n.x, oy: n.y, pal: PAL[n.id], paso: 0, marca: '…' }));

  const m = new Mundo({ ancho: W, alto: H, edificios, decor, npcs, carteles });
  // pasto con flores
  let s = 7;
  const rnd = () => ((s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (rnd() < 0.07) m.set(x, y, ',');
  // plaza circular empedrada
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if ((x - CX) ** 2 + ((y - CY) * 1.1) ** 2 <= R * R) m.set(x, y, '#');
  }
  // senderos cortos de cada puerta a la plaza
  m.rect(8, 8, 1, 3, ':'); m.rect(8, 10, 5, 1, ':');     // dojo (pasa bajo el torii)
  m.rect(26, 8, 1, 3, ':'); m.rect(22, 10, 5, 1, ':');   // música
  m.rect(6, 17, 10, 1, ':');                             // café
  m.rect(19, 17, 10, 1, ':');                            // casa
  m.rect(17, 18, 1, 4, ':');                             // al arroyo
  m.rect(1, 22, W - 2, 2, '~');                          // arroyo
  m.calcularBloqueos();
  m.plaza = { x: CX * T + 8, y: Math.round(CY * T + 8), rx: Math.round(R * T), ry: Math.round(R * T / 1.1) }; // se dibuja redonda
  return m;
}

export const JUGADOR_INICIO = { x: 28, y: 17, dir: 0, pal: PAL.jugador };

const REFRANES = [
  { m: '[継続|けいぞく|continuidad][は|わ|(tema)][力|ちから|fuerza][なり|es]', es: '"La constancia es poder." Diez minutos por día le ganan a una maratón por mes.' },
  { m: '[七転び八起き|ななころびやおき|caer siete veces, levantarse ocho]', es: '"Caerse siete veces, levantarse ocho."' },
  { m: '[塵|ちり|polvo][も|también][積もれば|つもれば|si se acumula][山|やま|montaña][となる|se vuelve]', es: '"Hasta el polvo, acumulado, se vuelve montaña."' },
  { m: '[習うより慣れろ|ならうよりなれろ|acostumbrate en vez de estudiar]', es: '"Más que estudiar, practicá hasta que te salga solo."' },
];

const CONSEJOS = [
  'Haru-sensei dice: repasá kana 5 minutos apenas te levantás; tu cerebro las fija durmiendo.',
  'Rin dice: tocá lento y bien antes que rápido y mal. El metrónomo es tu amigo.',
  'Kenji dice: cambiá una sola variable por vez cuando calibres tu café.',
  'Rin dice: mirá las teclas lo menos posible. Sentí las negras: dos y tres.',
  'Kenji dice: el café recién molido cambia todo. Moler justo antes, siempre.',
  'Haru-sensei dice: decí las frases en voz alta. Hablar es un músculo.',
  'Rin dice: las manos separadas primero, juntas después. Siempre.',
  'Kenji dice: pesá el café y el agua. Una cuchara puede variar ±30 %.',
];

/** Conecta el mundo con los menús del juego. */
export function interacciones(motor) {
  const m = motor.m;
  motor.onInteractuar = async (x, y, caminando = false) => {
    const ed = m.edificios.find(e => e.puerta.x === x && e.puerta.y === y);
    if (ed) return entrar(ed.id);
    if (caminando) return;
    const npc = m.npcs.find(n => n.x === x && n.y === y && !n.mov);
    if (npc) {
      npc.dir = [1, 0, 3, 2][motor.j.dir];
      npc.hablando = true;
      npc.marca = null;
      await charlarVecino(npc.id);
      npc.hablando = false;
      return;
    }
    const cart = m.carteles.find(c => c.x === x && c.y === y);
    if (cart) return tablon();
    const dec = m.decor.find(d => d.x === x && d.y === y);
    if (dec?.tipo === 'buzon') return buzon();
    if (dec?.tipo.startsWith('fuente')) return fuente();
    if (m.tiles[y]?.[x] === '~') return charla('', ['El río corre tranquilo. Se ven peces naranjas.']);
  };
}

/** Entra directo a un lugar (lo usa también el menú rápido). id: dojo|musica|cafe|cine|casa|tablon */
export function irA(id) {
  return id === 'tablon' ? tablon() : entrar(id);
}

async function entrar(id) {
  sfx.puerta();
  if (id === 'dojo') {
    if (!P.jp.nivel) {
      await decir({ nombre: 'ハル先生 Haru-sensei', toks: parsear('[ようこそ|bienvenido]！[道場|どうじょう|dojo][へ|え|a]。'), trad: '¡Bienvenido al dojo!', romaji: true });
      const nv = await decir({ nombre: 'ハル先生 Haru-sensei', texto: '¿Cuánto japonés sabés?', opciones: [{ txt: 'Nada, arranco de cero', valor: 'cero' }, { txt: 'Leo hiragana y katakana', valor: 'kana' }, { txt: 'N5', valor: 'n5' }, { txt: 'N4', valor: 'n4' }, { txt: 'N3', valor: 'n3' }] });
      P.jp.nivel = nv; P.jp.romaji = nv === 'cero'; guardar();
      cerrarDialogo();
    }
    return abrirDojo();
  }
  if (id === 'musica') return abrirSalaMusica();
  if (id === 'cafe') return abrirCafeteria();
  if (id === 'casa') return abrirCasa();
  if (id === 'cine') return abrirCine();
}

async function tablon() {
  const ms = misionesDeHoy();
  await decir({ nombre: '掲示板 Tablón', texto: `Misiones de hoy (🔥 racha: ${rachaViva()} días)` });
  for (const mi of ms) await decir({ nombre: '掲示板 Tablón', texto: `${mi.hecha ? '✅' : SKILLS[mi.skill].ico} ${mi.texto} — ${mi.prog}/${mi.meta}` });
  cerrarDialogo();
}

async function buzon() {
  await charla('📮 Buzón', ['Hay una carta para vos…', elegir(CONSEJOS)]);
}

async function fuente() {
  const r = elegir(REFRANES);
  await decir({ texto: 'Tirás una moneda de 5 yenes (ご縁, "buena conexión") a la fuente. En el fondo hay algo grabado:' });
  await decir({ toks: parsear(r.m), trad: r.es, romaji: true });
  cerrarDialogo();
}

export async function bienvenida() {
  await decir({ nombre: 'おばあさん', toks: parsear('[ようこそ|bienvenido]、[三道|さんどう|Sando: tres caminos][へ|え|a]！'), trad: '¡Bienvenido a Sando!', romaji: true });
  await decir({ nombre: 'おばあさん', texto: 'Este pueblo tiene tres caminos y todos salen de esta plaza. Arriba a la izquierda, el dojo de Haru-sensei: japonés. Arriba al medio, el cine: japonés con videos de verdad. Arriba a la derecha, la sala de música de Rin: piano. A la izquierda, el kissaten de Kenji: café. Y a la derecha, tu casa.' });
  await decir({ nombre: 'おばあさん', texto: 'Los vecinos te van a hablar en japonés. Si no entendés una palabra, tocala (clic) y te la traduzco. El tablón de la plaza tiene tus misiones del día.' });
  await decir({ nombre: 'おばあさん', toks: parsear('[がんばって|¡ánimo!]ね！'), trad: '¡Ánimo! (Movete con flechas/WASD, hablá con Z/Enter. Con M o los números 1-6 vas directo a cualquier lugar)', romaji: true });
  cerrarDialogo();
}

export function mostrarLugar(txt) {
  const c = $('#cartel-lugar');
  c.textContent = txt;
  c.classList.remove('oculto');
  c.style.animation = 'none'; void c.offsetWidth; c.style.animation = '';
  setTimeout(() => c.classList.add('oculto'), 2700);
}
void el; void VECINOS;
