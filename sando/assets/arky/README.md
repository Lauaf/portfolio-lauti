# Arky — assets PNG para usar directamente en un proyecto

Este paquete contiene **archivos gráficos reales**, no una referencia para recrear el personaje. Conservá los PNG originales y usalos directamente en el frontend. No generes/reinterpretes sprites con CSS ni SVG.

## Archivos

- `arky-spritesheet-96.png`: 20 cuadros de movimiento, 5 columnas por 4 filas, **480 × 384 px**, RGBA transparente, cada cuadro mide **96 × 96 px**.
- `arky-spritesheet-64.png`: igual pero **320 × 256 px**, con cuadros de **64 × 64 px**.
- `arky-expressions-96.png` y `arky-expressions-64.png`: emociones con 4 cuadros en una fila.
- `arky-atlas-96.json` y `arky-atlas-64.json`: atlas JSON compatible con el formato habitual de Phaser (claves con nombre y coordenadas).
- `arky.animations.json`: grupos de cuadros, secuencias y FPS.
- `sprites/96/*.png`, `sprites/64/*.png`: cada pose como PNG individual transparente, por nombre.
- `preview.html`: vista interactiva local para ver a Arky animado en cuatro direcciones y sus expresiones.

## Orden de la hoja (izquierda a derecha)

Columnas: `idle`, `walk1`, `walk2`, `walk3`, `walk4`.

Filas: `down`, `left`, `up`, `right`.

Índices: `down = 0–4`, `left = 5–9`, `up = 10–14`, `right = 15–19`.

## Uso con Canvas / Angular (TypeScript)

```ts
const img = new Image();
img.src = '/assets/arky/arky-spritesheet-96.png';

const cell = 96;
const row = 0; // down=0, left=1, up=2, right=3
const col = 1; // idle=0, walk1..4=1..4

function drawArky(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, col * cell, row * cell, cell, cell, x, y, 96, 96);
}
```

### CSS spritesheet en Angular

```css
.arky {
  width: 96px;
  height: 96px;
  background-image: url('/assets/arky/arky-spritesheet-96.png');
  background-position: 0 0;
  image-rendering: pixelated;
}
```

Para el estado `right_walk2`, la celda es columna 2, fila 3, por lo que `background-position: -192px -288px;`. Para animar, actualizá background-position por cuadro con JavaScript o TypeScript; no uses `steps(4)` sobre la hoja completa porque saltaría entre filas.

## Limitaciones

Los sprites se extrajeron de una ilustración generada, y algunos cuadros tienen variaciones leves de diseño o desplazamiento. Son útiles para prototipos e interfaces, pero conviene revisar los cuadros si se requiere animación de videojuegos precisa frame a frame.
