import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'dist');
await mkdir(output, { recursive: true });
const css = await readFile(path.join(root, 'styles.css'));
const styleName = `styles.${createHash('sha256').update(css).digest('hex').slice(0, 10)}.css`;
const html = await readFile(path.join(root, 'index.html'), 'utf8');
if (!html.includes('href="styles.css"')) throw new Error('Falta la hoja de estilos en index.html');
await writeFile(path.join(output, 'index.html'), html.replace('href="styles.css"', `href="${styleName}"`));
await writeFile(path.join(output, styleName), css);
await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
await writeFile(path.join(output, '.nojekyll'), '');
console.log('Sitio estático listo en dist/');
