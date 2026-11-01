# Lautaro Florenza — Portfolio

Portfolio estático en español con catálogo de 23 proyectos/módulos 7 demos interactivas (BFS/DFS/UCS/A*, HL7, WHONET conceptual, Minimax, plantillas, espresso
y un laboratorio de visión con los trabajos de Procesamiento de Imágenes), Sandō jugable en
`sando/` y enlaces a Arky en producción.

**Portfolio publicado:** [lauaf.github.io/portfolio-lauti](https://lauaf.github.io/portfolio-lauti/).

Las siete demos y Sandō arrancan juntos con el portfolio.

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

Una dirección visual wabi-sabi: papel cálido, oliva, arcilla, tipografía serif,
textura sutil y fotografía editorial. El relato conecta la curiosidad desde la
infancia, el año de Working Holiday en Japón, el trabajo en Wiener Lab, la carrera
de IA en la UNR y los intereses personales: café, mundos narrativos, música y
otras formas de crear.

- `index.html`: relato, catálogo y lógica de las demos.
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
  esquemas y enlaces a las demos (`index.html#demo=hl7`). También se camina con
  las flechas o tocando el mapa. `lugares.js` define qué proyecto vive en cada
  edificio y sus ejemplos visuales; las pruebas verifican que el catálogo entero
  esté ubicado y que cada imagen exista.
- `assets/pueblo/`: capturas de Sandō y de las demos, páginas de la presentación
  de Arky y gráficos de los TP de visión. Lo profesional se muestra con
  recreaciones y esquemas rotulados como tales, nunca con pantallas internas.
  Del TP de reconocimiento facial solo se usan gráficos, no las fotos de personas.
- `sando/`: copia de `web/` del repositorio privado Sando. Funciona sin su
  servidor: el progreso queda en el navegador; la IA local, el cine y la
  importación de canciones necesitan `server.py`. Para actualizarlo, volver a
  copiar esa carpeta.
- `styles.css`: sistema visual y adaptación a escritorio y celular.
- `assets/quiet-study.webp`: imagen editorial optimizada, sin dependencias remotas.
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
catálogo, las fichas, las demos, el laboratorio de visión y Sandō.

```bash
npm test       # regresiones del portfolio y del laboratorio de visión contra el Python original
npm run build  # genera dist/ con el sitio estático
```

El repositorio incluye verificaciones en cada push y pull request. Las pruebas
usan un DOM mínimo para comprobar la lógica y no sustituyen una prueba visual
en navegador. Las demos, el laboratorio de visión (incluidas las cuatro tiradas de dados) y Sandō también se comprobaron en un navegador.

## Abrir

Abrí `index.html` en Chrome, Firefox o Edge para ver el relato, el catálogo y las
primeras seis demos sin instalar nada. Sandō y el laboratorio de visión necesitan
servirse por HTTP: los navegadores bloquean los módulos y la lectura de píxeles
desde `file://`.

Para servirlo localmente:

```bash
python servir.py
```

Después ingresá a http://localhost:8080. El servidor escucha solo en esta computadora y desactiva la caché para que las correcciones se vean al recargar. Para detenerlo, presioná Ctrl+C en la terminal donde lo iniciaste.

## Correcciones y verificación (1 de noviembre de 2026)

- Corregido `TypeError: p.slice is not a function`, que interrumpía el inicio y dejaba vacíos el catálogo y los tableros. Se conserva el índice original de cada proyecto al filtrar, para que las fichas abran el caso correcto.
- La grilla inicial de búsqueda tiene una ruta válida. Editar paredes borra las métricas anteriores.
- WHONET rechaza resultados vacíos, normaliza S/I/R y limpia saltos de línea de las columnas exportadas. La copia de TXT informa éxito o permite copiar manualmente si el navegador no ofrece portapapeles.
- Probados en navegador: las cinco categorías, búsqueda con y sin resultados, fichas y enlaces a demos; BFS, DFS, UCS y A* con y sin ruta; parsing HL7; exportación CMI/halo/SIR y copia de TXT; partida completa, empate y reinicio en Minimax; variables y estilos de plantillas; controles y extracción en Espresso Lab.
- La versión corregida no produjo nuevos errores de JavaScript durante estas pruebas. No requiere instalación de dependencias.

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
- Reemplazá las demos simplificadas por enlaces o integraciones de proyectos reales cuando tengas repositorios y permisos.
- Agregá capturas, enlaces de código, información de contacto y CV antes de publicarlo.

**Importante:** los proyectos laborales se presentan a nivel conceptual con datos ficticios. Los estados, las fechas y la atribución individual deben verificarse. Las demos nuevas no se deben presentar como entregas originales universitarias.
