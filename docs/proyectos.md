# Proyectos del portfolio y código disponible

El catálogo describe 15 proyectos. Arky enlaza a su versión en producción
en Railway, Sandō se juega desde `sando/` y los trabajos de Procesamiento de Imágenes
tienen su laboratorio en vivo. Las fichas no incluyen automáticamente el código
de los proyectos que describen.

Inventario revisado el 1 de noviembre de 2026 en la cuenta `Lauaf`:

| Proyecto o grupo | Código localizado | Enlace y revisión |
| --- | --- | --- |
| Portfolio, laboratorio de visión, versión en inglés y Sandō | Este repositorio, `index.html`, `vision.js` y `sando/` | Funciona con un servidor local. |
| ArkyBites, ArkyCash-e y Arky AI | [Arky-Bites](https://github.com/Lauaf/Arky-Bites), privado | Ambos módulos unificados con el agente Arky: FastAPI, Angular 20 y Postgres. En producción en Railway: [app](https://arky-web-production.up.railway.app) (registro abierto) y [landing](https://arky-landing-production.up.railway.app/). URLs tomadas de `CHECKPOINT.md`; la red de la revisión no permitió abrirlas. |
| Arky Finances independiente | [Arky-Finances](https://github.com/Lauaf/Arky-Finances), público | Versión independiente de finanzas. La ficha de ArkyCash-e enlaza a esta versión independiente y a la integrada en Arky-Bites. |
| Algoritmos y tres en raya | [TP1_Prog3](https://github.com/Lauaf/TP1_Prog3), público | Contiene `tp-pathfinding` (BFS, DFS, UCS, GBFS y A*) y `tp-tateti` (Minimax). `tp-tsp` sigue siendo la plantilla de la cátedra, por eso la ficha no lo menciona. Son proyectos separados de las demos educativas del portfolio. |
| Reconocimiento facial | [TP1_CV](https://github.com/Lauaf/TP1_CV), público | El README describe backend, Gradio, modelos y Docker Compose. La tarjeta y la ficha enlazan al repositorio público. No se ejecutó en esta revisión. |
| Razas de perros | [TP2_VC](https://github.com/Lauaf/TP2_VC), público | Ficha propia. Métricas tomadas del README del repositorio (ResNet18 ajustada: 91,6 % de accuracy en test; NDCG@10 de 0,94). Trabajo en equipo con Sebastián Palacio. No se ejecutó en esta revisión. |
| Visión clásica con OpenCV | [TP_1_PDI](https://github.com/Lauaf/TP_1_PDI), [TP_2_PDI](https://github.com/Lauaf/TP_2_PDI), públicos | Una ficha para ambos trabajos. Ecualización, formularios y patentes corren en `vision.js` con resultados idénticos al Python; monedas muestra el resultado del código original. Con Sebastián Palacio y Katia Otterstedt. |
| Dados en video | [TP_3_PDI](https://github.com/Lauaf/TP_3_PDI), público | Corre en `vision.js`: en las cuatro tiradas elige el mismo cuadro y cuenta los mismos puntos que el Python. Con Sebastián Palacio y Katia Otterstedt. |
| Sin incluir | [TP2](https://github.com/Lauaf/TP2) y [WIP-TP-CV](https://github.com/Lauaf/WIP-TP-CV) están vacíos; [tuia-dog-recognition-app](https://github.com/Lauaf/tuia-dog-recognition-app) es la plantilla de la cátedra; [facu_cosas](https://github.com/Lauaf/facu_cosas) son apuntes. | — |
| Arky AI | [Arky-DM](https://github.com/Lauaf/Arky-DM), privado, es un proyecto relacionado | Confirmar qué versión corresponde al asistente descrito en el portfolio. |
| Sandō (incluye la academia de barismo) | [Sando](https://github.com/Lauaf/Sando), privado; `web/` copiado en `sando/` | Jugable en el portfolio sin servidor. Reemplaza a la ficha «Barista Learning Lab». Juego estilo GBA con dojo de japonés, cine, sala de música y academia de barismo; la demo Espresso Lab enlaza con esta ficha. Arky, de los recursos pixel art, es su protagonista. |
| Valdor | No localizado | Falta su carpeta o repositorio. |
| Trabajo profesional en Wiener Lab | Solo descripciones generales | Se describen tipos de desarrollo, sin nombres de productos, módulos, clientes ni código. |

## El pueblo (`pueblo/`)

Los 15 proyectos también se recorren como un pueblo de Sandō. Cada proyecto vive
en un solo edificio (`pueblo/lugares.js`, verificado por `tests/pueblo.test.cjs`):

| Edificio | Estilo de Sandō | Proyectos |
| --- | --- | --- |
| 研究所 Laboratorio clínico | sala de música | Los 4 tipos de trabajo profesional en Wiener Lab |
| アーキー Casa de Arky | casa | Arky AI, ArkyBites, ArkyCash-e |
| 喫茶店 Kissaten | café | Sandō, más «Café y barismo» (fuera del catálogo) |
| 大学 Facultad · UNR | dojo | Los 5 trabajos de la universidad |
| 工房 Estudio creativo | cine | Arky Pixel Assets, Valdor |

## Organización elegida

El portfolio enlaza a repositorios separados. Cada aplicación conserva su
historial, configuración, dependencias y comandos de arranque.

Las tarjetas y fichas enlazan a los repositorios confirmados de ArkyBites,
ArkyCash-e, Sandō, reconocimiento facial, razas de perros, algoritmos y los
trabajos de Procesamiento de Imágenes. ArkyCash-e ofrece tanto la
versión independiente de finanzas como la integrada en Arky-Bites. Los enlaces
a repositorios privados lo indican antes de abrir GitHub.

El acceso al perfil de GitHub permite explorar los otros trabajos. Las fichas
sin correspondencia confirmada conservan su descripción.
Para agregar enlaces, editar `PROJECT_REPOSITORIES` en `index.html`.

GitHub almacena el código; GitHub Pages sirve el portfolio estático. Los backends Python, bases de datos y modelos de IA necesitan su propio
entorno de ejecución o un arranque local.
