// Motor del pueblo: mapa por casillas, cámara, movimiento por grilla, NPCs, pétalos,
// mariposas y luz según la hora real. El arte (estilo Minish Cap) vive en graficos.js.
import { sfx } from './util.js';
import { T, spritePersona, pintarFondo, dibujarAgua, dibujarFlores, edificio, decorar, cartel, mariposa, lienzo } from './graficos.js';
import { dibujarArky, dibujarExpresion, ARKY } from './arky.js';

export { T };
const VW = 240, VH = 160;      // resolución GBA
const E = 4;                   // el canvas visible tiene 4 px por píxel del juego (para los PNG de Arky)

// ---------- Mapa ----------
export class Mundo {
  constructor({ ancho, alto, edificios, decor, npcs, carteles }) {
    this.w = ancho; this.h = alto;
    this.tiles = Array.from({ length: alto }, () => Array(ancho).fill('.'));
    this.edificios = edificios;
    this.decor = decor;         // [{tipo, x, y}]
    this.npcs = npcs;           // [{id, x, y, pal, dir, ...}]
    this.carteles = carteles;   // [{x, y, ...}]
    this.bloqueado = Array.from({ length: alto }, () => Array(ancho).fill(false));
  }
  set(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.tiles[y][x] = c; }
  rect(x, y, w, h, c) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c); }
  calcularBloqueos() {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) {
      this.bloqueado[y][x] = this.tiles[y][x] === '~';
    }
    for (const e of this.edificios) {
      for (let j = e.y; j < e.y + e.h; j++) for (let i = e.x; i < e.x + e.w; i++) this.bloqueado[j][i] = true;
    }
    for (const d of this.decor) if (d.bloquea !== false) this.bloqueado[d.y][d.x] = true;
    for (const c of this.carteles) this.bloqueado[c.y][c.x] = true;
  }
  libre(x, y, ignorar = null) {
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || this.bloqueado[y][x]) return false;
    return !this.npcs.some(n => n !== ignorar && n.x === x && n.y === y);
  }
}

// ---------- Motor ----------
export class Motor {
  constructor(canvas, mundo, jugador) {
    // El pueblo se dibuja en baja resolución en dos capas (lo que queda detrás de Arky y lo que queda
    // delante) y se amplía al canvas visible; Arky va en el medio, a la resolución de sus PNG.
    this.c = canvas;
    canvas.width = VW * E; canvas.height = VH * E;
    this.gv = canvas.getContext('2d');
    this.gv.imageSmoothingEnabled = false;
    this.atras = lienzo(VW, VH); this.delante = lienzo(VW, VH);
    this.gAtras = this.atras.getContext('2d'); this.gDelante = this.delante.getContext('2d');
    this.m = mundo;
    this.j = { ...jugador, px: jugador.x * T, py: jugador.y * T, mov: null, paso: 0 };
    this.teclas = new Set();
    this.pausado = false;
    this.onInteractuar = () => {};
    this.onPisar = () => {};
    this.petalos = Array.from({ length: 14 }, () => this.nuevoPetalo(true));
    this.ultimo = performance.now();
    this.prerender();
    addEventListener('keydown', e => {
      if (/^(Arrow|Key[WASD])/.test(e.code)) this.teclas.add(e.code);
    });
    addEventListener('keyup', e => this.teclas.delete(e.code));
    // expresiones de Arky: window.dispatchEvent(new CustomEvent('sando:expresion', { detail: 'feliz' }))
    addEventListener('sando:expresion', e => this.expresar(e.detail));
    this.quietoDesde = performance.now();
    addEventListener('blur', () => this.teclas.clear());
    requestAnimationFrame(t => this.bucle(t));
  }

  prerender() {
    // fondo estático (pasto/caminos/plaza/puente) en un canvas grande; agua y flores se animan aparte
    this.fondo = pintarFondo(this.m);
    this.mariposas = Array.from({ length: 5 }, (_, i) => ({
      x: Math.random() * this.m.w * T, y: Math.random() * this.m.h * T, f: Math.random() * 9,
      col: ['#fff4c2', '#f7a8c4', '#ffffff', '#a8d8ff', '#fff4c2'][i],
    }));
  }

  nuevoPetalo(inicial) {
    return { x: Math.random() * (VW + 40), y: inicial ? Math.random() * VH : -8, v: 0.15 + Math.random() * 0.25, f: Math.random() * 6 };
  }

  /** Arky muestra una cara en un globito por un rato (feliz|enojado|pensativo|sorprendido). */
  expresar(tipo, ms = 2200) {
    this.expr = { tipo, hasta: performance.now() + ms };
  }

  /** Cara actual de Arky; si se queda quieto un buen rato, se pone pensativo. */
  expresionDeArky(t) {
    if (this.expr && t > this.expr.hasta) this.expr = null;
    if (this.pausado) this.quietoDesde = t; // charlando o en un menú no cuenta como "aburrido"
    if (!this.expr && !this.j.mov && t - this.quietoDesde > 12000) {
      this.expresar('pensativo', 4000);
      this.quietoDesde = t;
    }
    return this.expr?.tipo;
  }

  direccion() {
    const k = this.teclas;
    if (k.has('ArrowUp') || k.has('KeyW')) return 1;
    if (k.has('ArrowDown') || k.has('KeyS')) return 0;
    if (k.has('ArrowLeft') || k.has('KeyA')) return 2;
    if (k.has('ArrowRight') || k.has('KeyD')) return 3;
    return -1;
  }

  frente(ent = this.j) {
    const d = [[0, 1], [0, -1], [-1, 0], [1, 0]][ent.dir];
    return { x: ent.x + d[0], y: ent.y + d[1] };
  }

  interactuar() {
    if (this.pausado || this.j.mov) return;
    const f = this.frente();
    this.onInteractuar(f.x, f.y);
  }

  actualizar(dt, t) {
    const j = this.j;
    const vel = 0.085 * dt; // px por ms
    if (j.mov) {
      const tx = j.mov.x * T, ty = j.mov.y * T;
      const dx = Math.sign(tx - j.px), dy = Math.sign(ty - j.py);
      j.px += dx * Math.min(vel, Math.abs(tx - j.px));
      j.py += dy * Math.min(vel, Math.abs(ty - j.py));
      if (j.px === tx && j.py === ty) {
        j.x = j.mov.x; j.y = j.mov.y; j.mov = null;
        this.onPisar(j.x, j.y);
      }
    }
    if (!j.mov && !this.pausado) {
      const d = this.direccion();
      if (d >= 0) {
        const cambio = j.dir !== d;
        j.dir = d;
        const f = this.frente();
        this.quietoDesde = t; this.expr = null;
        if (this.m.libre(f.x, f.y)) {
          j.mov = f; j.paso ^= 1;
          if (j.paso) sfx.paso();
        } else if (cambio) { /* solo gira */ }
        // puertas: caminar contra la puerta también entra
        else this.onInteractuar(f.x, f.y, true);
      }
    }
    // NPCs deambulan
    for (const n of this.m.npcs) {
      if (n.mov) {
        const tx = n.mov.x * T, ty = n.mov.y * T;
        const v = 0.04 * dt;
        n.px += Math.sign(tx - n.px) * Math.min(v, Math.abs(tx - n.px));
        n.py += Math.sign(ty - n.py) * Math.min(v, Math.abs(ty - n.py));
        if (n.px === tx && n.py === ty) { n.x = n.mov.x; n.y = n.mov.y; n.mov = null; }
        continue;
      }
      if (this.pausado || !n.radio || n.hablando) continue;
      if (t > (n.prox || 0)) {
        n.prox = t + 1500 + Math.random() * 3500;
        const dir = Math.floor(Math.random() * 4);
        n.dir = dir;
        const d = [[0, 1], [0, -1], [-1, 0], [1, 0]][dir];
        const nx = n.x + d[0], ny = n.y + d[1];
        const ocupaJugador = (nx === j.x && ny === j.y) || (j.mov && nx === j.mov.x && ny === j.mov.y);
        if (Math.abs(nx - n.ox) <= n.radio && Math.abs(ny - n.oy) <= n.radio && this.m.libre(nx, ny, n) && !ocupaJugador) {
          n.mov = { x: nx, y: ny }; n.paso ^= 1;
        }
      }
    }
    for (const b of this.mariposas) {
      b.f += dt * 0.0012;
      b.x += Math.cos(b.f) * 0.02 * dt + Math.sin(b.f * 2.7) * 0.01 * dt;
      b.y += Math.sin(b.f * 1.3) * 0.015 * dt;
      b.x = (b.x + this.m.w * T) % (this.m.w * T); b.y = (b.y + this.m.h * T) % (this.m.h * T);
    }
    for (const p of this.petalos) {
      p.y += p.v * dt * 0.06; p.x -= p.v * dt * 0.035 + Math.sin((t / 600) + p.f) * 0.15;
      if (p.y > VH + 5 || p.x < -10) Object.assign(p, this.nuevoPetalo(false));
    }
  }

  ocupadoPorJugador(x, y) {
    const j = this.j;
    return (j.x === x && j.y === y) || (j.mov && j.mov.x === x && j.mov.y === y);
  }

  /** Cuadro de animación al caminar: quieto, paso A, quieto, paso B (según el avance en la casilla). */
  cuadro(ent) {
    if (!ent.mov) return 0;
    const avance = (Math.abs(ent.mov.x * T - ent.px) + Math.abs(ent.mov.y * T - ent.py)) / T;
    return avance > 0.5 ? (ent.paso ? 1 : 2) : 0;
  }

  dibujar(t) {
    const m = this.m, j = this.j;
    let g = this.gAtras;
    let ox = Math.round(j.px + 8 - VW / 2), oy = Math.round(j.py + 8 - VH / 2);
    ox = Math.max(0, Math.min(m.w * T - VW, ox));
    oy = Math.max(0, Math.min(m.h * T - VH, oy));
    this.cam = { ox, oy };
    g.drawImage(this.fondo, ox, oy, VW, VH, 0, 0, VW, VH);
    const x0 = Math.floor(ox / T), y0 = Math.floor(oy / T);
    for (let y = y0; y <= y0 + VH / T + 1; y++) for (let x = x0; x <= x0 + VW / T + 1; x++) {
      const k = m.tiles[y]?.[x];
      if (k === '~') dibujarAgua(g, m, x, y, x * T - ox, y * T - oy, t);
      else if (k === ',') dibujarFlores(g, x, y, x * T - ox, y * T - oy, t);
    }
    const h = this.hora ?? new Date().getHours();
    const noche = h >= 20 || h < 6;
    // objetos ordenados por y (profundidad); solo los que pueden verse (los árboles son altos)
    const visible = (x, y, ancho = 2, alto = 3) => x * T - ox > -ancho * T && x * T - ox < VW + ancho * T && y * T - oy > -T && y * T - oy < VH + alto * T;
    const objs = [];
    for (const e of m.edificios) objs.push({ y: e.y + e.h, f: c => edificio(c, e, ox, oy, noche, t) });
    for (const d of m.decor) if (d.tipo !== 'nada' && d.tipo !== 'fuente-parte' && visible(d.x, d.y)) objs.push({ y: d.y + (d.tipo === 'torii' ? 0.9 : 0.5), f: c => decorar(c, d, d.x * T - ox, d.y * T - oy, t, noche) });
    for (const k of m.carteles) objs.push({ y: k.y + 0.5, f: c => cartel(c, k.x * T - ox, k.y * T - oy) });
    for (const n of m.npcs) {
      n.px ??= n.x * T; n.py ??= n.y * T;
      objs.push({ y: n.py / T + 0.6, f: c => {
        c.drawImage(spritePersona(n.pal, n.dir, this.cuadro(n)), Math.round(n.px - ox), Math.round(n.py - oy - 10));
        if (n.marca) { // globito de diálogo sobre la cabeza
          const bx = Math.round(n.px - ox + 9), by = Math.round(n.py - oy - 18 + Math.sin(t / 300 + n.ox) * 1.2);
          c.fillStyle = '#241a2e'; c.fillRect(bx - 1, by - 1, 10, 7); c.fillRect(bx + 1, by + 6, 2, 2);
          c.fillStyle = '#fff8ec'; c.fillRect(bx, by, 8, 5); c.fillRect(bx + 1, by + 5, 1, 1);
          c.fillStyle = '#e8546b';
          const k = Math.floor(t / 400) % 4;
          for (let p = 0; p < 3; p++) if (p < k) c.fillRect(bx + 1 + p * 2.5, by + 2, 1, 1);
        }
      } });
    }
    // Arky: su sombra va en la capa de atrás; él se dibuja aparte, entre las dos capas
    const ax = Math.round(j.px - ox) - (ARKY.ancho - T) / 2, ay = Math.round(j.py - oy) + 15 - ARKY.pies;
    objs.push({ y: j.py / T + 0.6, jugador: true, f: c => {
      c.fillStyle = 'rgba(24,40,20,.32)';
      c.beginPath(); c.ellipse(ax + ARKY.ancho / 2, ay + ARKY.pies, 7, 2, 0, 0, 7); c.fill();
    } });
    objs.sort((a, b) => a.y - b.y);
    const gd = this.gDelante;
    gd.clearRect(0, 0, VW, VH);
    for (const o of objs) {
      o.f(g);
      if (o.jugador) g = gd; // todo lo que sigue tapa a Arky
    }

    // mariposas (de día) y pétalos
    if (!noche) for (const b of this.mariposas) mariposa(g, Math.round(b.x - ox), Math.round(b.y - oy), t + b.f * 100, b.col);
    for (const p of this.petalos) {
      g.fillStyle = '#f7c3d0';
      g.fillRect(Math.round(p.x), Math.round(p.y), 2, 1);
      g.fillStyle = '#e8a0b4';
      g.fillRect(Math.round(p.x) + 1, Math.round(p.y) + 1, 1, 1);
    }
    // luz según la hora real
    let tinte = null;
    if (h >= 18 && h < 20) tinte = 'rgba(255,140,60,.13)';
    else if (noche) tinte = 'rgba(25,20,80,.42)';
    else if (h < 8) tinte = 'rgba(255,200,170,.1)';
    if (tinte) {
      g.fillStyle = tinte; g.fillRect(0, 0, VW, VH);
      if (noche) {
        g.globalCompositeOperation = 'lighter';
        const luz = (lx, ly, r) => {
          const gr = g.createRadialGradient(lx, ly, 2, lx, ly, r);
          gr.addColorStop(0, 'rgba(255,200,110,.35)'); gr.addColorStop(1, 'rgba(255,200,110,0)');
          g.fillStyle = gr; g.fillRect(lx - r, ly - r, r * 2, r * 2);
        };
        for (const d of m.decor) if (d.tipo === 'farol') luz(d.x * T - ox + 8, d.y * T - oy + 4, 30);
        for (const e of m.edificios) luz(e.puerta.x * T - ox + 8, e.puerta.y * T - oy + 6, 26);
        g.globalCompositeOperation = 'source-over';
      }
    }

    // componer: capa de atrás, Arky (a resolución nativa), capa de adelante y su globito
    const gv = this.gv;
    gv.imageSmoothingEnabled = false;
    gv.drawImage(this.atras, 0, 0, VW * E, VH * E);
    dibujarArky(gv, ax * E, ay * E, j.dir, !!j.mov, t, E);
    gv.drawImage(this.delante, 0, 0, VW * E, VH * E);
    const expr = this.expresionDeArky(t);
    if (expr) dibujarExpresion(gv, (ax + ARKY.ancho / 2) * E, (ay + 2) * E, expr, E);
  }

  bucle(t) {
    const dt = Math.min(50, t - this.ultimo);
    this.ultimo = t;
    this.actualizar(dt, t);
    this.dibujar(t);
    requestAnimationFrame(tt => this.bucle(tt));
  }
}
