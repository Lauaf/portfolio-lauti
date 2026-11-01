// 家 Tu casa: progreso, misiones, logros, opciones y la ficha inicial.
import { el, hoy, sonido, toast } from './util.js';
import { P, SKILLS, nivelDe, xpDeNivel, tituloDe, misionesDeHoy, listaLogros, rachaViva, guardar, reiniciarPartida, pintarHUD } from './progreso.js';
import { abrir } from './actividad.js';
import { aKana } from './jp/texto.js';
import { METODOS } from './datos/cafe.js';
import { IA } from './ia.js';

export function abrirCasa() {
  abrir('casa', '家 Tu casa', hubCasa, { sub: 'progreso y opciones' });
}

function hubCasa(c, ctx) {
  const t = (ico, tit, desc, fn) => el('button.tarjeta', { onclick: fn }, el('div.t-ico', ico), el('div.t-tit', tit), el('div.t-desc', desc));
  c.append(resumen(), el('div.rejilla',
    t('✅', 'Misiones de hoy', `${misionesDeHoy().filter(m => m.hecha).length}/3 cumplidas`, () => ctx.ir('Misiones de hoy', misiones)),
    t('📊', 'Progreso', 'Tus últimas dos semanas en las tres sendas.', () => ctx.ir('Progreso', progreso)),
    t('🏅', 'Logros', `${P.logros.length}/${listaLogros().length} desbloqueados`, () => ctx.ir('Logros', logros)),
    t('⚙️', 'Opciones', 'Sonido, nombre, partida.', () => ctx.ir('Opciones', opciones)),
    t('❓', 'Cómo jugar', 'Controles y consejos.', () => ctx.ir('Cómo jugar', ayuda)),
  ));
}

function resumen() {
  return el('div.dos-col', ...Object.entries(SKILLS).map(([k, s]) => {
    const xp = P.skills[k].xp, n = nivelDe(xp);
    const pct = (xp - xpDeNivel(n)) / (xpDeNivel(n + 1) - xpDeNivel(n)) * 100;
    return el('div.panel', el('div', `${s.ico} ${s.nombre} — Nv ${n}`), el('div.suave', tituloDe(k)),
      el('div.hp', { style: { marginTop: '6px' } }, el('i', { style: { width: pct + '%', background: 'var(--oro)' } })),
      el('div.suave', { style: { fontSize: '.7em' } }, `${xp} XP · faltan ${xpDeNivel(n + 1) - xp} para Nv ${n + 1}`));
  }), el('div.panel', el('div', `🔥 Racha: ${rachaViva()} días`), el('div.suave', `Mejor racha: ${P.racha.mejor} · IA: ${IA.disponible ? IA.modelo : 'apagada'}`)));
}

export function misiones(c) {
  c.append(el('div.suave', 'Se renuevan cada día. Cada una da +30 XP.'),
    ...misionesDeHoy().map(m => el('div.panel', el('div.fila',
      el('span', { style: { fontSize: '1.4em' } }, m.hecha ? '✅' : SKILLS[m.skill].ico),
      el('div', { style: { flex: 1 } }, el('div', m.texto), el('div.hp', { style: { marginTop: '6px' } }, el('i', { style: { width: (m.prog / m.meta * 100) + '%', background: m.hecha ? 'var(--bien)' : 'var(--oro)' } }))),
      el('span.suave', `${m.prog}/${m.meta}`)))));
}

function progreso(c) {
  const dias = [];
  for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); dias.push(hoy(d)); }
  const max = Math.max(30, ...dias.map(d => { const h = P.historial[d]; return h ? h.jp + h.piano + h.cafe : 0; }));
  const col = { jp: 'var(--sakura)', piano: 'var(--azul)', cafe: 'var(--cafe)' };
  c.append(
    el('div.fila', Object.entries(SKILLS).map(([k, s]) => el('span', el('span', { style: { color: col[k] } }, '■ '), s.nombre))),
    el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '6px', height: 'calc(var(--px) * 60)', padding: '10px', background: '#0003', borderRadius: '10px' } },
      dias.map(d => {
        const h = P.historial[d] || { jp: 0, piano: 0, cafe: 0 };
        return el('div', { style: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', height: '100%', justifyContent: 'flex-end' }, title: `${d}: ${h.jp} / ${h.piano} / ${h.cafe} XP` },
          el('div', { style: { width: '100%', display: 'flex', flexDirection: 'column-reverse' } },
            ['jp', 'piano', 'cafe'].map(k => el('div', { style: { height: `calc(var(--px) * ${h[k] / max * 48})`, background: col[k] } }))),
          el('div.suave', { style: { fontSize: '.55em' } }, d.slice(8)));
      })),
    el('div.panel', el('table.tabla',
      el('tr', el('th', ''), el('th', 'Japonés'), el('th', 'Piano'), el('th', 'Café')),
      el('tr', el('td', 'kana dominados'), el('td', Object.entries(P.srs).filter(([k, v]) => k.startsWith('kana:') && v.c >= 3).length), el('td', ''), el('td', '')),
      el('tr', el('td', 'palabras dominadas'), el('td', Object.entries(P.srs).filter(([k, v]) => k.startsWith('voc:') && v.c >= 3).length), el('td', ''), el('td', '')),
      el('tr', el('td', 'notas leídas'), el('td', ''), el('td', P.stats.nota_ok || 0), el('td', '')),
      el('tr', el('td', 'canciones / min de práctica real'), el('td', ''), el('td', `${P.stats.cancion_fin || 0} / ${P.stats.practica_real || 0}`), el('td', '')),
      el('tr', el('td', 'cafés en laboratorio / reales'), el('td', ''), el('td', ''), el('td', `${P.stats.brew_lab || 0} / ${P.stats.bitacora || 0}`)),
      el('tr', el('td', 'pedidos bien servidos'), el('td', ''), el('td', ''), el('td', P.stats.pedido_ok || 0)),
      el('tr', el('td', 'lecciones de la Academia aprobadas'), el('td', ''), el('td', ''), el('td', Object.values(P.cafe.academia?.lecciones || {}).filter(l => l.aprobada).length)))));
}

function logros(c) {
  c.append(el('div.rejilla', listaLogros().map(l => el('div.tarjeta' + (l.tiene ? '' : '.bloq'), el('div.t-ico', l.tiene ? '🏅' : '🔒'), el('div.t-desc', l.txt)))));
}

function opciones(c, ctx) {
  c.append(
    el('div.fila', el('button.btn', { onclick: () => { sonido.activo = P.opciones.sonido = !P.opciones.sonido; guardar(); ctx.rehacer(); } }, P.opciones.sonido ? '🔊 Sonido: sí' : '🔇 Sonido: no')),
    el('div.panel', el('div', 'Respaldo'), el('div.suave', 'La partida se guarda sola en L:\\Sando\\datos\\partida.json (con una copia por día).'),
      el('button.btn', { onclick: () => { const a = el('a', { href: URL.createObjectURL(new Blob([JSON.stringify(P, null, 1)], { type: 'application/json' })), download: `sando-${hoy()}.json` }); a.click(); } }, '⬇ Exportar partida')),
    el('div.panel', el('div.no', 'Zona peligrosa'), el('button.btn', { onclick: e => {
      if (e.target.dataset.seguro) { reiniciarPartida(); location.reload(); return; }
      e.target.dataset.seguro = '1'; e.target.textContent = '¿Seguro? Clic otra vez para borrar todo';
    } }, '🗑️ Empezar de cero')));
}

function ayuda(c) {
  c.append(el('div.panel', { html: `
<b>Moverte:</b> flechas o WASD. <b>Hablar / entrar:</b> Z, Enter o Espacio mirando a alguien o a una puerta. <b>Volver:</b> X o Esc. <b>Ir directo a cualquier lugar:</b> M (o ☰) abre el menú rápido; los números 1–6 te llevan sin abrirlo (1 dojo, 2 cine, 3 música, 4 café, 5 casa, 6 misiones).<br><br>
<b>Japonés:</b> los vecinos te hablan en japonés. Tocá cualquier palabra subrayada para ver qué significa y escucharla. Elegí la respuesta que tenga sentido. En el dojo: batallas de kana, vocabulario con repaso espaciado, lectura y charla con IA.<br><br>
<b>Piano:</b> sirve el teclado de la compu (A=Do, W=Do#, S=Re…), un piano digital por USB (MIDI) o el micrófono si tenés piano acústico. Lo más importante: la <i>Práctica real</i> en tu instrumento, registrala para sumar XP.<br><br>
<b>Café:</b> la <i>Academia de barismo</i> del kissaten tiene 8 módulos prácticos (espresso, diagnóstico, bebidas, pedidos, latte art, hora pico, filtrados y blends) con lecciones que se desbloquean en orden y recomendaciones según tus errores. El laboratorio te enseña a calibrar (molienda, ratio, temperatura, tiempo). Después prepará uno de verdad con la guía y anotalo en la bitácora: Kenji te dice qué ajustar.<br><br>
<b>Cine:</b> el edificio violeta, arriba de la plaza. Pegá el link de un video de YouTube en japonés con subtítulos (aunque sean automáticos): la IA separa cada línea en palabras con su significado en contexto. Tocá las que no sepas, guardalas con ☆ y repasalas después. Teclas: ←/→ línea, R repetir, Espacio pausa, P pausa automática, T traducción, G guion.<br><br>
<b>IA local:</b> si está prendida (Qwen u Ollama), las charlas, historias, preguntas y consejos se generan en el momento. Sin IA el juego funciona igual con contenido incluido.<br><br>
<b>Consejo:</b> 10–15 minutos por senda por día rinden más que 2 horas un solo día. Las misiones diarias y la racha están para eso.` }));
}

// ---------- Ficha inicial ----------
export function fichaInicial(alTerminar) {
  abrir('casa', 'あなたのこと · Tu ficha', (c, ctx) => {
    const sel = { jp: P.jp.nivel || 'cero', piano: P.piano.instrumento || 'pc', equipo: new Set(P.cafe.equipo) };
    const chips = (opts, get, set, multi = false) => {
      const cont = el('div.chips');
      const pintar = () => cont.querySelectorAll('.chip').forEach((x, i) => x.classList.toggle('sel', multi ? get().has(opts[i][0]) : get() === opts[i][0]));
      opts.forEach(([v, t]) => cont.append(el('button.chip', { onclick: () => { set(v); pintar(); } }, t)));
      pintar();
      return cont;
    };
    const nombre = el('input.entrada', { value: P.nombreRomaji || '', placeholder: 'tu nombre (ej: Lautaro)' });
    const kata = el('span.mediano', { style: { color: 'var(--sakura2)' } }, P.nombre || '');
    nombre.addEventListener('input', () => { kata.textContent = aKana(nombre.value.replace(/l/gi, 'r'), true); });
    nombre.addEventListener('keydown', e => e.stopPropagation());
    c.append(
      el('div', '¿Cómo te llamás?'), el('div.fila', nombre, kata, el('span.suave', '← así se escribe en katakana')),
      el('div', 'あ Japonés: ¿desde dónde arrancás?'),
      chips([['cero', 'Desde cero'], ['kana', 'Ya leo hiragana/katakana'], ['n5', 'N5'], ['n4', 'N4'], ['n3', 'N3']], () => sel.jp, v => { sel.jp = v; }),
      el('div', '♪ Piano: ¿con qué tocás?'),
      chips([['digital', 'Piano digital (USB/MIDI)'], ['acustico', 'Piano acústico'], ['pc', 'Por ahora, el teclado de la compu']], () => sel.piano, v => { sel.piano = v; }),
      el('div', '☕ Café: ¿qué tenés en casa? (podés elegir varios)'),
      chips(Object.entries(METODOS).map(([k, m]) => [k, `${m.ico} ${m.n}`]), () => sel.equipo, v => { sel.equipo.has(v) ? sel.equipo.delete(v) : sel.equipo.add(v); }, true),
      el('div.fila', { style: { marginTop: '10px' } }, el('button.btn.prim', { onclick: () => {
        P.nombreRomaji = nombre.value.trim();
        P.nombre = P.nombreRomaji ? aKana(P.nombreRomaji.replace(/l/gi, 'r'), true) : '';
        P.jp.nivel = sel.jp;
        P.jp.romaji = sel.jp === 'cero';
        P.piano.instrumento = sel.piano;
        P.cafe.equipo = [...sel.equipo];
        P.presentado = true;
        guardar(true);
        pintarHUD();
        toast('¡Ficha lista! Bienvenido a Sando 🌸');
        ctx.volver();
      } }, '¡Listo, a jugar! ▶')),
    );
  }, { alCerrar: alTerminar });
}
