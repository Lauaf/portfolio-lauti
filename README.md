# Lautaro Florenza — Portfolio

Portfolio estático en español con catálogo de 20 proyectos/módulos y 6 demos interactivas (BFS/DFS/UCS/A*, HL7, WHONET conceptual, Minimax, plantillas, espresso).

**Portfolio publicado:** [lauaf.github.io/portfolio-lauti](https://lauaf.github.io/portfolio-lauti/).

Las seis demos arrancan juntas con el portfolio. Los proyectos completos conservan
sus repositorios separados: las tarjetas y las fichas enlazan a Arky-Bites,
Arky-Finances, TP1_CV y TP1_Prog3. Los enlaces privados están identificados.
El acceso «Mi GitHub» permite explorar los demás repositorios.
Ver el [inventario de proyectos](docs/proyectos.md).

## Diseño y relato

Una dirección visual wabi-sabi: papel cálido, oliva, arcilla, tipografía serif,
textura sutil y fotografía editorial. El relato conecta la curiosidad desde la
infancia, el año de Working Holiday en Japón, el trabajo en Wiener Lab, la carrera
de IA en la UNR y los intereses personales: café, mundos narrativos, música y
otras formas de crear.

- `index.html`: relato, catálogo y lógica de las seis demos.
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
catálogo, las fichas y las seis demos.

```bash
npm test       # regresiones de inicio, filtros, búsqueda, grilla, WHONET y Minimax
npm run build  # genera dist/ con el sitio estático
```

El repositorio incluye verificaciones en cada push y pull request. Las pruebas
usan un DOM mínimo para comprobar la lógica y no sustituyen una prueba visual
en navegador. Las seis demos también fueron comprobadas manualmente en navegador.

## Abrir

Abrí `index.html` en Chrome, Firefox o Edge. No necesita servidor ni instalaciones.

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
