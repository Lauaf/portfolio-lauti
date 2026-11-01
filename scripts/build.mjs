import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
const huella = contenido => createHash('sha256').update(contenido).digest('hex').slice(0, 10);
await mkdir(output, { recursive: true });

// Hoja de estilos y laboratorio de visión: se publican con su huella en el nombre.
const css = await readFile(path.join(root, 'styles.css'));
const styleName = `styles.${huella(css)}.css`;
const vision = await readFile(path.join(root, 'vision.js'));
const visionName = `vision.${huella(vision)}.js`;
// El catálogo lo comparten el portfolio y el pueblo: se versiona con su huella para esquivar la caché.
const catalogo = await readFile(path.join(root, 'proyectos.js'));
const version = huella(catalogo);

const html = await readFile(path.join(root, 'index.html'), 'utf8');
for (const [marca, archivo] of [['href="styles.css"', 'la hoja de estilos'], ['src="vision.js"', 'vision.js'], ['src="proyectos.js"', 'proyectos.js']]) {
  if (!html.includes(marca)) throw new Error(`Falta ${archivo} en index.html`);
}
await writeFile(path.join(output, 'index.html'), html
  .replace('href="styles.css"', `href="${styleName}"`)
  .replace('src="vision.js"', `src="${visionName}"`)
  .replace('src="proyectos.js"', `src="proyectos.js?v=${version}"`));
await writeFile(path.join(output, styleName), css);
await writeFile(path.join(output, visionName), vision);
await writeFile(path.join(output, 'proyectos.js'), catalogo);
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });

// Sandō se publica tal cual: HTML, CSS y módulos ES sin build.
await cp(path.join(root, 'sando'), path.join(output, 'sando'), { recursive: true });

// El pueblo: sus archivos llevan ?v= con la huella de todo el directorio para que una versión nueva no quede oculta.
await cp(path.join(root, 'pueblo'), path.join(output, 'pueblo'), { recursive: true });
const pueblo = await readFile(path.join(root, 'pueblo', 'index.html'), 'utf8');
const versionPueblo = huella(Buffer.concat([
  catalogo,
  await readFile(path.join(root, 'pueblo', 'pueblo.js')),
  await readFile(path.join(root, 'pueblo', 'pueblo.css')),
]));
await writeFile(path.join(output, 'pueblo', 'index.html'), pueblo.replace(/(pueblo\.(?:js|css)|proyectos\.js)"/g, `$1?v=${versionPueblo}"`));

await writeFile(path.join(output, '.nojekyll'), '');
console.log('Sitio estático listo en dist/');
