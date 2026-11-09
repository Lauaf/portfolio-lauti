# Lautaro Florenza — Portfolio

Portfolio estático con un catálogo de 6 proyectos elegidos, un laboratorio de visión con los trabajos
de Procesamiento de Imágenes, Sandō jugable en `sando/` y enlaces a Arky en producción.
Incluye una versión en inglés para reclutadores en [`en/`](en/) y el CV en PDF.

**Portfolio publicado:** [lauaf.github.io/portfolio-lauti](https://lauaf.github.io/portfolio-lauti/) · en inglés: [lauaf.github.io/portfolio-lauti/en](https://lauaf.github.io/portfolio-lauti/en/).

**Dos maneras de ver los proyectos.** La clásica (catálogo con filtros y fichas) y
una interactiva en [`pueblo/`](pueblo/): el portfolio como un pueblo de Sandō,
donde cada edificio es una parte del trabajo —el laboratorio clínico, la casa de
Arky, el kissaten, la facultad y el estudio creativo— y la fuente de la plaza es
«Sobre mí». Se entra con el botón «三道 Un vistazo a los proyectos». Los proyectos completos conservan
sus repositorios separados: las tarjetas y las fichas enlazan a Arky-Bites,
Arky-Finances, Sando, TP1_CV, TP2_VC, TP1_Prog3 y los tres trabajos de
Procesamiento de Imágenes (TP_1_PDI, TP_2_PDI y TP_3_PDI). Los enlaces privados están identificados.
El acceso «Mi GitHub» permite explorar los demás repositorios.
Ver el [inventario de proyectos](docs/proyectos.md).

## Diseño y relato

Papel cálido, oliva, arcilla y tipografía serif, con un tono directo: la portada
dice qué hago y lleva a Arky en producción, y después vienen los proyectos, la
experiencia, el laboratorio de visión y un apartado corto sobre Japón. Los textos
decorativos y la foto editorial de la versión anterior se quitaron porque no le
decían nada a quien evalúa.

- `index.html`: portada, catálogo, experiencia, laboratorio de visión y Japón.
- `en/index.html`: la misma página traducida al inglés, con las mismas secciones y el
  mismo catálogo. Usa los archivos de la raíz (`../styles.css`, `../catalogo.js`…).
  **Si cambiás un texto de `index.html`, cambialo también acá**; una prueba verifica
  que las dos tengan las mismas secciones y el mismo catálogo.
- `catalogo.js`: catálogo, fichas y laboratorio para los dos idiomas. Elige idioma y
  rutas según el `lang` de la página; los datos de cada idioma están en `proyectos.js`
  (`PROYECTOS` y `CATALOGO_EN`). `vision.js` traduce su interfaz de la misma forma.
- `cv/cv.html`: fuente del CV. `node cv/render.cjs` (requiere Playwright con
  Chromium) genera `assets/cv/Lautaro_Florenza_CV.pdf`, que enlazan ambas versiones.
- `vision.js`: laboratorio de visión. Porta a JavaScript, sin dependencias, la
  ecualización local, la validación de formularios, la segmentación de patentes
  y la detección de dados en video de los TP de Procesamiento de Imágenes. Las
  pruebas comparan sus salidas con las del código Python original
  (`tests/fixtures`). El conteo de monedas usa Canny y Hough, que no se
  portaron: muestra el resultado generado por el código original.
- `assets/pdi/`: imágenes y videos de esos trabajos. Los videos se marcaron como
  BT.601 (sin recomprimir) para que el navegador los decodifique con los mismos
  colores que OpenCV.
- `proyectos.js`: el catálogo y los enlaces, compartidos por el portfolio y el pueblo.
- `pueblo/`: la versión interactiva. Reutiliza el motor, el arte y a Arky de
  `sando/js` sin modificarlos (`<base href="../sando/">` resuelve sus recursos).
  El menú es el camino principal: elegir un lugar hace que Arky camine solo hasta
  la puerta (BFS sobre el mapa) y abre la ficha de cada proyecto con capturas,
  esquemas y enlaces al laboratorio de visión (`index.html#demo=vision/dados`). También se camina con
  las flechas o tocando el mapa. `lugares.js` define qué proyecto vive en cada
  edificio y sus ejemplos visuales; las pruebas verifican que el catálogo entero
  esté ubicado y que cada imagen exista.
- `assets/pueblo/`: capturas de Sandō, páginas de la presentación
  de Arky y gráficos de los TP de visión. Lo profesional se muestra con
  recreaciones y esquemas rotulados como tales, nunca con pantallas internas.
  Del TP de reconocimiento facial solo se usan gráficos, no las fotos de personas.
- `sando/`: copia de `web/` del repositorio privado Sando. Funciona sin su
  servidor: el progreso queda en el navegador; la IA local, el cine y la
  importación de canciones necesitan `server.py`. Para actualizarlo, volver a
  copiar esa carpeta.
- `styles.css`: sistema visual y adaptación a escritorio y celular.
- [Notas del diseño y recurso visual](docs/diseno.md).

El build publica la hoja de estilos con una huella de su contenido en el nombre,
para que las nuevas versiones no queden ocultas por la caché del navegador.

## Clonar y levantar todo lo incluido

Requisitos: Python 3.10 o superior. Para los comandos npm y las pruebas: Node.js 20 o superior.

```bash
git clone https://github.com/Lauaf/portfolio-lauti.git
cd portfolio-lauti
python servir.py
```

También podés usar `npm start` o `npm run dev`. No hace falta `npm install`:
el proyecto no tiene dependencias npm.

Abrí [http://localhost:8080](http://localhost:8080). El mismo servidor sirve el
catálogo, las fichas, la versión en inglés, el laboratorio de visión y Sandō.

```bash
npm test       # regresiones del portfolio y del laboratorio de visión contra el Python original
npm run build  # genera dist/ con el sitio estático
```

El repositorio incluye verificaciones en cada push y pull request. Las pruebas
usan un DOM mínimo para comprobar la lógica y no sustituyen una prueba visual
en navegador. El laboratorio de visión (incluidas las cuatro tiradas de dados) y Sandō también se comprobaron en un navegador.

## Abrir

Abrí `index.html` en Chrome, Firefox o Edge para ver el relato y el catálogo sin
instalar nada. Sandō y el laboratorio de visión necesitan
servirse por HTTP: los navegadores bloquean los módulos y la lectura de píxeles
desde `file://`.

Para servirlo localmente:

```bash
python servir.py
```

Después ingresá a http://localhost:8080. El servidor escucha solo en esta computadora y desactiva la caché para que las correcciones se vean al recargar. Para detenerlo, presioná Ctrl+C en la terminal donde lo iniciaste.

## Cambios del 8 de noviembre de 2026

- Se quitaron las seis demos simplificadas (búsqueda, HL7, antibiogramas, Minimax, plantillas y espresso). Queda el laboratorio de visión.
- El trabajo profesional se describe sin nombres internos.
- Se agregaron la versión en inglés (`en/`) y el CV en PDF.
- La versión en inglés pasa a ser la misma página traducida (antes era otra página distinta), con el catálogo y el laboratorio de visión también en inglés.
- Portada y textos más directos: qué hago, Arky en producción, experiencia y contacto. Sin la foto editorial ni las frases decorativas.
- El catálogo pasa de 15 a 6 proyectos: Arky en una sola ficha, el trabajo profesional en una sola ficha, y fuera las fichas genéricas que no sumaban.
- Las tarjetas y fichas muestran imágenes: escenas del video de Arky en el idioma de cada versión, capturas reales de los TP e ilustraciones propias para el trabajo profesional.

## Publicar

Podés colocar el contenido en GitHub Pages, Netlify, Cloudflare Pages o Vercel como sitio estático. No incluye servicios backend ni credenciales.

Para GitHub Pages, seleccioná **Settings → Pages → Source → GitHub Actions**
y ejecutá **Actions → Publicar portfolio en GitHub Pages → Run workflow**.
El workflow publica únicamente `dist/`; no publica archivos de configuración,
documentación ni el servidor local. La publicación es manual.

Este repositorio es público y publica el sitio con GitHub Pages. Los proyectos
enlazados conservan su propia configuración de acceso; Arky-Bites sigue siendo
privado.

## Personalizar

- Editá el texto de la sección inicial en `index.html`.
- Modificá el arreglo `P` dentro del `<script>` para cambiar proyectos, estados y tecnologías.
- Editá `PROJECT_REPOSITORIES` para agregar o actualizar los enlaces de cada ficha.
- Si cambia el CV, editá `cv/cv.html`, regenerá el PDF y revisá que `en/index.html` diga lo mismo.

**Importante:** el trabajo en Wiener Lab se describe solo como tipos de desarrollo, sin nombres de productos, módulos, clientes, código ni datos internos.
