// Arky, el protagonista: usa los PNG de web/assets/arky (no se redibuja), en su versión con los bordes
// limpios (web/assets/arky/limpio, generada con herramientas/limpiar_arky.py a partir de los originales).
// La hoja tiene celdas de 96x96: filas down, left, up, right; columnas idle, walk1..walk4.
// El motor lo dibuja en el canvas de alta resolución (4 px de pantalla por píxel del juego),
// así cada celda de 96 px ocupa 24 píxeles del juego sin achicar el dibujo.

const BASE = 'assets/arky/limpio/';
const CELDA = 96;
const CELDA_EXPR = 64;
const FILA = { 0: 0, 2: 1, 1: 2, 3: 3 }; // dir del juego (0 abajo, 1 arriba, 2 izq, 3 der) -> fila de la hoja
const FPS_CAMINAR = 7;                  // de arky.animations.json
const EXPRESIONES = { feliz: 0, enojado: 1, pensativo: 2, sorprendido: 3 }; // happy, angry, thinking, surprised

const cargar = src => { const i = new Image(); i.src = BASE + src; return i; };
const hoja = cargar('arky-spritesheet-96.png');
const caras = cargar('arky-expressions-64.png');
const lista = i => i.complete && i.naturalWidth > 0;

/** Tamaño de Arky en píxeles del juego (la celda de 96 px a escala 4). */
export const ARKY = { ancho: 24, alto: 24, pies: 23 };

/**
 * Dibuja a Arky en un contexto de alta resolución.
 * x, y: esquina superior izquierda de la celda en píxeles de pantalla; escala: px de pantalla por px del juego.
 */
export function dibujarArky(ctx, x, y, dir, caminando, t, escala) {
  if (!lista(hoja)) return;
  const col = caminando ? 1 + Math.floor(t / (1000 / FPS_CAMINAR)) % 4 : 0;
  const tam = ARKY.ancho * escala;
  ctx.imageSmoothingEnabled = tam < CELDA; // a escala exacta no se suaviza
  ctx.drawImage(hoja, col * CELDA, FILA[dir] * CELDA, CELDA, CELDA, x, y, tam, tam);
  ctx.imageSmoothingEnabled = false;
}

/** Globito con la cara de Arky (feliz|enojado|pensativo|sorprendido) centrado en cx, con la punta en y. */
export function dibujarExpresion(ctx, cx, y, expr, escala) {
  const i = EXPRESIONES[expr];
  if (i == null || !lista(caras)) return;
  const tam = Math.round(CELDA_EXPR * escala / 4), p = escala, borde = escala;
  const w = tam + p * 2, h = tam + p * 2;
  const x = Math.round(cx - w / 2), top = Math.round(y - h - p * 3);
  ctx.fillStyle = '#241a2e';
  ctx.fillRect(x - borde, top, w + borde * 2, h); ctx.fillRect(x, top - borde, w, h + borde * 2);
  ctx.fillRect(Math.round(cx - p), top + h, p * 2, p * 3);
  ctx.fillStyle = '#fff8ec';
  ctx.fillRect(x, top, w, h);
  ctx.fillRect(Math.round(cx - p + borde / 2), top + h, p, p * 2);
  ctx.imageSmoothingEnabled = tam < CELDA_EXPR;
  ctx.drawImage(caras, i * CELDA_EXPR, 0, CELDA_EXPR, CELDA_EXPR, x + p, top + p, tam, tam);
  ctx.imageSmoothingEnabled = false;
}
