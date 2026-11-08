# Proyectos del portfolio y código disponible

El catálogo muestra 6 proyectos, elegidos a propósito: lo que le sirve ver a quien evalúa, sin relleno. Arky enlaza a su versión en producción
en Railway, Sandō se juega desde `sando/` y los trabajos de Procesamiento de Imágenes
tienen su laboratorio en vivo. Las fichas no incluyen automáticamente el código
de los proyectos que describen.

Inventario revisado el 1 de noviembre de 2026 en la cuenta `Lauaf`:

| Proyecto o grupo | Código localizado | Enlace y revisión |
| --- | --- | --- |
| Portfolio, laboratorio de visión, versión en inglés y Sandō | Este repositorio, `index.html`, `vision.js` y `sando/` | Funciona con un servidor local. |
| Arky (cocina y finanzas, una sola ficha) | [Arky-Bites](https://github.com/Lauaf/Arky-Bites), privado | Ambos módulos unificados con el agente Arky: FastAPI, Angular 20 y Postgres. En producción en Railway: [app](https://arky-web-production.up.railway.app) (registro abierto) y [landing](https://arky-landing-production.up.railway.app/). URLs tomadas de `CHECKPOINT.md`; la red de la revisión no permitió abrirlas. |
| Arky Finances independiente | [Arky-Finances](https://github.com/Lauaf/Arky-Finances), público | Versión independiente de finanzas. La ficha de Arky enlaza a esta versión independiente y a la integrada en Arky-Bites. |
| Reconocimiento facial | [TP1_CV](https://github.com/Lauaf/TP1_CV), público | El README describe backend, Gradio, modelos y Docker Compose. La tarjeta y la ficha enlazan al repositorio público. No se ejecutó en esta revisión. |
| Razas de perros | [TP2_VC](https://github.com/Lauaf/TP2_VC), público | Ficha propia. Métricas tomadas del README del repositorio (ResNet18 ajustada: 91,6 % de accuracy en test; NDCG@10 de 0,94). Trabajo en equipo con Sebastián Palacio. No se ejecutó en esta revisión. |
| Procesamiento de imágenes | [TP_1_PDI](https://github.com/Lauaf/TP_1_PDI), [TP_2_PDI](https://github.com/Lauaf/TP_2_PDI), [TP_3_PDI](https://github.com/Lauaf/TP_3_PDI), públicos | Una ficha para los tres trabajos, dados en video incluido. Ecualización, formularios y patentes corren en `vision.js` con resultados idénticos al Python; monedas muestra el resultado del código original. Con Sebastián Palacio y Katia Otterstedt. |
| Fuera del catálogo a propósito | [TP1_Prog3](https://github.com/Lauaf/TP1_Prog3) (algoritmos de búsqueda y Minimax), las fichas genéricas de trabajo profesional (plantillas, antibiogramas), Valdor y los sprites de Arky (estos últimos siguen en el pueblo). [TP2](https://github.com/Lauaf/TP2) y [WIP-TP-CV](https://github.com/Lauaf/WIP-TP-CV) están vacíos; [tuia-dog-recognition-app](https://github.com/Lauaf/tuia-dog-recognition-app) es la plantilla de la cátedra; [facu_cosas](https://github.com/Lauaf/facu_cosas) son apuntes. | — |
| Sandō (incluye la academia de barismo) | [Sando](https://github.com/Lauaf/Sando), privado; `web/` copiado en `sando/` | Jugable en el portfolio sin servidor. Reemplaza a la ficha «Barista Learning Lab». Juego estilo GBA con dojo de japonés, cine, sala de música y academia de barismo; la demo Espresso Lab enlaza con esta ficha. Arky, de los recursos pixel art, es su protagonista. |
| Trabajo en Wiener Lab | Solo una descripción general | Una ficha con lo que hago, sin nombres de productos, módulos, clientes ni código. |

## El pueblo (`pueblo/`)

Los 6 proyectos también se recorren como un pueblo de Sandō. Cada proyecto vive
en un solo edificio (`pueblo/lugares.js`, verificado por `tests/pueblo.test.cjs`):

| Edificio | Estilo de Sandō | Proyectos |
| --- | --- | --- |
| 研究所 Laboratorio clínico | sala de música | Trabajo en Wiener Lab |
| アーキー Casa de Arky | casa | Arky |
| 喫茶店 Kissaten | café | Sandō, más «Café y barismo» (fuera del catálogo) |
| 大学 Facultad · UNR | dojo | Razas de perros, reconocimiento facial y procesamiento de imágenes |
| 工房 Estudio creativo | cine | Arky Pixel Assets (fuera del catálogo) |

## Organización elegida

El portfolio enlaza a repositorios separados. Cada aplicación conserva su
historial, configuración, dependencias y comandos de arranque.

Las tarjetas y fichas enlazan a los repositorios confirmados de Arky,
Sandō, reconocimiento facial, razas de perros y los
trabajos de Procesamiento de Imágenes. ArkyCash-e ofrece tanto la
versión independiente de finanzas como la integrada en Arky-Bites. Los enlaces
a repositorios privados lo indican antes de abrir GitHub.

El acceso al perfil de GitHub permite explorar los otros trabajos. Las fichas
sin correspondencia confirmada conservan su descripción.
Para agregar enlaces, editar `PROJECT_REPOSITORIES` en `index.html`.

GitHub almacena el código; GitHub Pages sirve el portfolio estático. Los backends Python, bases de datos y modelos de IA necesitan su propio
entorno de ejecución o un arranque local.
