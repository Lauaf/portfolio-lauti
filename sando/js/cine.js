// 映画館 Cine: videos de YouTube con subtítulos japoneses analizados por la IA (estilo HayaiLearn).
// Cada palabra se toca para ver su significado en ese contexto, se guarda en tu mazo y se repasa.
import { el, sfx, hablar, toast } from './util.js';
import { P, ganarXP, evento, guardar } from './progreso.js';
import { renderTokens, tieneKanji } from './jp/texto.js';
import { abrir } from './actividad.js';
import { sesionVocab } from './japones.js';
import { VOCAB } from './datos/vocab.js';
import { VOCAB_AVANZADO } from './datos/n4n3.js';
import { IA, revisarIA } from './ia.js';

const VW = 240, VH = 160;
// zonas de la sala en píxeles del juego (la pantalla de cine es 16:9)
const PANT = { x: 40, y: 13, w: 160, h: 90 };

const api = async (ruta, cuerpo) => {
  const r = cuerpo
    ? await fetch(ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
    : await fetch(ruta);
  const d = await r.json();
  if (r.status === 404 && d.error === 'ruta desconocida') throw new Error('El servidor quedó con una versión vieja: cerrá el juego y abrilo de nuevo con iniciar.pyw.');
  if (!r.ok) throw new Error(d.error || 'error');
  return d;
};
const pxs = n => `calc(var(--px) * ${n})`;
const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const miniatura = v => v ? `https://i.ytimg.com/vi/${v}/mqdefault.jpg` : null;

export function abrirCine() {
  abrir('cine', '映画館 Cine', hubCine, { sub: 'japonés con videos' });
}

// ---------- La sala (fondo pixel-art animado) ----------
let salaEstatica = null;
function pintarSalaEstatica() {
  const c = document.createElement('canvas');
  c.width = VW; c.height = VH;
  const g = c.getContext('2d');
  const r = (col, x, y, w, h) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // pared con paneles y un poco de luz que rebota de la pantalla
  r('#1c0b14', 0, 0, VW, VH);
  for (let x = 0; x < VW; x += 12) { r('#25101b', x, 0, 11, 112); r('#2e1421', x + 1, 0, 1, 112); }
  for (let y = 4; y < 112; y += 2) {
    const a = Math.max(0, 1 - Math.abs(y - 58) / 70) * 0.13;
    g.fillStyle = `rgba(150,170,255,${a})`; g.fillRect(PANT.x - 18, y, PANT.w + 36, 1);
  }
  // marco de la pantalla
  r('#0a0508', PANT.x - 3, PANT.y - 3, PANT.w + 6, PANT.h + 6);
  r('#3a2630', PANT.x - 2, PANT.y - 2, PANT.w + 4, PANT.h + 4);
  r('#0d0d14', PANT.x, PANT.y, PANT.w, PANT.h);
  // telones (pliegues con 4 tonos, atados con soga dorada)
  const tonos = ['#4a0a17', '#7a1426', '#a8203a', '#c93a50', '#a8203a', '#7a1426'];
  const telon = (x0, ancho, izq) => {
    for (let y = 0; y < 116; y++) {
      // el telón se recoge hacia la soga (y≈70) y se abre abajo
      const k = y < 70 ? 0 : Math.min(1, (y - 70) / 40);
      const recogido = y < 70 ? Math.sin((y / 70) * Math.PI / 2) * 8 : 8 - k * 6;
      const w = Math.round(ancho - recogido);
      for (let x = 0; x < w; x++) {
        const px = izq ? x0 + x : x0 + ancho - 1 - x;
        g.fillStyle = tonos[Math.floor((x * 6) / Math.max(10, w) * 2) % tonos.length];
        g.fillRect(px, y, 1, 1);
      }
      g.fillStyle = '#2a0610'; g.fillRect(izq ? x0 + w : x0 + ancho - 1 - w, y, 1, 1); // borde
    }
    const sx = izq ? x0 + ancho - 13 : x0 + 5;
    r('#8a6420', sx, 68, 9, 4); r('#f2c14e', sx, 68, 9, 2); r('#fff0b0', sx + 2, 68, 2, 1);
    r('#c9952e', sx + 3, 72, 3, 6); r('#f2c14e', sx + 3, 72, 1, 6);
  };
  telon(0, 40, true); telon(200, 40, false);
  // cenefa de arriba con flecos dorados
  r('#5c0d1d', 0, 0, VW, 7);
  for (let x = 0; x < VW; x += 10) {
    g.fillStyle = '#7a1426'; g.beginPath(); g.arc(x + 5, 7, 5, 0, Math.PI); g.fill();
    r('#a8203a', x + 2, 7, 6, 1);
  }
  r('#f2c14e', 0, 6, VW, 1); r('#8a6420', 0, 7, VW, 1);
  for (let x = 1; x < VW; x += 3) r(x % 2 ? '#f2c14e' : '#c9952e', x, 8 + (x % 5 === 0 ? 1 : 0), 1, 2);
  // escalones / piso
  r('#120710', 0, 104, VW, 56);
  for (let y = 104; y < VH; y += 3) r('#170a13', 0, y, VW, 1);
  // filas de butacas (de atrás para adelante: más grandes y más claras)
  const filas = [{ y: 112, w: 13, h: 9, c: ['#4a0a17', '#6a1222', '#8e1b2e'] },
    { y: 125, w: 15, h: 11, c: ['#5a0d1c', '#7f1729', '#a8203a'] },
    { y: 141, w: 18, h: 14, c: ['#6a1020', '#951b30', '#c22c44'] }];
  const cabezas = [[0, 4], [0, 11], [1, 2], [1, 9], [2, 6]];
  filas.forEach((f, fi) => {
    const sep = f.w + 2;
    const off = fi % 2 ? sep / 2 : 0;
    for (let x = -sep + off, n = 0; x < VW + sep; x += sep, n++) {
      if (cabezas.some(([a, b]) => a === fi && b === n)) { // espectador
        const hx = x + f.w / 2, hy = f.y - f.h * 0.35;
        g.fillStyle = '#0b0610'; g.beginPath(); g.arc(hx, hy, f.w * 0.32, 0, 7); g.fill();
        r('#0b0610', hx - f.w * 0.38, hy + 1, f.w * 0.76, f.h * 0.5);
      }
      g.fillStyle = f.c[0]; g.beginPath(); g.roundRect(x, f.y, f.w, f.h, [4, 4, 1, 1]); g.fill();
      g.fillStyle = f.c[1]; g.beginPath(); g.roundRect(x + 1, f.y + 1, f.w - 2, f.h - 3, [3, 3, 1, 1]); g.fill();
      r(f.c[2], x + 2, f.y + 2, f.w - 6, 1); r(f.c[2], x + 2, f.y + 2, 1, f.h - 6);
      r('#2a0610', x, f.y + f.h - 2, f.w, 2);
    }
  });
  // luces del pasillo
  for (const [x, y] of [[4, 122], [236, 122], [4, 138], [236, 138], [4, 156], [236, 156]]) { r('#f2c14e', x - 1, y, 3, 1); r('#fff0b0', x, y, 1, 1); }
  return c;
}

/** Monta la sala en `cont`: canvas de fondo + capa para la pantalla. Devuelve {pantalla, parar}. */
function sala(cont, { marquesina = true } = {}) {
  salaEstatica ??= pintarSalaEstatica();
  const cv = el('canvas.sala-fondo', { width: VW, height: VH });
  const g = cv.getContext('2d');
  const pantalla = el('div.sala-pantalla', { style: { left: pxs(PANT.x), top: pxs(PANT.y), width: pxs(PANT.w), height: pxs(PANT.h) } });
  const raiz = el('div.sala', cv, pantalla);
  cont.append(raiz);
  const polvo = Array.from({ length: 16 }, () => ({ x: Math.random(), y: Math.random(), v: 0.2 + Math.random() * 0.5 }));
  let vivo = true, prev = 0;
  const cuadro = t => {
    if (!vivo) return;
    requestAnimationFrame(cuadro);
    if (t - prev < 80) return; // ~12 fps alcanza para la sala
    prev = t;
    g.drawImage(salaEstatica, 0, 0);
    // haz del proyector (desde atrás del público hacia la pantalla) con polvo flotando
    g.save();
    g.globalCompositeOperation = 'lighter';
    g.beginPath(); g.moveTo(118, VH); g.lineTo(122, VH); g.lineTo(PANT.x + PANT.w, PANT.y + PANT.h); g.lineTo(PANT.x, PANT.y + PANT.h); g.closePath();
    g.fillStyle = 'rgba(120,130,200,0.05)'; g.fill();
    g.clip();
    for (const p of polvo) {
      p.y -= p.v * 0.004; p.x += Math.sin(t / 900 + p.v * 9) * 0.0008;
      if (p.y < 0) { p.y = 1; p.x = Math.random(); }
      g.fillStyle = 'rgba(200,210,255,0.35)';
      g.fillRect(Math.round(PANT.x + p.x * PANT.w), Math.round(PANT.y + PANT.h + p.y * (VH - PANT.y - PANT.h)), 1, 1);
    }
    g.restore();
    // foquitos de marquesina alrededor de la pantalla
    if (marquesina) {
      const fase = Math.floor(t / 260) % 3;
      let n = 0;
      const foco = (x, y) => { g.fillStyle = (n++ % 3) === fase ? '#fff6c8' : '#c9952e'; g.fillRect(x, y, 2, 2); };
      for (let x = PANT.x - 4; x <= PANT.x + PANT.w + 2; x += 6) { foco(x, PANT.y - 6); foco(x, PANT.y + PANT.h + 4); }
      for (let y = PANT.y; y <= PANT.y + PANT.h; y += 6) { foco(PANT.x - 6, y); foco(PANT.x + PANT.w + 4, y); }
    }
  };
  requestAnimationFrame(cuadro);
  return { raiz, pantalla, parar: () => { vivo = false; } };
}

// ---------- Hub: la cartelera ----------
function hubCine(c, ctx) {
  const s = sala(c);
  let lista = [];
  let timer = null;
  const salir = el('button.btn.chico.sala-salir', { onclick: () => ctx.volver(), title: 'Salir (Esc)' }, '✕ Salir');
  const titulo = el('div.sala-cartel', '映画館 ', el('small', 'CINE SANDO'));
  const grilla = el('div.cartelera');
  const mazo = P.jp.mazo || [];
  const boletera = el('div.boletera',
    el('button.btn.prim', { onclick: () => importar(ctx) }, '＋ Nueva función'),
    el('button.btn', { onclick: () => mazo.length ? ctx.ir('⭐ Mi mazo del cine', verMazo) : toast('Tocá palabras de los subtítulos y guardalas con ☆') },
      `⭐ Mi mazo (${mazo.length})`),
    el('button.btn', { disabled: !mazo.length, onclick: () => ctx.ir('⭐ Repaso del cine', (cc, cx) => sesionVocab(cc, cx, mazo)) }, '▶ Repasar'));
  s.pantalla.append(grilla);
  s.raiz.append(titulo, salir, boletera);

  const pintar = () => {
    grilla.replaceChildren();
    if (!lista.length) {
      grilla.append(el('div.cartelera-vacia',
        el('div.mediano', '🎬 La sala está vacía'),
        el('div', 'Pegá el link de un video de YouTube en japonés (con subtítulos japoneses, aunque sean automáticos).'),
        el('div.suave', 'La IA separa cada línea en palabras, con lectura y significado según el contexto. Vos mirás, tocás lo que no entendés y lo guardás.'),
        el('button.btn.prim', { onclick: () => importar(ctx) }, '＋ Nueva función')));
      return;
    }
    for (const v of lista) {
      const listo = v.estado === 'listo';
      const pct = v.lineas ? Math.round(Math.min(1, (v.visto + 1) / v.lineas) * 100) : 0;
      const img = miniatura(v.video);
      grilla.append(el('button.poster' + (listo ? '' : '.cargando'), {
        onclick: () => listo ? ctx.ir(v.titulo, (cc, cx) => funcion(cc, cx, v.id), { sub: v.canal }) : toast(v.mensaje || 'Todavía se está preparando…'),
        title: v.titulo,
      },
      el('div.poster-img', img ? { style: { backgroundImage: `url(${img})` } } : {}, img ? null : '🎞'),
      el('div.poster-tit', v.titulo),
      el('div.poster-info',
        v.estado === 'error' ? el('span.no', '⚠ ' + (v.mensaje || 'error'))
          : !listo ? el('span.escribiendo-ia', v.mensaje || 'preparando')
            : [el('span', `${v.lineas} líneas`), v.analizadas < v.lineas ? el('span.suave', ` · IA ${Math.round(v.analizadas / v.lineas * 100)}%`) : null]),
      el('div.poster-barra', el('i', { style: { width: (listo ? pct : 0) + '%' } })),
      el('span.poster-borrar', { title: 'Sacar de la cartelera', onclick: async e => {
        e.stopPropagation();
        if (!e.currentTarget.dataset.seguro) { e.currentTarget.dataset.seguro = '1'; e.currentTarget.textContent = '¿borrar?'; return; }
        await api('/api/cine/borrar', { id: v.id }).catch(() => null);
        refrescar();
      } }, '✕')));
    }
  };
  const refrescar = async () => {
    try { lista = await api('/api/cine'); } catch { lista = []; }
    pintar();
    clearTimeout(timer);
    if (lista.some(v => v.estado === 'bajando' || (v.estado === 'listo' && v.analizadas < v.lineas && IA.disponible))) timer = setTimeout(refrescar, 3000);
  };
  refrescar();
  return () => { s.parar(); clearTimeout(timer); };
}

function importar(ctx) {
  ctx.ir('＋ Nueva función', (c, cx) => {
    c.classList.add('centro');
    const url = el('input.entrada', { placeholder: 'https://www.youtube.com/watch?v=…', style: { width: '100%' } });
    const archivo = el('input', { type: 'file', accept: '.srt,.vtt,.json', style: { display: 'none' } });
    const estado = el('div.suave');
    const parar = e => e.stopPropagation();
    url.addEventListener('keydown', e => { parar(e); if (e.key === 'Enter') enviar(); });
    const enviar = async (extra = {}) => {
      if (!url.value.trim() && !extra.texto) { estado.textContent = 'Pegá un link primero.'; return; }
      estado.textContent = 'Mandando a la cabina de proyección…';
      try {
        await api('/api/cine/importar', { url: url.value.trim(), ...extra });
        sfx.aceptar();
        toast('🎬 Función agregada: en un ratito está lista');
        cx.volver();
      } catch (e) { estado.textContent = '⚠ ' + e.message; sfx.mal(); }
    };
    archivo.addEventListener('change', async () => {
      const f = archivo.files[0];
      if (f) enviar({ texto: await f.text(), nombre: f.name });
    });
    c.append(el('div.panel', { style: { width: 'min(100%, calc(var(--px) * 180))', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' } },
      el('div', '🎟 Link del video de YouTube'),
      url,
      el('div.suave', 'Buscá videos en japonés que tengan subtítulos (CC) en japonés: vlogs, anime, Nihongo con Teppei, ドラマ… Si también tiene subtítulos en castellano o inglés, se usan para la traducción.'),
      el('div.fila', el('button.btn.prim', { onclick: () => enviar() }, '▶ Importar'),
        el('button.btn', { onclick: () => archivo.click(), title: 'Si el video no trae subtítulos, subí un .srt/.vtt (con el link de arriba para ver el video)' }, '📄 Subir .srt / .vtt')),
      archivo, estado));
    setTimeout(() => url.focus(), 30);
  });
}

// ---------- Diccionario de respaldo (sin IA) ----------
let dicc = null;
function segmentar(texto) {
  if (!dicc) {
    dicc = new Map();
    for (const v of [...VOCAB, ...VOCAB_AVANZADO]) {
      for (const k of [v.p, v.r]) if (k && !dicc.has(k) && (k === v.p || !tieneKanji(v.p))) dicc.set(k, v);
    }
    const PART = { は: ['わ', '(tema)'], が: ['が', '(sujeto)'], を: ['を', '(objeto)'], に: ['に', 'a / en'], で: ['で', 'en / con'], と: ['と', 'y / con'],
      も: ['も', 'también'], の: ['の', 'de'], へ: ['え', 'hacia'], か: ['か', '(pregunta)'], ね: ['ね', '¿no?'], よ: ['よ', '(énfasis)'], から: ['から', 'desde / porque'], まで: ['まで', 'hasta'] };
    for (const [p, [r, s]] of Object.entries(PART)) if (!dicc.has(p)) dicc.set(p, { p, r, s });
  }
  const toks = [];
  let suelto = '';
  for (let i = 0; i < texto.length;) {
    let hit = null;
    for (let n = Math.min(8, texto.length - i); n >= 1; n--) {
      const v = dicc.get(texto.slice(i, i + n));
      if (v) { hit = { t: texto.slice(i, i + n), r: v.p === texto.slice(i, i + n) ? v.r : texto.slice(i, i + n), s: v.s }; break; }
    }
    if (hit) {
      if (suelto) { toks.push({ t: suelto, r: suelto, s: '' }); suelto = ''; }
      toks.push(hit); i += hit.t.length;
    } else { suelto += texto[i]; i++; }
  }
  if (suelto) toks.push({ t: suelto, r: suelto, s: '' });
  return toks;
}

// ---------- Mazo ----------
function guardarPalabra(tok, linea, video) {
  P.jp.mazo ??= [];
  const p = tok.t;
  if (P.jp.mazo.some(m => m.p === p)) return true;
  P.jp.mazo.push({ p, r: tok.r || p, s: tok.s, b: tok.b, ej: linea.t, es: linea.es || '', vid: video?.id, yt: video?.video, a: linea.a });
  evento('cine_palabra');
  ganarXP('jp', 1);
  guardar();
  return false;
}

function verMazo(c, ctx) {
  const mazo = P.jp.mazo || [];
  c.append(el('div.fila',
    el('button.btn.prim', { onclick: () => ctx.ir('⭐ Repaso del cine', (cc, cx) => sesionVocab(cc, cx, mazo)) }, `▶ Repasar (${mazo.length})`),
    el('span.suave', 'Cada palabra guarda la escena donde la viste.')));
  for (const m of [...mazo].reverse()) {
    const fila = el('div.panel.fila',
      el('div', { style: { flex: 1, minWidth: 0 } },
        el('div', el('b', { style: { color: 'var(--sakura2)', fontSize: '1.2em' } }, m.p), ` 【${m.r}】 `, el('span', m.s), m.b ? el('span.suave', ` · dicc. ${m.b}`) : null),
        el('div.suave', `「${m.ej}」`), m.es ? el('div.suave', { style: { fontSize: '.7em' } }, m.es) : null),
      el('button.btn.chico', { onclick: () => hablar(m.r) }, '🔊'),
      m.vid ? el('button.btn.chico', { title: 'Ver la escena', onclick: () => ctx.ir('🎬 Escena', (cc, cx) => funcion(cc, cx, m.vid, m.a)) }, '🎬') : null,
      el('button.btn.chico', { title: 'Sacar del mazo', onclick: () => {
        P.jp.mazo = P.jp.mazo.filter(x => x.p !== m.p); guardar(); fila.remove();
      } }, '✕'));
    c.append(fila);
  }
}

// ---------- La función: video + subtítulos interactivos ----------
let promesaYT = null;
function cargarYT() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  promesaYT ??= new Promise((ok, mal) => {
    window.onYouTubeIframeAPIReady = () => ok(window.YT);
    const s = el('script', { src: 'https://www.youtube.com/iframe_api' });
    s.onerror = () => { promesaYT = null; mal(new Error('sin conexión a YouTube')); };
    document.head.append(s);
  });
  return promesaYT;
}

function funcion(c, ctx, id, desde = null) {
  const s = sala(c, { marquesina: false });
  let v = null, jugador = null, actual = -1, pausaLinea = -1, timer = null, sondeo = null, vivo = true;
  const op = { autopausa: false, trad: false, guion: false };
  const subt = el('div.subtitulo');
  const guion = el('div.guion.oculto');
  const reloj = el('span.suave');
  const btnAuto = el('button.btn.chico', { title: 'Pausar al final de cada línea (P)', onclick: () => alternar('autopausa') });
  const btnTrad = el('button.btn.chico', { title: 'Mostrar la traducción (T)', onclick: () => alternar('trad') });
  const btnGuion = el('button.btn.chico', { title: 'Guion completo (G)', onclick: () => alternar('guion') });
  const controles = el('div.sala-controles',
    el('button.btn.chico', { title: 'Línea anterior (←)', onclick: () => ir(actual - 1) }, '⏮'),
    el('button.btn.chico', { title: 'Repetir línea (R)', onclick: () => ir(actual) }, '🔁'),
    el('button.btn.chico', { title: 'Play / pausa (Espacio)', onclick: () => playPausa() }, '⏯'),
    el('button.btn.chico', { title: 'Línea siguiente (→)', onclick: () => ir(actual + 1) }, '⏭'),
    btnAuto, btnTrad, btnGuion,
    el('button.btn.chico', { title: 'Velocidad', onclick: e => {
      const vels = [1, 0.75, 0.5];
      const n = vels[(vels.indexOf(jugador?.getPlaybackRate?.() ?? 1) + 1) % vels.length];
      jugador?.setPlaybackRate?.(n); e.currentTarget.textContent = `×${n}`;
    } }, '×1'),
    reloj,
    el('button.btn.chico', { style: { marginLeft: 'auto' }, onclick: () => ctx.volver() }, '◀ Cartelera'));
  s.raiz.append(subt, controles, guion);
  const pintarBotones = () => {
    btnAuto.textContent = op.autopausa ? '⏸ auto: sí' : '⏸ auto: no';
    btnTrad.textContent = op.trad ? '💬 trad: sí' : '💬 trad: no';
    btnGuion.textContent = '📜 guion';
    btnGuion.classList.toggle('prim', op.guion);
    guion.classList.toggle('oculto', !op.guion);
  };
  const alternar = k => { op[k] = !op[k]; sfx.cursor(); pintarBotones(); if (k === 'trad') pintarLinea(); if (k === 'guion') pintarGuion(); };
  pintarBotones();

  const tokensDe = ln => ln.toks?.length ? ln.toks : segmentar(ln.t);
  function pintarLinea() {
    const ln = v?.lineas[actual];
    subt.replaceChildren();
    if (!ln) { subt.append(el('div.suave', actual < 0 ? 'Dale play: los subtítulos aparecen acá. Tocá cualquier palabra.' : '')); return; }
    const r = renderTokens(tokensDe(ln), { furigana: P.jp.furigana, romaji: P.jp.romaji, alGuardar: tok => guardarPalabra(tok, ln, v) });
    const trad = el('div.subtitulo-trad' + (op.trad ? '' : '.tapada'), { title: 'Clic para ver la traducción', onclick: e => { e.stopPropagation(); e.currentTarget.classList.remove('tapada'); } },
      ln.es || (ln.toks ? '' : IA.disponible ? 'traduciendo…' : '(sin traducción: prendé la IA)'));
    subt.append(el('div.subtitulo-jp', r.nodo,
      el('button.btn.chico.subtitulo-voz', { title: 'Escuchar la línea (voz)', onclick: e => { e.stopPropagation(); hablar(ln.toks ? ln.toks.map(t => t.r).join('') : ln.t, 'ja', 0.85); } }, '🔊')),
    ...[r.romajiNodo, trad, ln.toks ? null : el('div.subtitulo-aviso', IA.disponible ? 'la IA está analizando esta línea…' : 'diccionario básico (sin IA)')].filter(Boolean));
  }
  function pintarGuion() {
    if (!op.guion || !v) return;
    guion.replaceChildren(...v.lineas.map((ln, i) => el('div.guion-linea' + (i === actual ? '.actual' : ''), { onclick: () => ir(i) },
      el('span.suave', mmss(ln.a) + ' '), ln.t)));
    guion.querySelector('.actual')?.scrollIntoView({ block: 'center' });
  }
  const lineaEn = t => {
    const ls = v.lineas;
    let lo = 0, hi = ls.length - 1, res = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (ls[m].a <= t + 0.05) { res = m; lo = m + 1; } else hi = m - 1; }
    return res;
  };
  function ponerLinea(i) {
    if (i === actual) return;
    actual = i;
    pintarLinea();
    if (op.guion) pintarGuion();
    if (i > (v.visto || 0)) { // líneas nuevas vistas: XP y misión
      const nuevas = i - (v.visto || 0);
      v.visto = i;
      evento('cine_lineas', nuevas);
      v.xpPend = (v.xpPend || 0) + nuevas;
      if (v.xpPend >= 10) { ganarXP('jp', 3, 'cine'); v.xpPend -= 10; }
      if (i === v.lineas.length - 1) { evento('cine_fin'); ganarXP('jp', 15, '¡función terminada!'); }
      api('/api/cine/visto', { id, linea: i }).catch(() => null);
    }
  }
  function ir(i) {
    if (!v) return;
    i = Math.max(0, Math.min(v.lineas.length - 1, i));
    pausaLinea = -1;
    if (jugador?.seekTo) { jugador.seekTo(v.lineas[i].a, true); jugador.playVideo(); }
    actual = -2; ponerLinea(i);
    if (!jugador) hablar(tokensDe(v.lineas[i]).map(t => t.r).join(''), 'ja', 0.85);
  }
  function playPausa() {
    if (!jugador?.getPlayerState) return;
    jugador.getPlayerState() === 1 ? jugador.pauseVideo() : jugador.playVideo();
  }
  function seguir() { // sincroniza subtítulos con el video
    if (!vivo || !jugador?.getCurrentTime || !v) return;
    const t = jugador.getCurrentTime();
    reloj.textContent = `${mmss(t)} · ${actual + 1}/${v.lineas.length}`;
    const i = lineaEn(t);
    const ln = v.lineas[actual];
    if (op.autopausa && ln && pausaLinea !== actual && jugador.getPlayerState() === 1 && t >= ln.b - 0.12 && i <= actual + 1) {
      pausaLinea = actual;
      jugador.pauseVideo();
      return;
    }
    if (i !== actual && i >= 0) ponerLinea(i);
  }
  const teclas = e => {
    if (/INPUT|TEXTAREA/.test(document.activeElement?.tagName || '')) return;
    const k = e.key.toLowerCase();
    if (k === ' ') document.activeElement?.blur?.(); // que Espacio no "clickee" el último botón
    const acc = { arrowleft: () => ir(actual - 1), arrowright: () => ir(actual + 1), r: () => ir(actual), ' ': playPausa,
      p: () => alternar('autopausa'), t: () => alternar('trad'), g: () => alternar('guion') }[k];
    if (acc) { e.preventDefault(); acc(); }
  };
  addEventListener('keydown', teclas);

  // cargar el video y, mientras la IA analiza, ir trayendo las líneas nuevas
  const traer = async () => {
    try {
      const d = await api(`/api/cine/video?id=${id}`);
      const primera = !v;
      if (primera) v = d;
      else d.lineas.forEach((ln, i) => { if (ln.toks && !v.lineas[i].toks) { v.lineas[i] = ln; if (i === actual) pintarLinea(); } });
      const faltan = d.lineas.some(ln => !ln.toks && !ln.sin_analisis);
      if (faltan && primera && (IA.disponible || await revisarIA())) api('/api/cine/analizar', { id, linea: Math.max(0, actual) }).catch(() => null);
      clearTimeout(timer);
      if (faltan && IA.disponible && vivo) timer = setTimeout(traer, 3500);
      return primera;
    } catch (e) {
      subt.replaceChildren(el('div.no', '⚠ ' + e.message));
      return false;
    }
  };
  (async () => {
    if (!(await traer())) return;
    ctx.titulo(v.titulo);
    if (v.video) {
      const hueco = el('div');
      s.pantalla.append(hueco);
      // sin los subtítulos de YouTube: se leen los del cine (y la traducción va tapada); el botón CC los vuelve a prender
      let subsYTApagados = false;
      const sinSubsYT = () => { try { jugador.unloadModule('captions'); jugador.unloadModule('cc'); } catch { /* */ } };
      try {
        const YT = await cargarYT();
        if (!vivo) return;
        jugador = new YT.Player(hueco, {
          videoId: v.video, width: '100%', height: '100%',
          playerVars: { rel: 0, playsinline: 1, modestbranding: 1, cc_load_policy: 0, iv_load_policy: 3, origin: location.origin, start: Math.floor(desde ?? v.lineas[Math.max(0, v.visto || 0)]?.a ?? 0) },
          events: {
            onReady: () => {
              sinSubsYT();
              sondeo = setInterval(seguir, 100);
              if (desde != null) { jugador.playVideo(); op.autopausa = true; pintarBotones(); }
            },
            onApiChange: () => { if (!subsYTApagados) { subsYTApagados = true; sinSubsYT(); } }, // se cargan al empezar a reproducir
          },
        });
      } catch (e) {
        s.pantalla.append(el('div.cartelera-vacia', el('div', '📡 ' + e.message), el('div.suave', 'Igual podés leer los subtítulos con ←/→ y escucharlos con la voz.')));
      }
    } else {
      s.pantalla.append(el('div.cartelera-vacia', el('div.mediano', '📄'), el('div', 'Subtítulos sin video'), el('div.suave', 'Pasá las líneas con ←/→; la voz te las lee.')));
    }
    const inicio = desde != null ? Math.max(0, lineaEn(desde)) : Math.max(0, Math.min(v.visto || 0, v.lineas.length - 1));
    actual = -2; ponerLinea(inicio);
  })();
  pintarLinea();
  return () => {
    vivo = false;
    s.parar(); clearTimeout(timer); clearInterval(sondeo);
    removeEventListener('keydown', teclas);
    try { jugador?.destroy?.(); } catch { /* */ }
  };
}
